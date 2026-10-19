import * as xlsx from 'xlsx';
import { ZipArchive } from 'archiver';
import User from '../models/users.js';
import Application from '../models/applications.js';
import Contact from '../models/contacted.js';

import errorHandler from "express-async-handler";
import Admin from "../models/admin.js";
import Job from "../models/jobs.js";
import jwt from "jsonwebtoken";
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';
import Employer from '../models/employer.js';
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

// Helper to get S3 Client (duplicate this if it's not already in this file)
const getS3Client = () => {
  return new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

// 1. Fetch entire confidential profile
export const getEmployerDetailsForAdmin = expressAsyncHandler(async (req, res) => {
  const employer = await Employer.findById(req.params.id).select('-password');
  if (!employer) {
    res.status(404); throw new Error("Employer not found");
  }
  res.status(200).json(employer);
});

// 2. Fetch specific confidential document
export const getAdminViewableDocumentUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client(); 
  const employer = await Employer.findById(req.params.id);
  const { field } = req.query; 

  if (!employer) { res.status(404); throw new Error("Employer not found"); }
  if (!field || !employer[field]) { res.status(404); throw new Error(`No document uploaded for ${field}`); }

  const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: employer[field] });
  const url = await getSignedUrl(client, command, { expiresIn: 300 });

  res.status(200).json({ viewableUrl: url });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
export const authAdmin = errorHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Make email search case-insensitive just in case
  const admin = await Admin.findOne({ email: new RegExp('^' + email + '$', 'i') });

  if (!admin) {
    res.status(401);
    throw new Error("Invalid email. No admin found with this email.");
  }

  if (await admin.matchPassword(password)) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid password for this admin account.");
  }
});

// @desc    Create a new admin
// @route   POST /api/admin/create-admin
// @access  Super Admin
export const createAdmin = expressAsyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!['jobseekerAdmin', 'employerAdmin','superAdmin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Must be jobseekerAdmin or employerAdmin');
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    res.status(400);
    throw new Error('Admin already exists');
  }

  const newAdmin = new Admin({
    name, email, password, role
  });

  await newAdmin.save();
  res.status(201).json({ message: "Admin created successfully", admin: { name, email, role } });
});

// @desc    Get all pending employers
// @route   GET /api/admin/employers/pending
export const getPendingEmployers = errorHandler(async (req, res) => {
  const employers = await Employer.find({ isApproved: "pending" }).select("-password");
  res.json(employers);
});

// @desc    Get all employers (for admin view)
// @route   GET /api/admin/employers
export const getAllEmployersForAdmin = errorHandler(async (req, res) => {
  const employers = await Employer.find({}).select("-password").sort({ createdAt: -1 });
  res.json(employers);
});

// @desc    Get all jobseekers (for admin view)
// @route   GET /api/admin/users
export const getAllJobseekersForAdmin = errorHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Get all pending jobs
// @route   GET /api/admin/jobs/pending
export const getPendingJobs = errorHandler(async (req, res) => {
  const jobs = await Job.find({ status: "pending_approval" }).populate("postedBy", "name email companyName");
  res.json(jobs);
});

// @desc    Get ALL jobs (for admin view)
// @route   GET /api/admin/jobs
export const getAllJobsForAdmin = errorHandler(async (req, res) => {
  const jobs = await Job.find({}).populate("postedBy", "name email companyName").sort({ createdAt: -1 });
  res.json(jobs);
});

// @desc    Get jobs created by a specific employer along with their applications
// @route   GET /api/admin/employers/:id/jobs
export const getEmployerJobsWithApplications = errorHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.params.id }).sort({ createdAt: -1 });
  
  // Also get applications for each job to give the admin a full view
  const jobsWithApps = await Promise.all(
    jobs.map(async (job) => {
      const applications = await Application.find({ job: job._id }).populate('appliedBy', 'name email phone');
      return { ...job.toObject(), applications };
    })
  );

  res.json(jobsWithApps);
});

// @desc    Get all applications made by a specific jobseeker
// @route   GET /api/admin/users/:id/applications
export const getJobseekerApplicationsForAdmin = errorHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Use dynamic import specifically for Application to avoid circular dependencies if they exist,
  // but use a direct default extraction that works in ES6
  const applications = await Application.find({ appliedBy: req.params.id })
    .populate("job_id", "title location status postedByCompany postedByName isThirdPartyRecruiting showHiringCompanyName hiringCompanyName")
    .sort({ appliedAt: -1 });

  res.json({ user, applications });
});

// @desc    Approve or Reject an Employer
// @route   PATCH /api/admin/employers/:id/review
export const reviewEmployer = errorHandler(async (req, res) => {
  const { status } = req.body; // must be "approved" or "rejected"
  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Must be 'approved' or 'rejected'.");
  }
  const employer = await Employer.findById(req.params.id);

  if (!employer) {
    res.status(404);
    throw new Error("Employer not found");
  }

  employer.isApproved = status;
  await employer.save();

  res.json({ message: `Employer ${status} successfully`, employer });
});

// @desc    Approve or Reject a Job
// @route   PATCH /api/admin/jobs/:id/review
export const reviewJob = errorHandler(async (req, res) => {
  const { status } = req.body; // must be "active" or "rejected"
  if (!["active", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Must be 'active' or 'rejected'.");
  }
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  job.status = status;
  await job.save();

  res.json({ message: `Job marked as ${status} successfully`, job });
});

export const getJobForAdmin = expressAsyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404); 
    throw new Error("Job not found");
  }
  res.status(200).json(job);
});

// Excel Formatting Helpers
const formatJobsForExcel = (jobs) => {
  return jobs.map(job => ({
    "Job ID": job._id.toString(),
    "Title": job.title || "N/A",
    "Company": job.postedByCompany || "N/A",
    "Status": job.status ? job.status.toUpperCase() : "N/A",
    "Location": typeof job.location === 'object' ? job.location?.address : (job.location || "N/A"),
    "Salary": job.salary || "N/A",
    "Job Type": job.jobType || "N/A",
    "Industry": job.industry || "N/A",
    "Subdomain": job.subdomain || "N/A",
    "Experience Required": job.experienceLevel || "N/A",
    "Total Applications": job.applications ? job.applications.length : 0,
    "Posted On": new Date(job.createdAt).toLocaleDateString()
  }));
};

const formatJobseekersForExcel = (users) => {
  return users.map(user => ({
    "Account ID": user._id.toString(),
    "Full Name": user.name || "N/A",
    "Email": user.email,
    "Phone": user.phone || "N/A",
    "Gender": user.gender || "N/A",
    "Profile Complete": user.isProfileComplete ? "Yes" : "No",
    "Account Verified": user.isVerified ? "Yes" : "No",
    "Skills": user.skills && user.skills.length > 0 ? user.skills.join(', ') : "None",
    "Highest Degree": user.education && user.education.length > 0 ? user.education[0].degree : "N/A",
    "Total Experience Entries": user.experience ? user.experience.length : 0,
    "About/Description": user.description || "N/A",
    "Registered On": new Date(user.createdAt).toLocaleDateString()
  }));
};

const formatEmployersForExcel = (employers) => {
  return employers.map(emp => ({
    "Account ID": emp._id.toString(),
    "Contact Person": emp.name || "N/A",
    "Email": emp.email,
    "Phone": emp.phone || "N/A",
    "Gender": emp.gender || "N/A",
    "Entity Type": emp.employerType || "company",
    "Company Name": emp.companyName || "N/A",
    "Nature of Business": emp.natureOfBusiness || "N/A",
    "Industry": emp.industry || "N/A",
    "Location": emp.location || "N/A",
    "Website": emp.companyWebsite || "N/A",
    "Approval Status": emp.isApproved ? emp.isApproved.toUpperCase() : "N/A",
    "Account Verified": emp.isVerified ? "Yes" : "No",
    "Profile Complete": emp.isProfileComplete ? "Yes" : "No",
    "About/Description": emp.description || "N/A",
    "Registered On": new Date(emp.createdAt).toLocaleDateString()
  }));
};

const formatAdminsForExcel = (admins) => {
  return admins.map(admin => ({
    "Admin ID": admin._id?.toString() || "N/A",
    "Name": admin.name || "N/A",
    "Email": admin.email || "N/A",
    "Role": admin.role || "N/A",
    "Created At": new Date(admin.createdAt).toLocaleDateString()
  }));
};

const formatApplicationsForExcel = (applications) => {
  return applications.map(app => ({
    "Application ID": app._id?.toString() || "N/A",
    "Job ID": app.job_id?.toString() || "N/A",
    "Employer ID": app.jobHost?.toString() || "N/A",
    "Applicant ID": app.appliedBy?.toString() || "N/A",
    "Status": app.status || "N/A",
    "Applied At": new Date(app.appliedAt).toLocaleDateString()
  }));
};

const formatContactsForExcel = (contacts) => {
  return contacts.map(contact => ({
    "Contact ID": contact._id?.toString() || "N/A",
    "User ID": contact.userId?.toString() || "N/A",
    "Name": contact.name || "N/A",
    "Email": contact.email || "N/A",
    "Type": contact.communicationType || "N/A",
    "Message": contact.message || "N/A",
    "Submitted At": new Date(contact.createdAt).toLocaleDateString()
  }));
};

// @desc    Export Complete Data to Excel (SuperAdmin)
// @route   GET /api/admin/export/all
export const exportDataToExcel = expressAsyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password -__v').lean();
  const employers = await Employer.find({}).select('-password -__v').lean();
  const jobs = await Job.find({}).lean();
  const admins = await Admin.find({}).select('-password -__v').lean();
  const applications = await Application.find({}).lean();
  const contacts = await Contact.find({}).lean();

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="Platform_Complete_DB.zip"');

  const archive = new ZipArchive({ zlib: { level: 9 } });
  
  archive.on('error', (err) => {
    res.status(500);
    throw new Error("Failed to generate ZIP archive");
  });

  archive.pipe(res);

  // Generate and append Admins
  const wbAdmins = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wbAdmins, xlsx.utils.json_to_sheet(formatAdminsForExcel(admins)), "Admins");
  archive.append(xlsx.write(wbAdmins, { type: 'buffer', bookType: 'xlsx' }), { name: 'Admins.xlsx' });

  // Generate and append Applications
  const wbApps = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wbApps, xlsx.utils.json_to_sheet(formatApplicationsForExcel(applications)), "Applications");
  archive.append(xlsx.write(wbApps, { type: 'buffer', bookType: 'xlsx' }), { name: 'Applications.xlsx' });

  // Generate and append Contacts
  const wbContacts = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wbContacts, xlsx.utils.json_to_sheet(formatContactsForExcel(contacts)), "Contacts");
  archive.append(xlsx.write(wbContacts, { type: 'buffer', bookType: 'xlsx' }), { name: 'Contacts.xlsx' });

  // Generate and append Employers
  const wbEmployers = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wbEmployers, xlsx.utils.json_to_sheet(formatEmployersForExcel(employers)), "Employers");
  archive.append(xlsx.write(wbEmployers, { type: 'buffer', bookType: 'xlsx' }), { name: 'Employers.xlsx' });

  // Generate and append Jobs
  const wbJobs = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wbJobs, xlsx.utils.json_to_sheet(formatJobsForExcel(jobs)), "Jobs");
  archive.append(xlsx.write(wbJobs, { type: 'buffer', bookType: 'xlsx' }), { name: 'Jobs.xlsx' });

  // Generate and append Users
  const wbUsers = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wbUsers, xlsx.utils.json_to_sheet(formatJobseekersForExcel(users)), "Jobseekers");
  archive.append(xlsx.write(wbUsers, { type: 'buffer', bookType: 'xlsx' }), { name: 'Users.xlsx' });

  await archive.finalize();
});

// @desc    Export Employers & Jobs to Excel (EmployerAdmin)
// @route   GET /api/admin/export/employers
export const exportEmployersDataToExcel = expressAsyncHandler(async (req, res) => {
  const employers = await Employer.find({}).select('-password -__v').lean();
  const jobs = await Job.find({}).lean();

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(formatEmployersForExcel(employers)), "Employer Profiles");
  xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(formatJobsForExcel(jobs)), "All Jobs");

  const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="Platform_Employers_Jobs.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(excelBuffer);
});

// @desc    Export Jobseekers & Jobs to Excel (JobseekerAdmin)
// @route   GET /api/admin/export/jobseekers
export const exportJobseekersDataToExcel = expressAsyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password -__v').lean();
  const jobs = await Job.find({}).lean();

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(formatJobseekersForExcel(users)), "Jobseeker Profiles");
  xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(formatJobsForExcel(jobs)), "All Jobs");

  const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="Platform_Jobseekers_Jobs.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(excelBuffer);
});



// @desc    Export Single Employer Profile to Excel
// @route   GET /api/admin/employers/:id/export
export const exportSingleEmployerToExcel = expressAsyncHandler(async (req, res) => {
  const emp = await Employer.findById(req.params.id).select('-password -__v').lean();
  
  if (!emp) {
    res.status(404);
    throw new Error("Employer not found");
  }

  // Format the single profile exactly like the bulk export
  const formattedEmployer = [{
    "Account ID": emp._id.toString(),
    "Contact Person": emp.name || "N/A",
    "Email": emp.email,
    "Phone": emp.phone || "N/A",
    "Gender": emp.gender || "N/A",
    "Entity Type": emp.employerType || "company",
    "Company Name": emp.companyName || "N/A",
    "Nature of Business": emp.natureOfBusiness || "N/A",
    "Industry": emp.industry || "N/A",
    "Location": emp.location || "N/A",
    "Website": emp.companyWebsite || "N/A",
    "Approval Status": emp.isApproved ? emp.isApproved.toUpperCase() : "N/A",
    "Account Verified": emp.isVerified ? "Yes" : "No",
    "Profile Complete": emp.isProfileComplete ? "Yes" : "No",
    "About/Description": emp.description || "N/A",
    "Registered On": new Date(emp.createdAt).toLocaleDateString()
  }];

  const workbook = xlsx.utils.book_new();
  const wsEmployer = xlsx.utils.json_to_sheet(formattedEmployer);
  xlsx.utils.book_append_sheet(workbook, wsEmployer, "Employer Profile");

  const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Dynamically name the file based on the company name or ID
  const fileName = `EmployerProfile_${emp.companyName ? emp.companyName.replace(/\s+/g, '_') : emp._id}.xlsx`;

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
  res.send(excelBuffer);
});

export const freezeUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { freeze } = req.body; // true to freeze, false to unfreeze

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "Jobseeker not found" });

  user.isFrozen = freeze;
  await user.save();
  
  res.status(200).json({ message: `Jobseeker account is now ${freeze ? 'frozen' : 'active'}` });
});

export const freezeEmployer = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { freeze } = req.body; 

  const employer = await Employer.findById(id);
  if (!employer) return res.status(404).json({ message: "Employer not found" });

  employer.isFrozen = freeze;
  await employer.save();
  
  res.status(200).json({ message: `Employer account is now ${freeze ? 'frozen' : 'active'}` });
});


export const searchJobseekers = expressAsyncHandler(async (req, res) => {
  const { q } = req.query;
  // Search by name or email
  const query = q ? { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] } : {};
  const users = await User.find(query).select('name email phone isFrozen createdAt').limit(20);
  res.status(200).json(users);
});

export const searchEmployers = expressAsyncHandler(async (req, res) => {
  const { q } = req.query;
  // Search by company name, contact name, or email
  const query = q ? { $or: [{ companyName: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] } : {};
  const employers = await Employer.find(query).select('name email companyName isFrozen createdAt').limit(20);
  res.status(200).json(employers);
});

export const getAdminDashboardStats = expressAsyncHandler(async (req, res) => {
  const totalJobs = await Job.countDocuments();
  const totalJobseekers = await User.countDocuments();
  const totalEmployers = await Employer.countDocuments();
  res.json({ jobs: totalJobs, jobseekers: totalJobseekers, employers: totalEmployers });
});

// @desc    Get all contact messages for admins
// @route   GET /api/admin/contacts
export const getAllContactsForAdmin = expressAsyncHandler(async (req, res) => {
  const contacts = await Contact.find({}).sort({ createdAt: -1 });
  res.status(200).json(contacts);
});

// @desc    Mark contact message as read
// @route   PATCH /api/admin/contacts/:id/read
export const markContactAsRead = expressAsyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact message not found");
  }
  contact.isRead = true;
  await contact.save();
  res.status(200).json({ message: "Contact marked as read", contact });
});

// @desc    Get all admins
// @route   GET /api/admin/all-admins
export const getAllAdmins = expressAsyncHandler(async (req, res) => {
  const admins = await Admin.find({}).select("-password");
  res.status(200).json(admins);
});

// @desc    Update admin role
// @route   PATCH /api/admin/:id/role
export const updateAdminRole = expressAsyncHandler(async (req, res) => {
  const { role } = req.body;
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }
  
  if (admin.role === "superAdmin" && role !== "superAdmin") {
    const superAdminCount = await Admin.countDocuments({ role: "superAdmin" });
    if (superAdminCount <= 1) {
      res.status(400);
      throw new Error("Cannot change role of the only Super Admin");
    }
  }

  admin.role = role;
  await admin.save();
  res.status(200).json({ message: "Admin role updated", admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
});

// @desc    Delete admin
// @route   DELETE /api/admin/:id
export const deleteAdmin = expressAsyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }
  
  if (admin.role === "superAdmin") {
    const superAdminCount = await Admin.countDocuments({ role: "superAdmin" });
    if (superAdminCount <= 1) {
      res.status(400);
      throw new Error("Cannot delete the only Super Admin");
    }
  }

  await Admin.deleteOne({ _id: admin._id });
  res.status(200).json({ message: "Admin deleted successfully" });
});