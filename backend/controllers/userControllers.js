import User from "../models/users.js";
import Employer from "../models/employer.js";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { OAuth2Client } from 'google-auth-library';
import bcrypt from "bcrypt";
import UserOTP from '../models/userVerification.js';
import sendEmail from '../utils/emailVerification.js';
import { validationResult } from 'express-validator';

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

  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const existingEmployer = await Employer.findOne({ email });
  if (existingEmployer) {
    res.status(400);
    throw new Error("This email is already registered as an Employer.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    phone,
  });
  const savedUser = await user.save();

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await UserOTP.create({
      userId: savedUser._id,
      otp: otpCode,
    });

    await sendEmail({
      email: savedUser.email,
      subject: 'Verify your Job Portal Account',
      message: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      email: savedUser.email
    });

  } catch (error) {
    await User.deleteOne({ _id: savedUser._id });
    await UserOTP.deleteOne({ userId: savedUser._id });
    res.status(500);
    throw new Error('Verification email failed. Please try again.');
  }
});


export const verifyUserOTP = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400); throw new Error("Email and OTP are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404); throw new Error("User not found");
  }

  const userOTP = await UserOTP.findOne({ userId: user._id });
  if (!userOTP) {
    res.status(400); throw new Error("OTP expired or invalid");
  }

  if (userOTP.otp !== otp) {
    res.status(400); throw new Error("Invalid OTP");
  }

  user.isVerified = true;
  await user.save();
  await UserOTP.deleteOne({ userId: user._id });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5h' });

  res.status(200).json({
    message: "Email verified successfully",
    token,
    user: { id: user._id, name: user.name, email: user.email },
    isProfileComplete: false
  });
});

export const resendUserOTP = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400); throw new Error("Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404); throw new Error("User not found");
  }
  if (user.isVerified) {
    res.status(400); throw new Error("User is already verified");
  }

  // Delete existing OTP
  await UserOTP.deleteMany({ userId: user._id });

  // Create new OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  await UserOTP.create({
    userId: user._id,
    otp: otpCode,
  });

  await sendEmail({
    email: user.email,
    subject: 'Your New Verification Code',
    message: `Your new verification code is: ${otpCode}. It expires in 10 minutes.`,
  });

  res.status(200).json({ message: "OTP resent successfully" });
});


export const loginUser = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
        return res.status(401).json({ message: "Account not verified. Please verify email." });
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
      userId: user._id
    });
});


export const updateUser = expressAsyncHandler(async (req, res) => {
    const userId = req.params.id; 
    const updates = req.body;     

    const notAllowed = ["email", "password"]; 
    notAllowed.forEach(field => delete updates[field]);

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
    );

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
  const publicUrl = `https://jobone-mrpy.onrender.com/images/${key}`;
  
  res.status(200).json({ uploadUrl: url, key: key, publicUrl });
});


export const userDetails = expressAsyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    // 2. Check if user exists FIRST (Login Scenario)
    let user = await User.findOne({ email });

    if (user) {
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
        user: { id: user._id, name: user.name, email: user.email },
        isProfileComplete: !!isProfileComplete 
      });

    } else {
      // --- SCENARIO 2: NEW USER (REGISTER) ---
      // 3. Check for Employer collision BEFORE creating a new user
      const existingEmployer = await Employer.findOne({ email });
      if (existingEmployer) {
        res.status(400);
        throw new Error("This email is already registered as an Employer. You cannot create a Jobseeker account with this email.");
      }
      // --- SCENARIO 2: NEW USER (REGISTER) ---
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // FACT: We inject a completely unique dummy phone number to prevent MongoDB E11000 duplicate key crashes
      const dummyPhone = `G-${Date.now().toString().slice(-8)}`;

      const newUser = new User({
        name,
        email,
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
  const user = await User.findById(req.params.id);
  
  if (!user || !user.resumeFileKey) {
    res.status(404); throw new Error("No resume file uploaded for this user");
  }

  // SECURITY: Allow anyone authenticated to view the resume
  if (!req.employerId && !req.user && !req.admin) {
    res.status(401); throw new Error("Not authorized");
  }

  const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: user.resumeFileKey });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 }); // 1 hour access for recruiters

  res.status(200).json({ viewableUrl: url });
});

export const getDownloadableResumeUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client(); 
  const user = await User.findById(req.params.id);

  if (!user || !user.resumeFileKey) {
    res.status(404); throw new Error("No resume file uploaded for this user");
  }

  // SECURITY: Allow anyone authenticated to download the resume
  if (!req.employerId && !req.user && !req.admin) {
    res.status(401); throw new Error("Not authorized");
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: user.resumeFileKey,
    ResponseContentDisposition: `attachment; filename="${user.name.replace(/\s+/g, '_')}_Resume"`,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 300 });
  res.status(200).json({ downloadableUrl: url });
});

export const forgotPasswordUser = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found with this email");
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Clear any existing OTPs for password reset to prevent spam
  await UserOTP.deleteMany({ userId: user._id });

  await UserOTP.create({
    userId: user._id,
    otp: otpCode,
  });

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request - Job Portal',
    message: `Your password reset code is: ${otpCode}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
  });

  res.status(200).json({ message: "Password reset OTP sent to your email." });
});

export const resetPasswordUser = expressAsyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const otpRecord = await UserOTP.findOne({ userId: user._id, otp: otp });
  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await UserOTP.deleteOne({ _id: otpRecord._id });

  res.status(200).json({ message: "Password reset successful. You can now log in." });
});

// ==========================================
// JOBSEEKER VERIFICATION DOCUMENTS ENDPOINTS
// ==========================================

export const getJobseekerDocumentUploadUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client();
  const userId = req.params.id;
  const { fileType, field } = req.body;

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
  const user = await User.findById(req.params.id);
  const { field } = req.query;

  if (!user) {
    res.status(404); throw new Error("User not found");
  }
  if (!field || !user.documents || !user.documents[field] || !user.documents[field].key) {
    res.status(404); throw new Error(`No document uploaded for ${field}`);
  }

  // SECURITY: Allow authenticated user or employer to view
  if (!req.employerId && !req.user && !req.admin) {
    res.status(401); throw new Error("Not authorized");
  }

  const key = user.documents[field].key;
  const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  res.status(200).json({ viewableUrl: url });
});

export const getDownloadableJobseekerDocumentUrl = expressAsyncHandler(async (req, res) => {
  const client = getS3Client();
  const user = await User.findById(req.params.id);
  const { field } = req.query;

  if (!user) {
    res.status(404); throw new Error("User not found");
  }
  if (!field || !user.documents || !user.documents[field] || !user.documents[field].key) {
    res.status(404); throw new Error(`No document uploaded for ${field}`);
  }

  if (!req.employerId && !req.user && !req.admin) {
    res.status(401); throw new Error("Not authorized");
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

  if (!field) {
    res.status(400); throw new Error("Document field is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404); throw new Error("User not found");
  }

  if (user.documents && user.documents[field]) {
    user.documents[field] = { key: "", name: "" };
    await user.save();
  }

  res.status(200).json({ message: "Document removed successfully.", documents: user.documents });
});