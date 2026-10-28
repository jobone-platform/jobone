// controllers/employerController.js
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import Employer from '../models/employer.js'; // Adjust path as needed
import {protectEmployer} from '../middleware/employercheck.js';
import OTP from '../models/verification.js';
import sendEmail from '../utils/sendEmail.js';
import {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import mime from 'mime-types';
import Application from "../models/applications.js";
import User from "../models/users.js";
import Job from "../models/jobs.js";
import Admin from "../models/admin.js";
import mongoose from "mongoose";
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

import {
  isValidEmail,
  validatePasswordStrength,
  validatePhone,
  validateName,
  sanitizeString,
  normalizeEmail,
  generateSecureOTP,
  clampPagination,
  escapeRegex,
} from '../utils/validators.js';


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
  // 1. Validation Results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password, phone, companyName, countryCode, userType } = req.body;

  // 1. Validate Name
  const nameCheck = validateName(name, "Employer name");
  if (!nameCheck.isValid) {
    res.status(400);
    throw new Error(nameCheck.message);
  }

  // 2. Validate Email
  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("A valid email address is required");
  }
  const normalizedEmail = normalizeEmail(email);

  // 3. Validate Password
  const passCheck = validatePasswordStrength(password);
  if (!passCheck.isValid) {
    res.status(400);
    throw new Error(passCheck.message);
  }

  // 4. Validate Phone
  const phoneCheck = validatePhone(phone, countryCode || "+91");
  if (!phoneCheck.isValid) {
    res.status(400);
    throw new Error(phoneCheck.message);
  }
  const formattedPhone = phoneCheck.formatted;
  const rawDigits = phoneCheck.rawDigits;

  // 5. Company Name check if Company type
  const normalizedUserType = userType === "Company" || userType === "company" ? "company" : "individual";
  const sanitizedCompany = sanitizeString(companyName);
  if (normalizedUserType === "company" && !sanitizedCompany) {
    res.status(400);
    throw new Error("Company name is required for company registrations");
  }

  // 6. Duplicate Email Check
  const existingEmployer = await Employer.findOne({ email: normalizedEmail });
  if (existingEmployer && existingEmployer.isVerified) {
    res.status(400);
    throw new Error('An employer account with this email already exists. Please log in.');
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(400);
    throw new Error('This email is already registered as a Jobseeker account.');
  }

  // 7. Duplicate Phone Check across Employers and Users
  const phoneQuery = {
    $or: [{ phone: formattedPhone }, { phone: rawDigits }],
  };

  const phoneInEmployer = await Employer.findOne(phoneQuery);
  if (phoneInEmployer && (!existingEmployer || phoneInEmployer._id.toString() !== existingEmployer._id.toString())) {
    res.status(400);
    throw new Error('This mobile number is already registered to an Employer account.');
  }

  const phoneInUser = await User.findOne(phoneQuery);
  if (phoneInUser) {
    res.status(400);
    throw new Error('This mobile number is already registered to a candidate account.');
  }

  // 8. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 9. Save or refresh Employer record
  let savedEmployer;
  if (existingEmployer && !existingEmployer.isVerified) {
    existingEmployer.name = nameCheck.value;
    existingEmployer.password = hashedPassword;
    existingEmployer.phone = formattedPhone;
    existingEmployer.employerType = normalizedUserType;
    existingEmployer.companyName = sanitizedCompany;
    savedEmployer = await existingEmployer.save();
    await OTP.deleteMany({ employerId: savedEmployer._id });
  } else {
    const employer = new Employer({
      name: nameCheck.value,
      email: normalizedEmail,
      password: hashedPassword,
      phone: formattedPhone,
      employerType: normalizedUserType,
      companyName: sanitizedCompany,
    });
    savedEmployer = await employer.save();
  }

  // 10. Generate 6-digit OTP using cryptographically secure random generator
  const otpCode = generateSecureOTP(6);

  try {
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    await OTP.deleteMany({ employerId: savedEmployer._id });
    await OTP.create({
      employerId: savedEmployer._id,
      otp: hashedOTP,
      type: "verification",
      attempts: 0,
    });

    await sendEmail({
      email: savedEmployer.email,
      subject: 'Verify your JobOne Employer Account',
      message: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
    });

    // SECURITY: Never return savedEmployer or hashed passwords in response!
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      email: savedEmployer.email,
      employerId: savedEmployer._id
    });
    
  } catch (error) {
    if (!existingEmployer) {
      await Employer.deleteOne({ _id: savedEmployer._id });
    }
    await OTP.deleteMany({ employerId: savedEmployer._id });
    
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
  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const normalizedEmail = normalizeEmail(email);
  const employer = await Employer.findOne({ email: normalizedEmail });
  
  if (!employer) {
    res.status(404);
    throw new Error("Employer account not found");
  }

  // Handle already verified employer
  if (employer.isVerified) {
    const token = jwt.sign(
      { employer: { id: employer._id } }, 
      process.env.JWT_SECRET, 
      { expiresIn: '5h' }
    );
    return res.status(200).json({ 
      message: "Account is already verified. You can log in.", 
      alreadyVerified: true,
      token,
      employerId: employer._id,
      id: employer._id,
      email: employer.email,
      employerType: employer.employerType,
      isProfileComplete: employer.isProfileComplete || false
    });
  }

  const otpRecord = await OTP.findOne({ employerId: employer._id, type: "verification" });
  if (!otpRecord) {
    res.status(400);
    throw new Error("Verification code has expired or does not exist. Please request a new code.");
  }

  // Explicit 10-minute expiry check
  const isExpired = Date.now() - new Date(otpRecord.createdAt).getTime() > 10 * 60 * 1000;
  if (isExpired) {
    await OTP.deleteMany({ employerId: employer._id, type: "verification" });
    res.status(400);
    throw new Error("Verification code has expired. Please request a new code.");
  }

  // Attempt limit check (maximum 5 attempts)
  if (otpRecord.attempts >= 5) {
    await OTP.deleteMany({ employerId: employer._id, type: "verification" });
    res.status(429);
    throw new Error("Too many failed attempts. Please request a new verification code.");
  }

  // Verify OTP (support bcrypt hash with fallback for plain text)
  let isMatch = false;
  if (otpRecord.otp.startsWith("$2b$") || otpRecord.otp.startsWith("$2a$")) {
    isMatch = await bcrypt.compare(String(otp).trim(), otpRecord.otp);
  } else {
    isMatch = otpRecord.otp.trim() === String(otp).trim();
  }

  if (!isMatch) {
    otpRecord.attempts = (otpRecord.attempts || 0) + 1;
    await otpRecord.save();
    const remaining = 5 - otpRecord.attempts;
    res.status(400);
    throw new Error(remaining > 0
      ? `Invalid verification code. ${remaining} attempt(s) remaining.`
      : "Invalid verification code. Maximum attempts reached. Please request a new code.");
  }

  // Mark Verified
  employer.isVerified = true;
  await employer.save();

  // Clean up verification OTP
  await OTP.deleteMany({ employerId: employer._id, type: "verification" });

  // Generate Token & Login immediately
  const token = jwt.sign(
    { employer: { id: employer._id } }, 
    process.env.JWT_SECRET, 
    { expiresIn: '5h' }
  );
  
  res.status(200).json({ 
    message: "Account verified successfully!", 
    token,
    employerId: employer._id,
    id: employer._id,
    email: employer.email,
    employerType: employer.employerType,
    isProfileComplete: employer.isProfileComplete || false
  });
});

export const resendOTP = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400); throw new Error("Email is required");
  }

  const normalizedEmail = normalizeEmail(email);
  const employer = await Employer.findOne({ email: normalizedEmail });
  if (!employer) {
    res.status(404); throw new Error("Employer account not found");
  }
  if (employer.isVerified) {
    res.status(400); throw new Error("This employer account is already verified. Please log in.");
  }

  // Rate limiting: Prevent requesting a new OTP within 30 seconds
  const existingOTP = await OTP.findOne({ employerId: employer._id, type: "verification" });
  if (existingOTP && (Date.now() - new Date(existingOTP.createdAt).getTime()) < 30 * 1000) {
    const remainingSec = Math.ceil((30 * 1000 - (Date.now() - new Date(existingOTP.createdAt).getTime())) / 1000);
    res.status(429);
    throw new Error(`Please wait ${remainingSec} seconds before requesting another code.`);
  }

  // Delete existing verification OTPs
  await OTP.deleteMany({ employerId: employer._id, type: "verification" });

  // Create new hashed OTP using cryptographically secure random generator
  const otpCode = generateSecureOTP(6);
  const hashedOTP = await bcrypt.hash(otpCode, 10);
  await OTP.create({
    employerId: employer._id,
    otp: hashedOTP,
    type: "verification",
    attempts: 0,
  });

  try {
    await sendEmail({
      email: employer.email,
      subject: 'Your New Verification Code - JobOne Employer',
      message: `Your new verification code is: ${otpCode}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: "A new verification code has been sent to your business email." });
  } catch (error) {
    await OTP.deleteMany({ employerId: employer._id, type: "verification" });
    res.status(500);
    throw new Error("Could not send verification email. Please try again later.");
  }
});


export const loginEmployer = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const employer = await Employer.findOne({ email: normalizedEmail });

  const isMatch = employer 
    ? await bcrypt.compare(password, employer.password) 
    : false;

  if (!employer || !isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Operational lock: Block frozen employer accounts
  if (employer.isFrozen) {
    res.status(403);
    throw new Error("Account Suspended: Your employer account has been frozen by the administration.");
  }

  // Block unverified employers
  if (!employer.isVerified) {
    res.status(401);
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

  res.status(200).json({ 
    token,
    employerId: employer._id,
    id: employer._id,
    email: employer.email,
    employerType: employer.employerType,
    name: employer.name,
    companyName: employer.companyName,
    isProfileComplete: employer.isProfileComplete || false
  });
});


export const getPublicEmployerProfile = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid employer ID format" });
  }

  // Determine if requester is the employer themselves or an admin
  let isAuthorizedOwnerOrAdmin = false;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const requesterId = decoded.id || (decoded.employer && decoded.employer.id);
      if (requesterId && requesterId.toString() === id.toString()) {
        isAuthorizedOwnerOrAdmin = true;
      } else if (decoded.id) {
        const admin = await Admin.findById(decoded.id);
        if (admin) isAuthorizedOwnerOrAdmin = true;
      }
    } catch (e) {
      // Invalid/expired token, proceed as public requester
    }
  }

  let employer;
  if (isAuthorizedOwnerOrAdmin) {
    employer = await Employer.findById(id).select("-password");
  } else {
    // PUBLIC SANITIZED VIEW: Do NOT return sensitive document keys (Aadhar, PAN, GST, Trade License, etc.)
    employer = await Employer.findById(id).select(
      "name email phone employerType natureOfBusiness companyName companyWebsite description profilePicture location officeLocation industry isApproved ratingsReceived createdAt"
    );
  }

  if (!employer) {
    res.status(404);
    throw new Error('Employer not found');
  }

  res.status(200).json(employer);
});


export const getExploreEmployers = expressAsyncHandler(async (req, res) => {
  // Query employers and job counts concurrently using Promise.all and aggregation
  const [employers, jobCountAgg] = await Promise.all([
    Employer.find({ isApproved: 'approved', isFrozen: false })
      .select('companyName name industry location profilePicture description employerType')
      .lean(),
    Job.aggregate([
      { $match: { status: { $nin: ['pending_approval', 'disregarded', 'rejected'] } } },
      { $group: { _id: "$postedBy", count: { $sum: 1 } } }
    ])
  ]);

  const countMap = {};
  jobCountAgg.forEach(item => {
    if (item._id) {
      countMap[item._id.toString()] = item.count;
    }
  });

  // Filter employers who have at least one valid job
  const hiringEmployers = employers
    .map(emp => ({
      ...emp,
      jobCount: countMap[emp._id.toString()] || 0
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

  if (req.body.name !== undefined) {
    const nameCheck = validateName(req.body.name, "Employer name");
    if (!nameCheck.isValid) {
      res.status(400);
      throw new Error(nameCheck.message);
    }
    employer.name = nameCheck.value;
  }

  if (req.body.phone !== undefined) {
    const phoneCheck = validatePhone(req.body.phone);
    if (!phoneCheck.isValid) {
      res.status(400);
      throw new Error(phoneCheck.message);
    }
    const existingPhone = await Employer.findOne({
      _id: { $ne: employer._id },
      $or: [{ phone: phoneCheck.formatted }, { phone: phoneCheck.rawDigits }]
    });
    if (existingPhone) {
      res.status(400);
      throw new Error("This phone number is already registered to another employer account.");
    }
    employer.phone = phoneCheck.formatted;
  }

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
    if (req.body.companyName !== undefined) employer.companyName = sanitizeString(req.body.companyName);
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
  const safeData = updatedEmployer.toObject();
  delete safeData.password;
  res.status(200).json(safeData);
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
  const baseUrl = process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
  const publicUrl = `${baseUrl.replace(/\/+$/, '')}/images/${key}`;
  
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
    const normalizedEmail = normalizeEmail(email);

    // 2. Check if employer exists FIRST (Login Scenario)
    let employer = await Employer.findOne({ email: normalizedEmail });

    if (employer) {
      if (employer.isFrozen) {
        return res.status(403).json({ message: "Account Suspended: Your employer account has been frozen by the administration." });
      }

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
        id: employer._id,
        email: employer.email,
        employerType: employer.employerType,
        isProfileComplete: !!isProfileComplete
      });

    } else {
      // --- NEW EMPLOYER (REGISTER) ---
      // 3. Check for User collision BEFORE creating a new employer
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(400);
        throw new Error('This email is already registered as a Jobseeker. You cannot create an Employer account with this email.');
      }
      // --- NEW EMPLOYER ---
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // FACT: Inject unique dummy phone to prevent MongoDB E11000 duplicate key crash
      const dummyPhone = `EMP-${Date.now().toString().slice(-6)}`;

      const newEmployer = new Employer({
        name: name ? name.trim() : "Employer",
        email: normalizedEmail,
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
        id: savedEmployer._id,
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
// GET /employer/search-candidates?skills=React,Node
export const searchCandidatesBySkills = expressAsyncHandler(async (req, res) => {
  const { skills } = req.query;
  const { page, limit, skip } = clampPagination(req.query.page, req.query.limit, 20, 50);

  // 1. Empty Search: Return all paginated using concurrent count and find
  if (!skills || typeof skills !== 'string' || skills.trim() === "") {
    const [total, candidates] = await Promise.all([
      User.countDocuments({}),
      User.find({})
        .select("name email phone skills profilePicture description resumeData createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    return res.status(200).json({
      candidates,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCandidates: total
    });
  }

  // 2. Clean input into an array of lowercase search terms
  const searchSkills = skills.split(",").map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
  
  // SECURITY: Escape regex using shared escapeRegex utility to prevent ReDoS
  const skillRegexArray = searchSkills.map(s => new RegExp(escapeRegex(s.slice(0, 50)), "i"));

  // Limit matched pool to 200 candidates to protect RAM under high concurrency
  const matchedUsers = await User.find({
    skills: { $in: skillRegexArray },
  })
  .select("name email phone skills profilePicture description resumeData createdAt")
  .limit(200)
  .lean();

  // 4. Calculate exact match scores for ranking
  const scoredCandidates = matchedUsers.map(candidate => {
    const candidateSkillsLower = (candidate.skills || []).map(s => s.toLowerCase());
    
    let matchCount = 0;
    const matchedSkills = [];

    searchSkills.forEach(searchTerm => {
      const found = candidateSkillsLower.find(cs => cs.includes(searchTerm));
      if (found) {
        matchCount++;
        matchedSkills.push(found);
      }
    });
    
    return {
      ...candidate,
      matchCount,
      totalSearched: searchSkills.length,
      matchedSkills: [...new Set(matchedSkills)]
    };
  });

  // 5. Sort: Candidates with all skills at the top, newest profile as tie-breaker
  scoredCandidates.sort((a, b) => {
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount; 
    }
    return new Date(b.createdAt) - new Date(a.createdAt); 
  });

  // 6. Paginate the sorted results
  const paginatedCandidates = scoredCandidates.slice(skip, skip + limit);

  res.status(200).json({
    candidates: paginatedCandidates,
    currentPage: page,
    totalPages: Math.ceil(scoredCandidates.length / limit),
    totalCandidates: scoredCandidates.length
  });
});


export const getMyCandidates = expressAsyncHandler(async (req, res) => {
  try {
    const employerId = req.employerId;

    // Direct indexed query using jobHost on Application to avoid 2-step roundtrip
    const applications = await Application.find({ jobHost: employerId })
      .populate("appliedBy", "name email phone profilePicture skills resumeData")
      .populate("job_id", "title postedByCompany postedByName isThirdPartyRecruiting showHiringCompanyName hiringCompanyName")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(applications);
  } catch (error) {
    console.error("ERROR IN getMyCandidates:", error);
    res.status(500).json({ message: "Server Error loading candidates" });
  }
});

export const forgotPasswordEmployer = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("A valid email address is required");
  }
  const normalizedEmail = normalizeEmail(email);
  const employer = await Employer.findOne({ email: normalizedEmail });
  if (!employer) {
    return res.status(200).json({ message: "If this email is registered, a password reset code has been sent." });
  }

  const otpCode = generateSecureOTP(6);
  const hashedOTP = await bcrypt.hash(otpCode, 10);
  
  // Clear existing password reset OTPs
  await OTP.deleteMany({ employerId: employer._id, type: "password_reset" });

  await OTP.create({
    employerId: employer._id,
    otp: hashedOTP,
    type: "password_reset",
    attempts: 0,
  });

  try {
    await sendEmail({
      email: employer.email,
      subject: 'Password Reset Request - JobOne',
      message: `Your password reset code is: ${otpCode}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
    });
  } catch (error) {
    await OTP.deleteMany({ employerId: employer._id, type: "password_reset" });
    res.status(500);
    throw new Error("Failed to send password reset email. Please try again later.");
  }

  res.status(200).json({ message: "If this email is registered, a password reset code has been sent." });
});

export const resetPasswordEmployer = expressAsyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("A valid email address is required");
  }
  if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
    res.status(400);
    throw new Error("A valid 6-digit OTP code is required");
  }

  const passCheck = validatePasswordStrength(newPassword);
  if (!passCheck.isValid) {
    res.status(400);
    throw new Error(passCheck.message);
  }

  const normalizedEmail = normalizeEmail(email);
  const employer = await Employer.findOne({ email: normalizedEmail });
  if (!employer) {
    res.status(400);
    throw new Error("Invalid request or employer not found");
  }

  const otpRecord = await OTP.findOne({ employerId: employer._id, type: "password_reset" });
  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired password reset code");
  }

  // Explicit 10-minute expiry check
  const isExpired = Date.now() - new Date(otpRecord.createdAt).getTime() > 10 * 60 * 1000;
  if (isExpired) {
    await OTP.deleteMany({ employerId: employer._id, type: "password_reset" });
    res.status(400);
    throw new Error("Password reset code has expired. Please request a new code.");
  }

  if (otpRecord.attempts >= 5) {
    await OTP.deleteMany({ employerId: employer._id, type: "password_reset" });
    res.status(429);
    throw new Error("Too many failed attempts. Please request a new password reset code.");
  }

  let isMatch = false;
  if (otpRecord.otp.startsWith("$2b$") || otpRecord.otp.startsWith("$2a$")) {
    isMatch = await bcrypt.compare(otp.trim(), otpRecord.otp);
  } else {
    isMatch = otpRecord.otp.trim() === otp.trim();
  }

  if (!isMatch) {
    otpRecord.attempts = (otpRecord.attempts || 0) + 1;
    await otpRecord.save();
    const remaining = 5 - otpRecord.attempts;
    res.status(400);
    throw new Error(remaining > 0 
      ? `Invalid verification code. ${remaining} attempt(s) remaining.` 
      : "Invalid verification code. Maximum attempts reached. Please request a new code.");
  }

  employer.password = await bcrypt.hash(newPassword, 10);
  await employer.save();

  // Invalidate password reset token immediately
  await OTP.deleteMany({ employerId: employer._id, type: "password_reset" });

  res.status(200).json({ message: "Password reset successful. You can now log in." });
});