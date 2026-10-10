import expressAsyncHandler from "express-async-handler";
import Job from "../models/jobs.js";
import User from "../models/users.js";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import Employer from "../models/employer.js";
import Application from "../models/applications.js";
import jwt from "jsonwebtoken";


export const createJob = expressAsyncHandler(async (req, res) => {
  const employer = await Employer.findById(req.employerId);
  if (!employer) throw new Error('Employer not found');

  // FACT: Enforce freeze at the controller level
  if (employer.isFrozen) {
    res.status(403);
    throw new Error("Your account is frozen. You cannot post new jobs.");
  }

  if (employer.isApproved !== "approved") {
    res.status(403);
    throw new Error("Your account is pending admin approval.");
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  // Duplicate employer check removed

  // FACT: The Ultimate Backend Lock.
  // Even if a user bypasses your React frontend using Postman, the server will instantly reject the job creation.
  if (employer.isApproved !== "approved") {
    res.status(403);
    throw new Error("Your account is currently pending admin approval. You cannot post jobs at this time.");
  }

  // Strict Profile Check
  // ==========================================
  // FACT: Dynamic Profile & Document Check 
  // ==========================================
  let missingFields = [];
  
  // Universal required fields
  const baseFields = ['phone', 'location', 'industry', 'description', 'aadharCard', 'panCard'];
  baseFields.forEach(field => {
    if (!employer[field] || employer[field].trim() === '') missingFields.push(field);
  });

  // Conditional required fields based on entity type
  if (employer.employerType === "company") {
    const companyFields = ['companyName', 'natureOfBusiness', 'gstForm'];
    companyFields.forEach(field => {
      if (!employer[field] || employer[field].trim() === '') missingFields.push(field);
    });
  } else {
    // Individual
    const individualFields = ['tradeLicense', 'educationDocuments'];
    individualFields.forEach(field => {
      if (!employer[field] || employer[field].trim() === '') missingFields.push(field);
    });
  }

  if (missingFields.length > 0) {
    res.status(403);
    throw new Error(`You must complete your profile and upload required documents before posting a job. Missing: ${missingFields.join(', ')}`);
  }

  const { 
    title, industry, subdomain, jobSummary, keyResponsibilities, jobType, workDaysPattern, customWorkDaysDescription,
    skillsRequired, salaryMin, salaryMax, salaryFrequency, salaryCurrency, incentives, 
    screeningQuestions, requestedDocuments, durationType, startDate, endDate, isFlexibleDuration,
    shifts, isFlexibleShifts, mode, noOfDays, noOfPeopleRequired, 
    genderPreference, qualifications, courses, ageLimit, languages, experience,
    pinCode, location, useOfficeLocation ,applicationDeadline,
    isThirdPartyRecruiting, hiringCompanyName, showHiringCompanyName,
  } = req.body;

  let locationData;
  if (useOfficeLocation) {
    if (!employer.officeLocation || !employer.officeLocation.coordinates) {
      res.status(400);
      throw new Error("Your profile does not have a valid Office Location saved. Please update your profile or pick a location manually.");
    }
    locationData = employer.officeLocation;
  } else if (location && location.type === 'Point') {
    locationData = location;
  } else {
    if (mode && (mode.includes('Work from office') || mode.includes('Work from field'))) {
        res.status(400);
        throw new Error("Please pick a location on the map or select 'Same as office location'.");
    }
    locationData = { type: 'Point', coordinates: [0, 0], address: "Remote" };
  }

  const { jobFeatures } = req.body;

  const newJob = new Job({
    title, 
    industry, // <-- ADDED
    subdomain, // <-- ADDED
    jobSummary, 
    keyResponsibilities,
    jobType,
    workDaysPattern,
    jobFeatures,
    customWorkDaysDescription: workDaysPattern === "Custom" ? customWorkDaysDescription : "",
    skillsRequired, 
    salaryMin,      // <-- REPLACED salaryAmount WITH THIS
    salaryMax,      // <-- REPLACED salaryAmount WITH THIS
    salaryFrequency,
    salaryCurrency,
    incentives,
    screeningQuestions,
    requestedDocuments: requestedDocuments || [],
    durationType, 
    startDate, 
    endDate,
      isFlexibleDuration,
    applicationDeadline,
    isThirdPartyRecruiting: isThirdPartyRecruiting || false,
    hiringCompanyName: hiringCompanyName || "",
    showHiringCompanyName: showHiringCompanyName || false,
    shifts: isFlexibleShifts ? [] : shifts, 
    isFlexibleShifts,
    mode, 
    noOfDays, 
    noOfPeopleRequired, 
    genderPreference, 
    qualifications,
    courses,
    ageLimit,
    languages,
      experience,
    pinCode,
    location: locationData,
    
    // FACT: Jobs no longer go live automatically. They are forced into the pending state for Admin review.
    status: "pending_approval", 
    
    postedBy: req.employerId,
    postedByName: employer.name, 
    postedByImage: employer.profilePicture || '', 
    postedByCompany: employer.companyName,
  });

  const savedJob = await newJob.save();
  employer.createdJobs.push(savedJob._id);
  await employer.save();
  
  res.status(201).json(savedJob);
});


export const getJob = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job ID format" });
  }

  const job = await Job.findById(id);
  
  if (!job) return res.status(404).json({ message: "Job not found" });

  // FACT: If the job is active, anyone can view it.
  if (job.status === "active") {
    return res.status(200).json(job);
  }

  // FACT: If the job is NOT active, we manually check if the requester is the owning employer.
  let isOwner = false;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.employer && decoded.employer.id === job.postedBy.toString()) {
        isOwner = true;
      }
    } catch (error) {
      // Ignore token errors for public viewing attempts
    }
  }

  if (!isOwner) {
    return res.status(403).json({ message: "This job is currently under review or closed and cannot be viewed publicly." });
  }

  res.status(200).json(job);
});




export const getJobs = expressAsyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const filters = {};

  if (queryObj.title) {
    filters.title = { $regex: queryObj.title, $options: 'i' };
  }
  if (queryObj.location) {
    filters.location = { $regex: queryObj.location, $options: 'i' };
  }
  if (queryObj.jobType) {
    filters.jobType = queryObj.jobType;
  }
  if (queryObj.status) {
    filters.status = queryObj.status;
  }
  // FACT: Added Backend filtering for Industry and Subdomain
  if (queryObj.industry) {
    filters.industry = queryObj.industry;
  }
  if (queryObj.subdomain) {
    filters.subdomain = queryObj.subdomain;
  }
  if (queryObj.skillsRequired) {
    const skills = queryObj.skillsRequired.split(',');
    filters.skillsRequired = { $in: skills };
  }

  // FACT: Updated salary filtering logic to check the new Range
  if (queryObj.salary) {
    if (queryObj.salary.gte) {
      filters.salaryMax = { $gte: Number(queryObj.salary.gte) }; 
    }
    if (queryObj.salary.lte) {
      filters.salaryMin = { $lte: Number(queryObj.salary.lte) };
    }
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let sortBy = { postedAt: -1 }; 
  if (req.query.sort) {
    const sortField = req.query.sort.startsWith('-') ? req.query.sort.substring(1) : req.query.sort;
    const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
    sortBy = { [sortField]: sortOrder };
  }

  const finalQuery = { ...filters, status: "active" };

  const jobs = await Job.find(finalQuery).sort(sortBy).skip(skip).limit(limit);
  const totalJobs = await Job.countDocuments(finalQuery);

  res.status(200).json({
    results: jobs.length,
    page,
    totalPages: Math.ceil(totalJobs / limit),
    totalJobs,
    data: jobs,
  });
});

export const getJobCountsByIndustry = expressAsyncHandler(async (req, res) => {
  const counts = await Job.aggregate([
    { $match: { status: "active" } }, // Only count live jobs
    { $group: { _id: "$industry", count: { $sum: 1 } } }
  ]);

  // Convert the array into a simple lookup dictionary: { "IT & Software": 15, "HR & Admin": 3 }
  const countMap = {};
  counts.forEach(item => {
    if (item._id) {
      countMap[item._id] = item.count;
    }
  });

  res.status(200).json(countMap);
});

// FACT: We are using a MongoDB aggregation pipeline to count every ATS stage dynamically.
export const getEmployerCreatedJobs = expressAsyncHandler(async (req, res) => {
  // 1. Safety check for the employer ID from your auth middleware
  if (!req.employerId) {
    res.status(401);
    throw new Error("Not authorized. No Employer ID found.");
  }

  try {
    // 2. Safely convert to MongoDB ObjectId
    const employerId = new mongoose.Types.ObjectId(req.employerId);
    
    // 3. The Aggregation Pipeline
    const jobs = await Job.aggregate([
      { $match: { postedBy: employerId } },
      { $sort: { postedAt: -1 } },
      {
        $lookup: {
          from: "applications", // Mongoose automatically lowercase-pluralizes "Application" to "applications"
          localField: "_id",
          foreignField: "job_id",
          as: "applicationsData"
        }
      },
      {
        $addFields: {
          stats: {
            total: { $size: "$applicationsData" },
            shortlisted: { $size: { $filter: { input: "$applicationsData", as: "app", cond: { $eq: ["$$app.status", "shortlisted"] } } } },
            interviewScheduled: { $size: { $filter: { input: "$applicationsData", as: "app", cond: { $eq: ["$$app.status", "Interview Scheduled"] } } } },
            interviewConducted: { $size: { $filter: { input: "$applicationsData", as: "app", cond: { $eq: ["$$app.status", "Interview Conducted"] } } } },
            hired: { $size: { $filter: { input: "$applicationsData", as: "app", cond: { $eq: ["$$app.status", "hired"] } } } },
            nctt: { $size: { $filter: { input: "$applicationsData", as: "app", cond: { $eq: ["$$app.status", "NCTT"] } } } }
          }
        }
      },
      { $project: { applicationsData: 0 } } // Strip out the heavy array before sending to frontend
    ]);
    
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Aggregation Error:", error); // This will log the exact issue to your backend terminal
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
});


export const jobCreatedByUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const jobs = await Job.find({ postedBy: id });

  // This is the correct way to check if no jobs were found
  if (!jobs || jobs.length === 0) {
    return res.status(404).json({ message: "No jobs found for this user" });
  }

  res.status(200).json(jobs);
});


export const updateJob = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  const employer = await Employer.findById(req.employerId);
  // FACT: Block updates if frozen
  if (employer.isFrozen) {
    res.status(403);
    throw new Error("Your account is frozen. You cannot edit jobs.");
  }
  
  if (!job) return res.status(404).json({ message: "Job not found" });

  if (job.postedBy.toString() !== req.employerId.toString()) {
    return res.status(403).json({ message: "Not authorized to update this job" });
  }

  let updateData = { ...req.body };
  // SECURITY: Prevent IDOR/Tampering
  delete updateData.status;
  delete updateData.postedBy;
  delete updateData._id;

  // FACT: Handle the "Same as Office Location" logic for edits
  if (updateData.useOfficeLocation) {
    const employer = await Employer.findById(req.employerId);
    if (!employer.officeLocation || !employer.officeLocation.coordinates) {
      res.status(400);
      throw new Error("Your profile does not have a valid Office Location saved. Please update your profile or pick a location manually.");
    }
    updateData.location = employer.officeLocation;
  } else if (updateData.location && updateData.location.type === 'Point') {
    // Keep the new coordinates sent from the frontend map
  } else if (updateData.mode && (updateData.mode.includes('Work from office') || updateData.mode.includes('Work from field'))) {
     if(!updateData.location) {
         res.status(400);
         throw new Error("Please pick a location on the map or select 'Same as office location'.");
     }
  } else {
    // Remote
    updateData.location = { type: 'Point', coordinates: [0, 0], address: "Remote" };
  }

  const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true });
  res.status(200).json({ message: "Job updated successfully", job: updatedJob });
});


export const deleteJob = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);

  if (!req.admin) {
    return res.status(403).json({ message: "Only administrators can delete jobs." });
  }
  
  if (!job) return res.status(404).json({ message: "Job not found" });

  // Cascade delete all applications associated with this job
  await Application.deleteMany({ job: id });

  await Job.deleteOne({ _id: id });

  // Remove job from employer's createdJobs array
  if (job.postedBy) {
    await Employer.findByIdAndUpdate(job.postedBy, {
      $pull: { createdJobs: id },
    });
  }

  res.status(200).json({ message: "Job deleted successfully and all associated applications removed" });
});

export const getEmployerMetrics = expressAsyncHandler(async (req, res) => {
  const employerId = req.employerId;

  // Total Jobs Posted
  const totalJobsCount = await Job.countDocuments({ postedBy: employerId });

  // Active Jobs
  const activeJobsCount = await Job.countDocuments({ postedBy: employerId, status: "active" });

  // Applications Received (Aggregate over all employer's jobs)
  const employerJobs = await Job.find({ postedBy: employerId }).select('_id views');
  const jobIds = employerJobs.map(job => job._id);
  
  const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

  // Total Job Views
  const totalViews = employerJobs.reduce((sum, job) => sum + (job.views || 0), 0);

  res.status(200).json({
    totalJobs: totalJobsCount,
    activeJobs: activeJobsCount,
    totalApplications,
    totalViews
  });
});



export const getJobApplicants = expressAsyncHandler(async (req, res) => {
  const jobId = req.params.id;

  // 1. Find the Job
  const job = await Job.findById(jobId);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // 2. SECURITY CHECK: Is the logged-in employer the owner?
  // req.employerId comes from your 'protectEmployer' middleware
  if (job.postedBy.toString() !== req.employerId.toString()) {
    res.status(403); // Forbidden
    throw new Error("Not authorized to view applicants for this job");
  }

  // 3. Populate the applicants array
  // This replaces the User IDs with the actual User documents
  await job.populate({
    path: 'applicants',
    // Select ONLY the fields you need. Do NOT send the password hash!
    select: 'name email phone resume skills experience education profilePicture' 
  });

  // 4. Return the populated list
  res.status(200).json(job.applicants);
});




export const getSimilarJobs = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const currentJob = await Job.findById(id);
  if (!currentJob) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Find jobs that share skills OR the same work mode, excluding the current job
  const similarJobs = await Job.find({
    _id: { $ne: id }, // Don't recommend the job they are already looking at
    $or: [
      { skillsRequired: { $in: currentJob.skillsRequired || [] } },
      { mode: currentJob.mode }
    ]
  })
  .limit(3) // Keep the UI clean by only showing the top 3 best matches
  .sort({ createdAt: -1 }); // Newest matching jobs first

  res.status(200).json(similarJobs);
});

// @desc    Get nearby jobs based on coordinates
// @route   GET /api/jobs/nearby
// @access  Public
export const getNearbyJobs = expressAsyncHandler(async (req, res) => {
  const { lat, lng, dist } = req.query;
  console.log("--> [getNearbyJobs] Request received with:", { lat, lng, dist });

  if (!lat || !lng) {
    console.log("--> [getNearbyJobs] Missing lat or lng");
    res.status(400);
    throw new Error("Latitude and longitude are required.");
  }

  // Convert distance to meters (default 50km)
  const distanceInMeters = (parseInt(dist) || 50) * 1000;
  console.log("--> [getNearbyJobs] Max distance in meters:", distanceInMeters);

  try {
    console.log("--> [getNearbyJobs] Executing MongoDB $near query...");
    const jobs = await Job.find({
      status: "active",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)], // MongoDB expects [longitude, latitude]
          },
          $maxDistance: distanceInMeters,
        },
      },
    });

    console.log(`--> [getNearbyJobs] Query successful! Found ${jobs.length} jobs.`);
    res.status(200).json(jobs);
  } catch (error) {
    console.error("--> [getNearbyJobs] ERROR in MongoDB Query:", error);

    // Error 291: NoQueryExecutionPlans (Missing 2dsphere index)
    if (error.code === 291) {
      console.log("--> [getNearbyJobs] Missing 2dsphere index detected! Attempting auto-fix...");
      try {
        // 1. Unset location on jobs that have invalid or empty coordinates
        await Job.updateMany(
          { 
            $or: [
              { "location.coordinates": { $exists: false } },
              { "location.coordinates": { $size: 0 } },
              { "location.type": { $ne: "Point" } }
            ]
          },
          { $unset: { location: "" } }
        );
        
        // 2. Force index rebuild
        await Job.syncIndexes();
        console.log("--> [getNearbyJobs] Indexes synced. Retrying query...");

        // 3. Retry the query
        const retryJobs = await Job.find({
          status: "active",
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
              },
              $maxDistance: distanceInMeters,
            },
          },
        });
        console.log(`--> [getNearbyJobs] Retry successful! Found ${retryJobs.length} jobs.`);
        return res.status(200).json(retryJobs);
      } catch (retryError) {
        console.error("--> [getNearbyJobs] Auto-fix failed:", retryError);
        return res.status(500).json({
          message: "Database error during geospatial query auto-fix.",
          error: retryError.message,
          stack: retryError.stack
        });
      }
    }

    res.status(500).json({
      message: "Database error during geospatial query.",
      error: error.message,
      stack: error.stack
    });
  }
});

export const getPublicStats = expressAsyncHandler(async (req, res) => {
  // 1. Live Jobs
  const liveJobsCount = await Job.countDocuments({ status: { $nin: ['closed', 'inactive', 'pending_approval', 'rejected', 'disregarded'] } });

  // 2. Companies (Approved employers)
  const companiesCount = await Employer.countDocuments({ isApproved: "approved" });

  // 3. Candidates (Users)
  const candidatesCount = await User.countDocuments({});

  // 4. Locations
  const locations = await Job.distinct('location');
  const locationsCount = locations.length;

  res.json({
    liveJobs: liveJobsCount,
    companies: companiesCount,
    candidates: candidatesCount,
    locations: locationsCount
  });
});