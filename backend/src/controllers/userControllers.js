import User from "../models/users.js";
import Employer from "../models/employer.js";
import Admin from "../models/admin.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { OAuth2Client } from 'google-auth-library';
import bcrypt from "bcrypt";
import UserOTP from '../models/userVerification.js';
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

  // 5. Check Duplicate Email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    if (existingUser.isVerified) {
      res.status(400);
      throw new Error("An account with this email already exists. Please log in.");
    }
  }

  const existingEmployer = await Employer.findOne({ email: normalizedEmail });
  if (existingEmployer) {
    res.status(400);
    throw new Error("This email is already registered as an Employer.");
  }

  // 6. Check Duplicate Phone across Jobseekers and Employers
  const phoneQuery = {
    $or: [{ phone: formattedPhone }, { phone: rawDigits }],
  };

  const phoneInUser = await User.findOne(phoneQuery);
  if (phoneInUser && (!existingUser || phoneInUser._id.toString() !== existingUser._id.toString())) {
    res.status(400);
    throw new Error("This mobile number is already registered to a candidate account.");
  }

  const phoneInEmployer = await Employer.findOne(phoneQuery);
  if (phoneInEmployer) {
    res.status(400);
    throw new Error("This mobile number is already registered to an Employer account.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let savedUser;
  if (existingUser && !existingUser.isVerified) {
    // Refresh existing unverified user
    existingUser.name = nameCheck.value;
    existingUser.password = hashedPassword;
    existingUser.phone = formattedPhone;
    savedUser = await existingUser.save();
    await UserOTP.deleteMany({ userId: savedUser._id });
  } else {
    const user = new User({
      name: nameCheck.value,
      email: normalizedEmail,
      password: hashedPassword,
      phone: formattedPhone,
    });
    savedUser = await user.save();
  }

  const otpCode = generateSecureOTP(6);

  try {
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    await UserOTP.deleteMany({ userId: savedUser._id });
    await UserOTP.create({
      userId: savedUser._id,
      otp: hashedOTP,
      type: "verification",
      attempts: 0,
    });

    await sendEmail({
      email: savedUser.email,
      subject: 'Verify your JobOne Account',
      message: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      email: savedUser.email
    });

  } catch (error) {
    if (!existingUser) {
      await User.deleteOne({ _id: savedUser._id });
    }
    await UserOTP.deleteMany({ userId: savedUser._id });
    res.status(500);
    throw new Error('Verification email failed to send. Please try again.');
  }
});


export const verifyUserOTP = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400); throw new Error("Email and OTP are required");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    res.status(404); throw new Error("Candidate account not found");
  }

  // Handle already verified user
  if (user.isVerified) {
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );
    return res.status(200).json({
      message: "Email is already verified. You can log in.",
      alreadyVerified: true,
      token,
      userId: user._id,
      id: user._id,
      user: { id: user._id, name: user.name, email: user.email },
      isProfileComplete: user.isProfileComplete || false
    });
  }

  const userOTP = await UserOTP.findOne({ userId: user._id, type: "verification" });
  if (!userOTP) {
    res.status(400); throw new Error("Verification code has expired or does not exist. Please request a new code.");
  }

  // Explicit 10-minute expiry check
  const isExpired = Date.now() - new Date(userOTP.createdAt).getTime() > 10 * 60 * 1000;
  if (isExpired) {
    await UserOTP.deleteMany({ userId: user._id, type: "verification" });
    res.status(400); throw new Error("Verification code has expired. Please request a new code.");
  }

  // Attempt limit check (maximum 5 attempts)
  if (userOTP.attempts >= 5) {
    await UserOTP.deleteMany({ userId: user._id, type: "verification" });
    return res.status(429).json({ message: "Too many failed attempts. Please request a new verification code." });
  }

  let isMatch = false;
  if (userOTP.otp.startsWith("$2b$") || userOTP.otp.startsWith("$2a$")) {
    isMatch = await bcrypt.compare(String(otp).trim(), userOTP.otp);
  } else {
    isMatch = userOTP.otp.trim() === String(otp).trim();
  }

  if (!isMatch) {
    userOTP.attempts = (userOTP.attempts || 0) + 1;
    await userOTP.save();
    const remaining = 5 - userOTP.attempts;
    return res.status(400).json({
      message: remaining > 0 
        ? `Invalid verification code. ${remaining} attempt(s) remaining.` 
        : "Invalid verification code. Maximum attempts reached. Please request a new code."
    });
  }

  user.isVerified = true;
  await user.save();
  await UserOTP.deleteMany({ userId: user._id, type: "verification" });

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '5h' });

  res.status(200).json({
    message: "Email verified successfully",
    token,
    userId: user._id,
    id: user._id,
    user: { id: user._id, name: user.name, email: user.email },
    isProfileComplete: user.isProfileComplete || false
  });
});

export const resendUserOTP = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400); throw new Error("Email is required");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    res.status(404); throw new Error("Candidate account not found");
  }
  if (user.isVerified) {
    res.status(400); throw new Error("This account is already verified. Please log in.");
  }

  // Rate limiting: Prevent requesting a new OTP within 30 seconds
  const existingOTP = await UserOTP.findOne({ userId: user._id, type: "verification" });
  if (existingOTP && (Date.now() - new Date(existingOTP.createdAt).getTime()) < 30 * 1000) {
    const remainingSec = Math.ceil((30 * 1000 - (Date.now() - new Date(existingOTP.createdAt).getTime())) / 1000);
    res.status(429);
    throw new Error(`Please wait ${remainingSec} seconds before requesting another code.`);
  }

  // Delete existing verification OTPs
  await UserOTP.deleteMany({ userId: user._id, type: "verification" });

  // Create new hashed OTP using cryptographically secure random generator
  const otpCode = generateSecureOTP(6);
  const hashedOTP = await bcrypt.hash(otpCode, 10);
  await UserOTP.create({
    userId: user._id,
    otp: hashedOTP,
    type: "verification",
    attempts: 0,
  });

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your New Verification Code - JobOne',
      message: `Your new verification code is: ${otpCode}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: "A new verification code has been sent to your email." });
  } catch (error) {
    await UserOTP.deleteMany({ userId: user._id, type: "verification" });
    res.status(500);
    throw new Error("Could not send verification email. Please try again later.");
  }
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
        if (decoded.id && decoded.id.toString() === userId.toString()) {
          isAuthorized = true;
        } else if (decoded.id) {
          const admin = await Admin.findById(decoded.id);
          if (admin) isAuthorized = true;
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

    // 1. Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, name, picture } = ticket.getPayload();
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
    // FACT: If it crashes again, it will print the real reason in your backend terminal/logs
    console.error("FATAL GOOGLE LOGIN ERROR:", error);
    res.status(500);
    throw new Error(`Google Login Failed: ${error.message}`);
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