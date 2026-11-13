import User from "../models/users.js";
import Employer from "../models/employer.js";
import Admin from "../models/admin.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { OAuth2Client } from 'google-auth-library';
import bcrypt from "bcrypt";
import UserOTP from '../models/userVerification.js';
import PendingRegistration from '../models/pendingRegistration.js';
import sendEmail from '../utils/sendEmail.js';
import { validationResult } from 'express-validator';
import {
  isValidEmail,
  validatePasswordStrength,
  validatePhone,
  validateName,
  sanitizeString,
  normalizeEmail,
  generateSecureOTP,
} from '../utils/validators.js';

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Application from "../models/applications.js";
import crypto from 'crypto';

let s3Client;
const getS3Client = () => {
  if (!s3Client) {
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


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const createUser = expressAsyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password, phone, countryCode } = req.body;

  // 1. Validate Name
  const nameCheck = validateName(name, "Name");
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

  // 5. Check Duplicate Email across verified accounts
  const existingVerifiedUser = await User.findOne({ email: normalizedEmail, isVerified: true });
  if (existingVerifiedUser) {
    res.status(400);
    throw new Error("An account with this email already exists. Please log in.");
  }

  const existingVerifiedEmployer = await Employer.findOne({ email: normalizedEmail, isVerified: true });
  if (existingVerifiedEmployer) {
    res.status(400);
    throw new Error("This email is already registered as an Employer.");
  }

  // Clean up any stale unverified candidate records that were left over from previous incomplete attempts
  await User.deleteMany({ email: normalizedEmail, isVerified: false });

  // 6. Check Duplicate Phone across verified Jobseekers and Employers
  const phoneQuery = {
    $or: [{ phone: formattedPhone }, { phone: rawDigits }],
    isVerified: true,
  };

  const phoneInUser = await User.findOne(phoneQuery);
  if (phoneInUser) {
    res.status(400);
    throw new Error("This mobile number is already registered to a candidate account.");
  }

  const phoneInEmployer = await Employer.findOne(phoneQuery);
  if (phoneInEmployer) {
    res.status(400);
    throw new Error("This mobile number is already registered to an Employer account.");
  }

  // Hash password with bcrypt cost 10
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate 6-digit OTP using cryptographically secure random generator
  const otpCode = generateSecureOTP(6);
  const hashedOTP = await bcrypt.hash(otpCode, 10);

  // Remove any previous pending registration for this email and role
  await PendingRegistration.deleteMany({ email: normalizedEmail, role: "candidate" });

  // Create isolated temporary PendingRegistration record (TTL: 10 minutes)
  // SECURITY MANDATE: Do NOT create any permanent User record!
  const pendingReg = await PendingRegistration.create({
    role: "candidate",
    email: normalizedEmail,
    data: {
      name: nameCheck.value,
      password: hashedPassword,
      phone: formattedPhone,
      countryCode: countryCode || "+91",
    },
    otp: hashedOTP,
    attempts: 0,
    lastResendAt: new Date(),
    resendCount: 0,
  });

  try {
    await sendEmail({
      email: normalizedEmail,
      subject: "Verify your JobOne Account",
      message: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
    });

    res.status(201).json({
      message: "Registration initiated. Please check your email to verify your account.",
      email: normalizedEmail,
    });
  } catch (error) {
    await PendingRegistration.deleteMany({ _id: pendingReg._id });
    console.error("Candidate OTP email dispatch failed:", error);
    res.status(500);
    throw new Error("Verification email failed to send. Please try again.");
  }
});


export const verifyUserOTP = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const normalizedEmail = normalizeEmail(email);

  // Look up isolated pending registration
  const pending = await PendingRegistration.findOne({ email: normalizedEmail, role: "candidate" });

  if (!pending) {
    // Check if user already completed verification previously
    const verifiedUser = await User.findOne({ email: normalizedEmail, isVerified: true });
    if (verifiedUser) {
      const token = jwt.sign(
        { id: verifiedUser._id, email: verifiedUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "5h" }
      );
      return res.status(200).json({
        message: "Email is already verified. You can log in.",
        alreadyVerified: true,
        token,
        userId: verifiedUser._id,
        id: verifiedUser._id,
        user: { id: verifiedUser._id, name: verifiedUser.name, email: verifiedUser.email },
        isProfileComplete: verifiedUser.isProfileComplete || false,
      });
    }

    res.status(400);
    throw new Error("Registration session has expired or does not exist. Please register again from the beginning.");
  }

  // Explicit 10-minute expiry check
  const isExpired = Date.now() - new Date(pending.createdAt).getTime() > 10 * 60 * 1000;
  if (isExpired) {
    await PendingRegistration.deleteMany({ email: normalizedEmail, role: "candidate" });
    res.status(400);
    throw new Error("Verification code has expired. Registration discarded. Please register again from the beginning.");
  }

  // Attempt limit check (maximum 5 attempts)
  if (pending.attempts >= 5) {
    await PendingRegistration.deleteMany({ email: normalizedEmail, role: "candidate" });
    return res.status(429).json({
      message: "Too many failed attempts. Registration discarded for security. Please register again from the beginning.",
    });
  }

  let isMatch = false;
  if (pending.otp.startsWith("$2b$") || pending.otp.startsWith("$2a$")) {
    isMatch = await bcrypt.compare(String(otp).trim(), pending.otp);
  } else {
    isMatch = pending.otp.trim() === String(otp).trim();
  }

  if (!isMatch) {
    pending.attempts = (pending.attempts || 0) + 1;
    await pending.save();
    const remaining = 5 - pending.attempts;
    if (remaining <= 0) {
      await PendingRegistration.deleteMany({ email: normalizedEmail, role: "candidate" });
      return res.status(400).json({
        message: "Invalid verification code. Maximum attempts reached. Registration discarded. Please register again.",
      });
    }
    return res.status(400).json({
      message: `Invalid verification code. ${remaining} attempt(s) remaining.`,
    });
  }

  // =========================================================================
  // MANDATORY SECURITY RULE: Account is created ONLY after successful OTP match!
  // =========================================================================
  // Clean up any stale unverified records if any exist
  await User.deleteMany({ email: normalizedEmail, isVerified: false });

  const newUser = new User({
    name: pending.data.name,
    email: pending.email,
    password: pending.data.password, // Pre-hashed with bcrypt
    phone: pending.data.phone,
    isVerified: true,
  });
  const savedUser = await newUser.save();

  // Invalidate and delete pending registration so OTP can never be replayed
  await PendingRegistration.deleteMany({ email: normalizedEmail, role: "candidate" });

  const token = jwt.sign(
    { id: savedUser._id, email: savedUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );

  res.status(200).json({
    message: "Email verified successfully! Welcome to JobOne.",
    token,
    userId: savedUser._id,
    id: savedUser._id,
    user: { id: savedUser._id, name: savedUser.name, email: savedUser.email },
    isProfileComplete: savedUser.isProfileComplete || false,
  });
});

export const resendUserOTP = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const normalizedEmail = normalizeEmail(email);

  // Look up active pending registration
  const pending = await PendingRegistration.findOne({ email: normalizedEmail, role: "candidate" });
  if (!pending) {
    // Check if already verified
    const verifiedUser = await User.findOne({ email: normalizedEmail, isVerified: true });
    if (verifiedUser) {
      res.status(400);
      throw new Error("This account is already verified. Please log in.");
    }
    res.status(400);
    throw new Error("Registration session has expired or does not exist. Please register again from the beginning.");
  }

  // Enforce server-side cooldown (60 seconds)
  const elapsed = Date.now() - new Date(pending.lastResendAt || pending.createdAt).getTime();
  if (elapsed < 60 * 1000) {
    const remainingSec = Math.ceil((60 * 1000 - elapsed) / 1000);
    res.status(429);
    throw new Error(`Please wait ${remainingSec} seconds before requesting another code.`);
  }

  // Enforce maximum resend limit (5 resends)
  if (pending.resendCount >= 5) {
    await PendingRegistration.deleteMany({ email: normalizedEmail, role: "candidate" });
    res.status(429);
    throw new Error("Maximum resend limit reached. Registration discarded for security. Please start over.");
  }

  // Generate new OTP & hash
  const otpCode = generateSecureOTP(6);
  const hashedOTP = await bcrypt.hash(otpCode, 10);

  // Update pending registration
  pending.otp = hashedOTP;
  pending.attempts = 0;
  pending.lastResendAt = new Date();
  pending.resendCount = (pending.resendCount || 0) + 1;
  pending.createdAt = new Date(); // Refresh 10-minute TTL
  await pending.save();

  try {
    await sendEmail({
      email: normalizedEmail,
      subject: "Your New Verification Code - JobOne",
      message: `Your new verification code is: ${otpCode}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: "A new verification code has been sent to your email." });
  } catch (error) {
    console.error("Candidate OTP resend email dispatch failed:", error);
    res.status(500);
    throw new Error("Could not send verification email. Please try again later.");
  }
});


export const cancelUserRegistration = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (email) {
    const normalizedEmail = normalizeEmail(email);
    // Discard any active pending registration
    await PendingRegistration.deleteMany({ email: normalizedEmail, role: "candidate" });
    // Ensure no unverified account lingers
    await User.deleteMany({ email: normalizedEmail, isVerified: false });
  }
  res.status(200).json({ message: "Registration cancelled and temporary data discarded successfully." });
});


export const loginUser = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isFrozen) {
      return res.status(403).json({ message: "Account Suspended: Your account has been frozen by the administration." });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        message: "Account not verified. Please verify your email first.",
        unverified: true,
        email: user.email
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "120h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      userId: user._id,
      id: user._id,
      isProfileComplete: user.isProfileComplete || false
    });
});


export const updateUser = expressAsyncHandler(async (req, res) => {
    const userId = req.params.id; 
    const updates = req.body;     

    // IDOR Security Protection: Ensure user can only update their own profile
    if (!req.user || req.user._id.toString() !== userId) {
      res.status(403);
      throw new Error("Forbidden: Not authorized to update this profile");
    }

    const notAllowed = ["email", "password", "_id", "isVerified", "isFrozen"]; 
    notAllowed.forEach(field => delete updates[field]);

    // Validate phone update if provided
    if (updates.phone) {
      const phoneCheck = validatePhone(updates.phone);
      if (!phoneCheck.isValid) {
        res.status(400);
        throw new Error(phoneCheck.message);
      }
      // Check phone uniqueness
      const existingPhone = await User.findOne({
        _id: { $ne: userId },
        $or: [{ phone: phoneCheck.formatted }, { phone: phoneCheck.rawDigits }]
      });
      if (existingPhone) {
        res.status(400);
        throw new Error("This phone number is already registered by another account");
      }
      updates.phone = phoneCheck.formatted;
    }

    // FACT: If the profile picture is being updated, delete the old one from S3 if it exists
    if (updates.profilePicture) {
      const oldUser = await User.findById(userId);
      if (oldUser && oldUser.profilePicture && oldUser.profilePicture.includes("amazonaws.com") && oldUser.profilePicture !== updates.profilePicture) {
        try {
          const urlObj = new URL(oldUser.profilePicture);
          const key = urlObj.pathname.substring(1); // Remove leading slash
          if (key) {
            const client = getS3Client();
            await client.send(new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: decodeURIComponent(key)
            }));
            console.log(`Deleted old profile picture: ${key}`);
          }
        } catch (err) {
          console.error("Failed to delete old profile picture from S3:", err);
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },  
      { new: true, runValidators: true } 
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
});

export const getProfilePicUploadUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client();
  const userId = req.params.id;
  const { fileType } = req.body; 
  
  if (!fileType) {
    res.status(400); throw new Error("File type is required");
  }

  const extension = fileType.split('/')[1] || 'jpg';
  const randomBytes = crypto.randomBytes(8).toString('hex');
  const key = `profile_pictures/user-${userId}-${randomBytes}.${extension}`;

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


export const userDetails = expressAsyncHandler(async (req, res) => {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    let isAuthorized = false;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const targetId = decoded.id || (decoded.employer && decoded.employer.id);
        if (targetId && targetId.toString() === userId.toString()) {
          isAuthorized = true;
        } else if (targetId) {
          const [admin, employer] = await Promise.all([
            Admin.findById(targetId),
            Employer.findById(targetId),
          ]);
          if (admin || employer) isAuthorized = true;
        }
      } catch (e) {
        // Invalid token, treat as public/unauthorized
      }
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!isAuthorized) {
      // Sanitize sensitive documents so internal S3 keys are not exposed to unauthenticated callers
      const userObj = user.toObject();
      delete userObj.documents;
      delete userObj.resumeFileKey;
      return res.status(200).json(userObj);
    }

    return res.status(200).json(user);
});


export const googleLogin = expressAsyncHandler(async (req, res) => {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) {
      res.status(400);
      throw new Error("Google authentication token is required.");
    }

    let email, name, picture, googleId;
    const isIdToken = typeof googleToken === "string" && googleToken.split(".").length === 3;

    if (isIdToken) {
      // 1. Verify Google OIDC ID Token (JWT)
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    } else {
      // 2. Verify Google OAuth2 Access Token
      const tokenInfo = await client.getTokenInfo(googleToken);
      if (tokenInfo.aud && process.env.GOOGLE_CLIENT_ID && tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
        res.status(401);
        throw new Error("Invalid Google OAuth client credentials.");
      }

      const googleUserRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${googleToken}` },
      });
      if (!googleUserRes.ok) {
        res.status(401);
        throw new Error("Failed to verify Google access token with Google identity service.");
      }
      const profile = await googleUserRes.json();
      email = profile.email;
      name = profile.name;
      picture = profile.picture;
      googleId = profile.sub;
    }

    if (!email) {
      res.status(400);
      throw new Error("Unable to retrieve email from Google authentication.");
    }
    const normalizedEmail = normalizeEmail(email);

    // 2. Check if user exists FIRST (Login Scenario)
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.isFrozen) {
        return res.status(403).json({ message: "Account Suspended: Your account has been frozen by the administration." });
      }

      // --- SCENARIO 1: EXISTING USER (LOGIN) ---
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5h' });
      
      if (!user.profilePicture) {
          user.profilePicture = picture;
          await user.save();
      }

      // Check if they have a REAL phone number (not our dummy one) and skills
      const hasRealPhone = user.phone && !user.phone.startsWith("G-");
      const isProfileComplete = hasRealPhone && user.skills && user.skills.length > 0;

      return res.status(200).json({
        message: "Google Login Successful",
        token,
        userId: user._id,
        id: user._id,
        user: { id: user._id, name: user.name, email: user.email },
        isProfileComplete: !!isProfileComplete 
      });

    } else {
      // --- SCENARIO 2: NEW USER (REGISTER) ---
      // 3. Check for Employer collision BEFORE creating a new user
      const existingEmployer = await Employer.findOne({ email: normalizedEmail });
      if (existingEmployer) {
        res.status(400);
        throw new Error("This email is already registered as an Employer. You cannot create a Jobseeker account with this email.");
      }
      // --- SCENARIO 2: NEW USER (REGISTER) ---
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // FACT: We inject a completely unique dummy phone number to prevent MongoDB E11000 duplicate key crashes
      const dummyPhone = `G-${Date.now().toString().slice(-8)}`;

      const newUser = new User({
        name: name ? name.trim() : "Jobseeker",
        email: normalizedEmail,
        password: hashedPassword,
        profilePicture: picture,
        isVerified: true, 
        phone: dummyPhone // Bypass crash here
      });

      const savedUser = await newUser.save();
      
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '5h' });

      // Send false so frontend redirects to Edit Profile
      return res.status(201).json({
        message: "Google Registration Successful",
        token,
        userId: savedUser._id,
        user: { id: savedUser._id, name, email },
        isProfileComplete: false 
      });
    }
  } catch (error) {
    console.error("FATAL GOOGLE LOGIN ERROR:", error);
    const status = res.statusCode >= 400 ? res.statusCode : 401;
    res.status(status);
    throw new Error(error.message || "Google Authentication Failed");
  }
});

export const getResumeUploadUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client();
  const userId = req.params.id;
  const { fileType } = req.body; 

  if (!req.user || req.user._id.toString() !== userId) {
    return res.status(403).json({ message: "Forbidden: Not authorized to upload resume for this user" });
  }
  
  if (!fileType) {
    res.status(400); throw new Error("File type is required");
  }

  // Handle docx, doc, pdf extensions
  let extension = "pdf";
  if (fileType.includes("wordprocessingml")) extension = "docx";
  else if (fileType.includes("msword")) extension = "doc";
  
  const randomBytes = crypto.randomBytes(8).toString('hex');
  const key = `resumes/applicant-${userId}-${randomBytes}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 600 });
  res.status(200).json({ uploadUrl: url, key: key });
});

export const saveResumeKey = expressAsyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { key } = req.body;

  if (!req.user || req.user._id.toString() !== userId) {
    return res.status(403).json({ message: "Forbidden: Not authorized to update resume for this user" });
  }

  if (!key) {
    res.status(400); throw new Error("Document key is required");
  }
  
  const user = await User.findByIdAndUpdate(userId, { resumeFileKey: key }, { new: true });
  if (!user) {
    res.status(404); throw new Error("User not found");
  }

  res.status(200).json({ message: "Resume saved successfully.", resumeFileKey: key });
});

export const getViewableResumeUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client(); 
  const targetUserId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(targetUserId);
  if (!user || !user.resumeFileKey) {
    return res.status(404).json({ message: "No resume file uploaded for this user" });
  }

  // OBJECT-LEVEL AUTHORIZATION:
  // 1. Candidate accessing own resume
  const isOwner = req.user && req.user._id.toString() === targetUserId.toString();
  // 2. Admin
  const isAdmin = Boolean(req.admin);
  // 3. Employer: allowed ONLY if this candidate applied to a job posted by this employer
  let isAuthorizedEmployer = false;
  if (req.employerId) {
    const hasApplication = await Application.exists({
      appliedBy: targetUserId,
      jobHost: req.employerId
    });
    if (hasApplication) {
      isAuthorizedEmployer = true;
    }
  }

  if (!isOwner && !isAdmin && !isAuthorizedEmployer) {
    return res.status(403).json({ message: "Forbidden: You are not authorized to view this resume" });
  }

  const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: user.resumeFileKey });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  res.status(200).json({ viewableUrl: url });
});

export const getDownloadableResumeUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client(); 
  const targetUserId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(targetUserId);
  if (!user || !user.resumeFileKey) {
    return res.status(404).json({ message: "No resume file uploaded for this user" });
  }

  // OBJECT-LEVEL AUTHORIZATION
  const isOwner = req.user && req.user._id.toString() === targetUserId.toString();
  const isAdmin = Boolean(req.admin);
  let isAuthorizedEmployer = false;
  if (req.employerId) {
    const hasApplication = await Application.exists({
      appliedBy: targetUserId,
      jobHost: req.employerId
    });
    if (hasApplication) {
      isAuthorizedEmployer = true;
    }
  }

  if (!isOwner && !isAdmin && !isAuthorizedEmployer) {
    return res.status(403).json({ message: "Forbidden: You are not authorized to download this resume" });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: user.resumeFileKey,
    ResponseContentDisposition: `attachment; filename="${(user.name || 'Candidate').replace(/\s+/g, '_')}_Resume"`,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 300 });
  res.status(200).json({ downloadableUrl: url });
});

export const forgotPasswordUser = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("A valid email address is required");
  }
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  
  // Safe response to prevent account enumeration
  if (!user) {
    return res.status(200).json({ message: "If this email is registered, a password reset code has been sent." });
  }

  const otpCode = generateSecureOTP(6);
  const hashedOTP = await bcrypt.hash(otpCode, 10);
  
  // Clear any existing OTPs for password reset to prevent spam/replay
  await UserOTP.deleteMany({ userId: user._id, type: "password_reset" });

  await UserOTP.create({
    userId: user._id,
    otp: hashedOTP,
    type: "password_reset",
    attempts: 0,
  });

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - JobOne',
      message: `Your password reset code is: ${otpCode}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
    });
  } catch (error) {
    await UserOTP.deleteMany({ userId: user._id, type: "password_reset" });
    res.status(500);
    throw new Error("Failed to send password reset email. Please try again later.");
  }

  res.status(200).json({ message: "If this email is registered, a password reset code has been sent." });
});

export const resetPasswordUser = expressAsyncHandler(async (req, res) => {
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
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    res.status(400);
    throw new Error("Invalid request or user not found");
  }

  const otpRecord = await UserOTP.findOne({ userId: user._id, type: "password_reset" });
  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired password reset code");
  }

  // Explicit 10-minute expiry check
  const isExpired = Date.now() - new Date(otpRecord.createdAt).getTime() > 10 * 60 * 1000;
  if (isExpired) {
    await UserOTP.deleteMany({ userId: user._id, type: "password_reset" });
    res.status(400);
    throw new Error("Password reset code has expired. Please request a new code.");
  }

  if (otpRecord.attempts >= 5) {
    await UserOTP.deleteMany({ userId: user._id, type: "password_reset" });
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

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Invalidate password reset token immediately
  await UserOTP.deleteMany({ userId: user._id, type: "password_reset" });

  res.status(200).json({ message: "Password reset successful. You can now log in." });
});

// ==========================================
// JOBSEEKER VERIFICATION DOCUMENTS ENDPOINTS
// ==========================================

export const getJobseekerDocumentUploadUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client();
  const userId = req.params.id;
  const { fileType, field } = req.body;

  if (!req.user || req.user._id.toString() !== userId) {
    return res.status(403).json({ message: "Forbidden: Not authorized to upload documents for this user" });
  }

  if (!fileType || !field) {
    res.status(400); throw new Error("File type and document field are required");
  }

  const extension = fileType.split('/')[1] || 'pdf';
  const randomBytes = crypto.randomBytes(8).toString('hex');
  const key = `jobseeker_documents/${userId}/${field}/${randomBytes}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 600 });
  res.status(200).json({ uploadUrl: url, key: key });
});

export const saveJobseekerDocumentKey = expressAsyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { field, key, fileName } = req.body;

  if (!req.user || req.user._id.toString() !== userId) {
    return res.status(403).json({ message: "Forbidden: Not authorized to save documents for this user" });
  }

  if (!field || !key) {
    res.status(400); throw new Error("Document field and key are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404); throw new Error("User not found");
  }

  if (!user.documents) {
    user.documents = {};
  }
  user.documents[field] = { key: key, name: fileName || "Uploaded Document" };
  await user.save();

  res.status(200).json({ message: "Document saved successfully.", documents: user.documents });
});

export const getViewableJobseekerDocumentUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client();
  const targetUserId = req.params.id;
  const { field } = req.query;

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!field || !user.documents || !user.documents[field] || !user.documents[field].key) {
    return res.status(404).json({ message: `No document uploaded for ${field}` });
  }

  // OBJECT-LEVEL AUTHORIZATION
  const isOwner = req.user && req.user._id.toString() === targetUserId.toString();
  const isAdmin = Boolean(req.admin);
  let isAuthorizedEmployer = false;
  if (req.employerId) {
    const hasApplication = await Application.exists({
      appliedBy: targetUserId,
      jobHost: req.employerId
    });
    if (hasApplication) {
      isAuthorizedEmployer = true;
    }
  }

  if (!isOwner && !isAdmin && !isAuthorizedEmployer) {
    return res.status(403).json({ message: "Forbidden: You are not authorized to view this document" });
  }

  const key = user.documents[field].key;
  const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  res.status(200).json({ viewableUrl: url });
});

export const getDownloadableJobseekerDocumentUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client();
  const targetUserId = req.params.id;
  const { field } = req.query;

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!field || !user.documents || !user.documents[field] || !user.documents[field].key) {
    return res.status(404).json({ message: `No document uploaded for ${field}` });
  }

  // OBJECT-LEVEL AUTHORIZATION
  const isOwner = req.user && req.user._id.toString() === targetUserId.toString();
  const isAdmin = Boolean(req.admin);
  let isAuthorizedEmployer = false;
  if (req.employerId) {
    const hasApplication = await Application.exists({
      appliedBy: targetUserId,
      jobHost: req.employerId
    });
    if (hasApplication) {
      isAuthorizedEmployer = true;
    }
  }

  if (!isOwner && !isAdmin && !isAuthorizedEmployer) {
    return res.status(403).json({ message: "Forbidden: You are not authorized to download this document" });
  }

  const key = user.documents[field].key;
  const originalName = user.documents[field].name || `${field}.pdf`;
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${originalName.replace(/\s+/g, '_')}"`,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 300 });
  res.status(200).json({ downloadableUrl: url });
});

export const deleteJobseekerDocument = expressAsyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { field } = req.body;

  if (!req.user || req.user._id.toString() !== userId) {
    return res.status(403).json({ message: "Forbidden: Not authorized to delete documents for this user" });
  }

  if (!field) {
    res.status(400); throw new Error("Document field is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404); throw new Error("User not found");
  }

  if (user.documents && user.documents[field]) {
    const oldKey = user.documents[field].key;
    if (oldKey) {
      try {
        const client = getS3Client();
        await client.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldKey
        }));
      } catch (err) {
        console.error("Failed to delete S3 document object:", err);
      }
    }
    user.documents[field] = { key: "", name: "" };
    await user.save();
  }

  res.status(200).json({ message: "Document removed successfully.", documents: user.documents });
});