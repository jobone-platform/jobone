// controllers/employerController.js
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import Employer from '../models/employer.js'; // Adjust path as needed
import {protectEmployer} from '../middleware/employercheck.js';
import OTP from '../models/verification.js';
import sendEmail from '../utils/emailVerification.js';
import {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import mime from 'mime-types';
import Application from "../models/applications.js";
import User from "../models/users.js";
import Job from "../models/jobs.js";
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let s3Client;

export const getS3Client = () => {
  if (!s3Client) {
    // This code will now run *after* dotenv.config()
    s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};


export const registerEmployer = expressAsyncHandler(async (req, res) => {
  // 1. Validation (Same as before)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password, phone, companyName } = req.body;

  const existingEmployer = await Employer.findOne({ email });
  if (existingEmployer) {
    res.status(400);
    throw new Error('Employer with this email already exists');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('This email is already registered as a Jobseeker.');
  }

  // 3. Hash password (Same as before)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create Employer
  const employer = new Employer({
    name,
    email,
    password: hashedPassword,
    phone,
    companyName: companyName || "",
  });
  
  const savedEmployer = await employer.save();

  // 5. Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // 6. Save to OTP collection
    await OTP.create({
      employerId: savedEmployer._id,
      otp: otpCode,
    });

    // 7. Send Email
    await sendEmail({
      email: savedEmployer.email,
      subject: 'Verify your Employer Account',
      message: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
    });

    // 8. Response (NO TOKEN)
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      email: savedEmployer.email,
      employerId: savedEmployer._id,
      savedEmployer // <-- ADDED THIS LINE
    });
    
  } catch (error) {
    // CRITICAL: If email/OTP fails, delete the user.
    await Employer.deleteOne({ _id: savedEmployer._id });
    await OTP.deleteOne({ employerId: savedEmployer._id });
    
    console.error("Registration failed during OTP step:", error);
    res.status(500);
    throw new Error('Could not send verification email. Please try registering again.');
  }
});

//-----------------------------------------------------------------------------------------------------------------



// ==========================================
// FACT: Lightweight Eligibility Check API
// ==========================================
export const checkEmployerEligibility = expressAsyncHandler(async (req, res) => {
  // 1. Fetch employer with ALL necessary fields for checking
  const employer = await Employer.findById(req.employerId).select(
    'name isApproved isFrozen phone location officeLocation industry description aadharCard panCard employerType companyName natureOfBusiness gstForm tradeLicense educationDocuments'
  );

  if (!employer) {
    res.status(404);
    throw new Error("Employer not found");
  }

  // 2. FACT: Primary Lock - If frozen, access is instantly denied regardless of anything else.
  if (employer.isFrozen) {
    return res.status(200).json({ 
      isFrozen: true,
      access: "blocked", 
      message: "Your account has been frozen by the administration. Please contact support." 
    });
  }

  // 3. Admin Approval Check
  if (employer.isApproved === "pending" || employer.isApproved === "rejected") {
    return res.status(200).json({ 
      isFrozen: false,
      access: "blocked", 
      message: employer.isApproved === "pending" 
        ? "Your account is under review. You will be able to post jobs once approved." 
        : "Your account has been rejected. You do not have permission to post jobs." 
    });
  }

  // 4. Document & Profile Completeness Check
  let missing = [];
  const baseFields = ["phone", "industry", "description", "aadharCard", "panCard"];
  
  baseFields.forEach((field) => {
    if (!employer[field] || String(employer[field]).trim() === "") missing.push(field);
  });

  if (!employer.location && (!employer.officeLocation || !employer.officeLocation.coordinates)) {
    missing.push("location");
  }

  if (employer.employerType === "company") {
    const companyFields = ["companyName", "natureOfBusiness", "gstForm"];
    companyFields.forEach((field) => {
      if (!employer[field] || String(employer[field]).trim() === "") missing.push(field);
    });
  } else {
    const individualFields = ["tradeLicense", "educationDocuments"];
    individualFields.forEach((field) => {
      if (!employer[field] || String(employer[field]).trim() === "") missing.push(field);
    });
  }

  // 5. Final Result
  if (missing.length > 0) {
    return res.status(200).json({ 
      isFrozen: false,
      access: "incomplete", 
      missingItems: missing,
      message: "You must complete your profile and upload all required verification documents before you can post a job."
    });
  }

  // All checks passed
  res.status(200).json({ 
    isFrozen: false, 
    access: "granted",
    companyName: employer.companyName,
    name: employer.name 
  });
});

export const verifyOTP = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // 1. Find the employer first to get their ID
  const employer = await Employer.findOne({ email });
  
  if (!employer) {
    res.status(404);
    throw new Error("Employer not found");
  }

  // 2. Look for their OTP in the separate collection
  // We match BOTH employerId and the specific OTP code
  const otpRecord = await OTP.findOne({
    employerId: employer._id,
    otp: otp,
  });

  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired OTP.");
  }

  // 3. Mark Verified
  employer.isVerified = true;
  await employer.save();

  // 4. Clean up OTP (Prevent reuse)
  await OTP.deleteOne({ _id: otpRecord._id });

  // 5. Generate Token & Login immediately
  const token = jwt.sign(
    { employer: { id: employer._id } }, 
    process.env.JWT_SECRET, 
    { expiresIn: '5h' }
  );
  
  // 6. Send Response
  // CRITICAL: Sending 'employerId' allows frontend to save { token, id } structure
  res.status(200).json({ 
      message: "Account verified!", 
      token,
      employerId: employer._id 
  });
});

export const resendOTP = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400); throw new Error("Email is required");
  }

  const employer = await Employer.findOne({ email });
  if (!employer) {
    res.status(404); throw new Error("Employer not found");
  }
  if (employer.isVerified) {
    res.status(400); throw new Error("Employer is already verified");
  }

  // Delete existing OTP
  await OTP.deleteMany({ employerId: employer._id });

  // Create new OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  await OTP.create({
    employerId: employer._id,
    otp: otpCode,
  });

  await sendEmail({
    email: employer.email,
    subject: 'Your New Verification Code',
    message: `Your new verification code is: ${otpCode}. It expires in 10 minutes.`,
  });

  res.status(200).json({ message: "OTP resent successfully" });
});


export const loginEmployer = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const employer = await Employer.findOne({ email });

  const isMatch = employer 
    ? await bcrypt.compare(password, employer.password) 
    : false;

  if (!employer || !isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // --- FIX 1: BLOCK UNVERIFIED USERS ---
  if (!employer.isVerified) {
    res.status(401);
    // Optional: You could trigger a resend OTP logic here if you wanted
    throw new Error("Account not verified. Please verify your email first.");
  }

  // 3. Create JWT
  const payload = {
    employer: {
      id: employer.id,
    },
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );

  // --- FIX 2: SEND THE ID FOR FRONTEND ---
  res.status(200).json({ 
    token,
    employerId: employer._id, // Frontend needs this for 'employerInfo'
    email: employer.email,     // Optional but good to have
    employerType: employer.employerType // Added to distinguish individual vs company
  });
});


export const getPublicEmployerProfile = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const employer = await Employer.findById(id).select('-password');

  if (!employer) {
    res.status(404);
    throw new Error('Employer not found');
  }

  res.status(200).json(employer);
});


export const getExploreEmployers = expressAsyncHandler(async (req, res) => {
  // Find all approved and unfrozen employers
  const employers = await Employer.find({ isApproved: 'approved', isFrozen: false })
    .select('companyName name industry location profilePicture description employerType');

  // Find all jobs that are not pending or disregarded
  const validJobs = await Job.find({
    status: { $nin: ['pending_approval', 'disregarded', 'rejected'] }
  }).select('postedBy status');

  // Count jobs per employer
  const jobCounts = {};
  validJobs.forEach(job => {
    const employerId = job.postedBy.toString();
    jobCounts[employerId] = (jobCounts[employerId] || 0) + 1;
  });

  // Filter employers who have at least one valid job
  const hiringEmployers = employers
    .map(emp => ({
      ...emp.toObject(),
      jobCount: jobCounts[emp._id.toString()] || 0
    }))
    .filter(emp => emp.jobCount > 0);

  res.status(200).json(hiringEmployers);
});


export const updateEmployerProfile = expressAsyncHandler(async (req, res) => {
  const employer = await Employer.findById(req.employerId).select('-password');

  if (!employer) {
    res.status(404);
    throw new Error('Employer not found');
  }

  // FACT: Reduced word count enforcement from 200 to 50 words
  if (req.body.description !== undefined) {
    const wordCount = req.body.description.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordCount < 50) {
      res.status(400);
      throw new Error(`Profile description must be at least 50 words. You currently have ${wordCount} words.`);
    }
    employer.description = req.body.description;
  }

  if (req.body.employerType !== undefined) {
    employer.employerType = req.body.employerType;
  }

  if (req.body.name !== undefined) employer.name = req.body.name;
  if (req.body.phone !== undefined) employer.phone = req.body.phone;
  if (req.body.location !== undefined) employer.location = req.body.location; 
  if (req.body.officeLocation !== undefined) employer.officeLocation = req.body.officeLocation;
  if (req.body.industry !== undefined) employer.industry = req.body.industry;
  if (req.body.profilePicture !== undefined) {
    if (employer.profilePicture && employer.profilePicture.includes("amazonaws.com") && employer.profilePicture !== req.body.profilePicture) {
      try {
        const urlObj = new URL(employer.profilePicture);
        const key = urlObj.pathname.substring(1);
        if (key) {
          const client = getS3Client();
          await client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: decodeURIComponent(key)
          }));
          console.log(`Deleted old employer profile picture: ${key}`);
        }
      } catch (err) {
        console.error("Failed to delete old employer profile picture from S3:", err);
      }
    }
    employer.profilePicture = req.body.profilePicture;
  }
  
  if (employer.employerType === "company") {
    if (req.body.companyName !== undefined) employer.companyName = req.body.companyName;
    if (req.body.companyWebsite !== undefined) employer.companyWebsite = req.body.companyWebsite;
    if (req.body.natureOfBusiness !== undefined) employer.natureOfBusiness = req.body.natureOfBusiness;
  } else {
    employer.companyName = "";
    employer.companyWebsite = "";
    employer.natureOfBusiness = "";
  }

  if (req.body.aadharCard !== undefined) employer.aadharCard = req.body.aadharCard;
  if (req.body.panCard !== undefined) employer.panCard = req.body.panCard;
  if (req.body.gstForm !== undefined) employer.gstForm = req.body.gstForm;
  if (req.body.otherBusinessCertificate !== undefined) employer.otherBusinessCertificate = req.body.otherBusinessCertificate;
  if (req.body.tradeLicense !== undefined) employer.tradeLicense = req.body.tradeLicense;
  if (req.body.educationDocuments !== undefined) employer.educationDocuments = req.body.educationDocuments;

  const updatedEmployer = await employer.save();
  res.status(200).json(updatedEmployer);
});


export const getPresignedUploadUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client();
  const employerId = req.employerId;
  
  // 1. Get fileType from the request body (e.g., "application/pdf")
  const { fileType } = req.body; 
  
  if (!fileType) {
    res.status(400);
    throw new Error("File type is required");
  }

  // 2. Determine the correct extension (e.g., ".pdf")
  // If you don't want to install mime-types, you can just split the string 'image/png'
  const extension = fileType.split('/')[1]; 
  
  const randomBytes = crypto.randomBytes(16).toString('hex');
  
  // 3. Add extension to the filename so browsers recognize it
  const fileName = `doc-${employerId}-${randomBytes}.${extension}`;
  const key = `verification_documents/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType, // 4. Tell S3 exactly what this file is
  });

  const url = await getSignedUrl(client, command, { expiresIn: 600 });
  
  res.status(200).json({ uploadUrl: url, key: key });
});

export const getEmployerProfilePicUploadUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client();
  const employerId = req.employerId;
  const { fileType } = req.body; 
  
  if (!fileType) {
    res.status(400); throw new Error("File type is required");
  }

  const extension = fileType.split('/')[1] || 'jpg';
  const randomBytes = crypto.randomBytes(8).toString('hex');
  const key = `profile_pictures/employer-${employerId}-${randomBytes}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 600 });
  const publicUrl = `https://jobone-mrpy.onrender.com/images/${key}`;
  
  res.status(200).json({ uploadUrl: url, key: key, publicUrl });
});

export const saveDocumentKey = expressAsyncHandler(async (req, res) => {
  const { key } = req.body;
  const employerIdFromToken = req.employerId;

  if (!key) {
    res.status(400);
    throw new Error("Document key is required");
  }
  
  const employer = await Employer.findById(employerIdFromToken);
  if (!employer) {
    res.status(400);
    throw new Error("Employer not found");
  }

  // --- THIS IS THE FIX ---
  // Save only the key, not the full URL.
  employer.verificationDocument = key; 
  await employer.save();

  res.status(200).json({ 
    message: "Verification document saved successfully.", 
    documentKey: key // Send back the key
  });
});





export const getViewableDocumentUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client(); 
  const employer = await Employer.findById(req.employerId);
  
  // FACT: We now grab the specific field name from the query (e.g., ?field=aadharCard)
  const { field } = req.query; 

  if (!employer) {
    res.status(404); throw new Error("Employer not found");
  }
  if (!field || !employer[field]) {
    res.status(404); throw new Error(`No document uploaded for ${field}`);
  }

  const key = employer[field]; 
  const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key });
  const url = await getSignedUrl(client, command, { expiresIn: 300 });

  res.status(200).json({ viewableUrl: url });
});

export const getDownloadableDocumentUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client(); 
  const employer = await Employer.findById(req.employerId);
  const { field } = req.query;

  if (!employer) {
    res.status(404); throw new Error("Employer not found");
  }
  if (!field || !employer[field]) {
    res.status(404); throw new Error(`No document uploaded for ${field}`);
  }

  const key = employer[field]; 
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: 'attachment',
  });

  const url = await getSignedUrl(client, command, { expiresIn: 300 });
  res.status(200).json({ downloadableUrl: url });
});



export const continueWithGoogle = expressAsyncHandler(async (req, res) => {
  const { credential } = req.body; // Google ID Token

  // 1. Verify Token with Google
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { email, name, picture, sub: googleId } = ticket.getPayload();

  // 2. Check if employer exists
  let employer = await Employer.findOne({ email });

  if (!employer) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('This email is already registered as a Jobseeker.');
    }
  }

  if (employer) {
    // --- SCENARIO A: USER EXISTS ---

    // CASE 1: They registered via Password (local) originally
    if (employer.authProvider === 'local') {
      res.status(409); // Conflict
      throw new Error("Account exists with this email. Please login with your password.");
    }

    // CASE 2: They registered via Google before -> LOGIN THEM IN
    const token = jwt.sign({ employer: { id: employer._id } }, process.env.JWT_SECRET, { expiresIn: '5h' });
    
    // Optional: Update picture/name if changed on Google
    return res.status(200).json({ 
      status: 'LOGIN_SUCCESS',
      token,
      employerId: employer._id,
      message: 'Logged in successfully' 
    });
  } else {
    // --- SCENARIO B: NEW USER ---
    // We CANNOT create the account yet because we need Phone & Company.
    // We send the Google data back to frontend to pre-fill the form.
    
    return res.status(202).json({ 
      status: 'NEED_PROFILE_COMPLETION',
      googleData: {
        email,
        name,
        picture,
        googleId // Send this back so we can verify it again in step 2
      },
      message: 'Please complete your profile' 
    });
  }
});



// Ensure other imports (Employer, jwt, expressAsyncHandler, etc.) are present

export const googleLoginEmployer = expressAsyncHandler(async (req, res) => {
  try {
    const { token: googleToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture, sub: googleId } = ticket.getPayload();

    // 2. Check if employer exists FIRST (Login Scenario)
    let employer = await Employer.findOne({ email });

    if (employer) {
      // --- EXISTING EMPLOYER (LOGIN) ---
      const token = jwt.sign({ employer: { id: employer._id } }, process.env.JWT_SECRET, { expiresIn: '5h' });

      if (!employer.profilePicture) {
          employer.profilePicture = picture;
          await employer.save();
      }

      // FACT: We must ensure the phone number is REAL and not the injected dummy one
      const hasRealPhone = employer.phone && !employer.phone.startsWith("EMP-");
      const isProfileComplete = hasRealPhone && employer.companyName && employer.companyName.trim() !== "";

      return res.status(200).json({
        message: "Google Login Successful",
        token,
        employerId: employer._id,
        email: employer.email,
        employerType: employer.employerType,
        isProfileComplete: !!isProfileComplete
      });

    } else {
      // --- NEW EMPLOYER (REGISTER) ---
      // 3. Check for User collision BEFORE creating a new employer
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400);
        throw new Error('This email is already registered as a Jobseeker. You cannot create an Employer account with this email.');
      }
      // --- NEW EMPLOYER ---
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // FACT: Inject unique dummy phone to prevent MongoDB E11000 duplicate key crash
      const dummyPhone = `EMP-${Date.now().toString().slice(-6)}`;

      const newEmployer = new Employer({
        name,
        email,
        password: hashedPassword,
        profilePicture: picture,
        isVerified: true, 
        authProvider: 'google',
        googleId: googleId,
        phone: dummyPhone, // <-- Crash bypassed here
        companyName: ""   
      });

      const savedEmployer = await newEmployer.save();
      const token = jwt.sign({ employer: { id: savedEmployer._id } }, process.env.JWT_SECRET, { expiresIn: '5h' });

      res.status(201).json({
        message: "Google Registration Successful",
        token,
        employerId: savedEmployer._id,
        email: savedEmployer.email,
        employerType: savedEmployer.employerType,
        isProfileComplete: false // Forces redirect to Edit Profile
      });
    }
  } catch (error) {
    console.error("FATAL GOOGLE LOGIN ERROR (EMPLOYER):", error);
    res.status(500);
    throw new Error(`Google Login Failed: ${error.message}`);
  }
});

// GET /employer/search-candidates?skills=React,Node
export const searchCandidatesBySkills = expressAsyncHandler(async (req, res) => {
  const { skills, page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // 1. Empty Search: Return all paginated
  if (!skills || skills.trim() === "") {
    const total = await User.countDocuments({});
    const candidates = await User.find({})
      .select("name email phone skills profilePicture description resumeData createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      candidates,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalCandidates: total
    });
  }

  // 2. Clean the input into an array of lowercase search terms
  const searchSkills = skills.split(",").map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
  
  // SECURITY: Escape regex to prevent ReDoS
  const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const skillRegexArray = searchSkills.map(s => new RegExp(escapeRegex(s), "i"));

  const matchedUsers = await User.find({
    skills: { $in: skillRegexArray },
  }).select("name email phone skills profilePicture description resumeData createdAt");

  // 4. Calculate exact match scores for the ranking system
  const scoredCandidates = matchedUsers.map(candidate => {
    const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
    
    let matchCount = 0;
    const matchedSkills = [];

    // Loop through every skill the employer typed
    searchSkills.forEach(searchTerm => {
      // Find if the candidate has a skill containing this term (e.g. "React.js" includes "react")
      const found = candidateSkillsLower.find(cs => cs.includes(searchTerm));
      if (found) {
        matchCount++;
        matchedSkills.push(found);
      }
    });
    
    return {
      ...candidate.toObject(),
      matchCount,
      totalSearched: searchSkills.length, // Track how many skills were requested
      matchedSkills: [...new Set(matchedSkills)] // Remove duplicates
    };
  });

  // 5. Sort: Candidates with all skills at the top. Tie-breaker goes to the newest profile.
  scoredCandidates.sort((a, b) => {
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount; 
    }
    return new Date(b.createdAt) - new Date(a.createdAt); 
  });

  // 6. Paginate the sorted results
  const paginatedCandidates = scoredCandidates.slice(skip, skip + limitNum);

  res.status(200).json({
    candidates: paginatedCandidates,
    currentPage: pageNum,
    totalPages: Math.ceil(scoredCandidates.length / limitNum),
    totalCandidates: scoredCandidates.length
  });
});


export const getMyCandidates = expressAsyncHandler(async (req, res) => {
  try {
    const employerId = req.employerId;

    // 1. Find all jobs posted by this employer
    const jobs = await Job.find({ postedBy: employerId }).select('_id title');
    const jobIds = jobs.map(j => j._id);

    if (jobIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Find all applications for these jobs and populate candidate data
    const applications = await Application.find({ job_id: { $in: jobIds } })
      .populate("appliedBy", "name email phone profilePicture skills resumeData")
      .populate("job_id", "title postedByCompany postedByName isThirdPartyRecruiting showHiringCompanyName hiringCompanyName")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error("ERROR IN getMyCandidates:", error);
    res.status(500).json({ message: "Server Error loading candidates", error: error.message, stack: error.stack });
  }
});

export const forgotPasswordEmployer = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  const employer = await Employer.findOne({ email });
  if (!employer) {
    res.status(404);
    throw new Error("Employer not found with this email");
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Clear existing OTPs
  await OTP.deleteMany({ employerId: employer._id });

  await OTP.create({
    employerId: employer._id,
    otp: otpCode,
  });

  await sendEmail({
    email: employer.email,
    subject: 'Password Reset Request - Job Portal',
    message: `Your password reset code is: ${otpCode}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
  });

  res.status(200).json({ message: "Password reset OTP sent to your email." });
});

export const resetPasswordEmployer = expressAsyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const employer = await Employer.findOne({ email });
  if (!employer) {
    res.status(404);
    throw new Error("Employer not found");
  }

  const otpRecord = await OTP.findOne({ employerId: employer._id, otp: otp });
  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  employer.password = await bcrypt.hash(newPassword, 10);
  await employer.save();

  await OTP.deleteOne({ _id: otpRecord._id });

  res.status(200).json({ message: "Password reset successful. You can now log in." });
});