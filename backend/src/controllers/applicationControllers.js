import errorHandler from "express-async-handler";
import Application from "../models/applications.js";
import Employer from "../models/employer.js";
import Job from "../models/jobs.js";
import User from "../models/users.js";
import sendEmail from "../utils/sendEmail.js";
import { logActivity } from '../utils/activitytrigger.js';

export const createApplication = errorHandler(async (req, res) => {
  // FACT: Extract the new screeningAnswers array
  const { jobId, message, screeningAnswers } = req.body;
  const userId = req.user?._id; 

  if (!userId) {
    res.status(401);
    throw new Error("Unauthorized: User not logged in");
  }

  if (!jobId) {
    res.status(400);
    throw new Error("Job ID is required");
  }

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.postedBy.toString() === userId.toString()) {
    res.status(400);
    throw new Error("You cannot apply to your own job");
  }

  const existingApplication = await Application.findOne({
    job_id: jobId,
    appliedBy: userId,
  });
  
  if (existingApplication) {
    res.status(400);
    throw new Error("You have already applied for this job");
  }

  // FACT: Verify that if the job has questions, the candidate answered them
  if (job.screeningQuestions && job.screeningQuestions.length > 0) {
    if (!screeningAnswers || screeningAnswers.length !== job.screeningQuestions.length) {
      res.status(400);
      throw new Error("Please answer all the required screening questions.");
    }
  }

  const application = await Application.create({
    job_id: jobId,
    jobHost: job.postedBy,
    appliedBy: userId,
    applicantMessage: message || "", 
    screeningAnswers: screeningAnswers || [], 
  });

  await Job.updateOne({ _id: jobId }, { $addToSet: { applicants: userId } });

  await User.findByIdAndUpdate(userId, { $addToSet: { appliedJobs: jobId } }, { new: true });

  // FACT: Log the application event for the Jobseeker
  await logActivity(userId, 'apply', jobId).catch(e => console.error("Audit log failed", e));

  res.status(201).json({ success: true, message: "Application submitted successfully", application });
});
export const allApplicationFromUser = errorHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all applications by this user
  const applications = await Application.find({ appliedBy: userId })
    .populate({
      path: "job_id",
      model: Job,
      populate: {
        path: "postedBy",
        select: "name email profileImage",
      },
    })
    .populate("jobHost", "name email profileImage");

  // FACT: Do not throw a 404 error if they have no applications. 
  // Return an empty array cleanly so the frontend triggers the "No Applications Yet" UI instead of a network error.
  if (!applications || applications.length === 0) {
    return res.status(200).json({ success: true, count: 0, applications: [] });
  }

  // FACT: The filter() method prevents the 500 crash by completely ignoring applications where the job was deleted by the employer.
  const formatted = applications
    .filter((app) => app.job_id != null) 
    .map((app) => ({
      applicationId: app._id,
      status: app.status,
      employerMessage: app.employerMessage || "", 
      meetingLink: app.meetingLink || "", 
      rescheduleRequest: app.rescheduleRequest || {}, // Sent to frontend so candidate knows if reschedule is pending
      applicantMessage: app.applicantMessage || "",
      screeningAnswers: app.screeningAnswers || [],
      applicantHasSeen: app.applicantHasSeen,
      appliedAt: app.appliedAt || app.createdAt,
      job: {
        ...(app.job_id.toObject ? app.job_id.toObject() : app.job_id),
        id: app.job_id._id,
        postedBy: {
          id: app.job_id.postedBy?._id,
          name: app.job_id.postedByName || app.job_id.postedBy?.name,
          image: app.job_id.postedByImage || app.job_id.postedBy?.profileImage,
        },
      },
    }));

  res.status(200).json({
    success: true,
    count: formatted.length,
    applications: formatted,
  });
});

// PATCH: /api/applications/:id
export const updateApplicationStatus = errorHandler(async (req, res) => {
  const { id } = req.params;
  const { status, employerMessage, meetingLink } = req.body; // <-- EXTRACT meetingLink

  const application = await Application.findById(id)
    .populate("appliedBy", "name email")
    .populate("job_id", "title postedByCompany postedByName isThirdPartyRecruiting showHiringCompanyName hiringCompanyName");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (application.jobHost.toString() !== req.employerId.toString()) {
     res.status(403);
     throw new Error("Not authorized to update this application");
  }

  application.status = status;
  if (employerMessage !== undefined) application.employerMessage = employerMessage;
  if (meetingLink !== undefined) application.meetingLink = meetingLink; 
  application.applicantHasSeen = false;
  await application.save();

  // FACT: Log that the employer interacted with the candidate
  await logActivity(req.employerId, 'message', application.appliedBy._id).catch(e => console.error("Audit log failed", e));
  try {
    const userEmail = application.appliedBy.email;
    const userName = application.appliedBy.name;
    const jobTitle = application.job_id.title;

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Application Update</h2>
        <p style="color: #334155; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
        <p style="color: #334155; font-size: 16px;">Your application for the <strong>${jobTitle}</strong> role has been updated to: <strong style="color: #4f46e5; text-transform: uppercase;">${status}</strong>.</p>
        
        ${employerMessage ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 5px;">
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: bold;">Message from the Employer:</p>
            <p style="color: #1e293b; font-size: 15px; white-space: pre-wrap;">${employerMessage}</p>
          </div>
        ` : ''}

        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">Log in to your JobOne dashboard to view more details.</p>
      </div>
    `;

    await sendEmail({
      email: userEmail,
      subject: `Update on your application for ${jobTitle}`,
      html: emailHTML,
    });

    
  } catch (emailError) {
    console.error("Critical: Status updated, but email failed to send.", emailError);
  }

  res.status(200).json({ message: "Status updated successfully", application });
});

export const getJobApplications = errorHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.postedBy.toString() !== req.employerId.toString()) {
    res.status(403);
    throw new Error("Not authorized to view these applications");
  }

  const applications = await Application.find({ job_id: jobId })
    .populate("appliedBy", "name email phone profilePicture skills experience education resume")
    .sort({ appliedAt: -1 });

  res.status(200).json(applications);
});

export const markApplicationAsSeen = errorHandler(async (req, res) => {
  const { id } = req.params;
  const application = await Application.findOneAndUpdate(
    { _id: id, appliedBy: req.user._id },
    { applicantHasSeen: true },
    { new: true }
  );

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  res.status(200).json({ success: true });
});




export const requestInterviewReschedule = errorHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, proposedTime } = req.body;
  const userId = req.user._id;

  const application = await Application.findOne({ _id: id, appliedBy: userId })
    .populate("job_id", "title postedByCompany postedByName isThirdPartyRecruiting showHiringCompanyName hiringCompanyName")
    .populate("jobHost", "email name")
    .populate("appliedBy", "name");

  if (!application || application.status !== "Interview Scheduled") {
    res.status(400);
    throw new Error("You can only reschedule active interviews.");
  }

  // FACT: Save structured request to the DB
  application.rescheduleRequest = {
    isRequested: true,
    reason,
    proposedTime,
    requestStatus: "pending"
  };
  await application.save();

  // Email to Employer
  try {
    await sendEmail({
      email: application.jobHost.email,
      subject: `Reschedule Request: ${application.appliedBy.name} for ${application.job_id.title}`,
      html: `<h2>Interview Reschedule Request</h2>
             <p>Candidate <strong>${application.appliedBy.name}</strong> requested a new time.</p>
             <p><strong>Reason:</strong> ${reason}</p>
             <p><strong>Proposed Time:</strong> ${proposedTime}</p>
             <p>Log in to your Employer Dashboard to Approve or Reject this request.</p>`
    });
  } catch (err) { console.error("Email failed", err); }

  res.status(200).json({ success: true, message: "Request sent." });
});

// --- 2. NEW: EMPLOYER APPROVES OR REJECTS ---
export const respondToRescheduleRequest = errorHandler(async (req, res) => {
  const { id } = req.params;
  const { action, employerMessage } = req.body; // action must be "approved" or "rejected"

  const application = await Application.findById(id).populate("appliedBy", "name email").populate("job_id", "title postedByCompany postedByName isThirdPartyRecruiting showHiringCompanyName hiringCompanyName");

  if (!application || application.jobHost.toString() !== req.employerId.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  application.rescheduleRequest.requestStatus = action;
  
  if (employerMessage) {
    application.employerMessage = employerMessage;
  }
  
  application.applicantHasSeen = false;
  await application.save();

  // Email to Candidate
  try {
    await sendEmail({
      email: application.appliedBy.email,
      subject: `Interview Reschedule ${action.toUpperCase()}`,
      html: `<h2>Reschedule Request ${action.toUpperCase()}</h2>
             <p>The employer has <strong>${action}</strong> your proposed time for the ${application.job_id.title} interview.</p>
             ${employerMessage ? `<p><strong>Message from employer:</strong><br/>${employerMessage}</p>` : ''}
             <p>Check your dashboard for details.</p>`
    });
  } catch (err) { console.error("Email failed", err); }

  res.status(200).json({ success: true, application });
});