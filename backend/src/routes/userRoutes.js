import express from "express";
import { 
  createUser, loginUser, updateUser, userDetails, verifyUserOTP, resendUserOTP, googleLogin,
  getResumeUploadUrl, saveResumeKey, getViewableResumeUrl, getDownloadableResumeUrl, getProfilePicUploadUrl,
  forgotPasswordUser, resetPasswordUser,
  getJobseekerDocumentUploadUrl, saveJobseekerDocumentKey, getViewableJobseekerDocumentUrl, getDownloadableJobseekerDocumentUrl, deleteJobseekerDocument
} from "../controllers/userControllers.js";
import { protectAny, protect } from "../middleware/authorization.js";

import { body } from "express-validator";

const router = express.Router();

const registerRules = [
  body("name", "Name is required and must be between 2 and 80 characters")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 80 }),
  body("email", "A valid email address is required")
    .isEmail()
    .normalizeEmail(),
  body("password", "Password must be at least 6 characters long")
    .isLength({ min: 6 }),
  body("phone", "Phone number is required")
    .notEmpty()
    .trim(),
];

// Auth & Profile
router.post("/register", registerRules, createUser);
router.post("/login", loginUser);
router.post("/verifyotp", verifyUserOTP);
router.post("/resend-otp", resendUserOTP);
router.post("/google-login", googleLogin);
router.patch("/:id", protect, updateUser);
router.get("/:id", protectAny, userDetails);
router.post("/forgot-password", forgotPasswordUser);
router.post("/reset-password", resetPasswordUser);

// FACT: New S3 Resume Endpoints
router.post("/:id/resume/upload-url", protect, getResumeUploadUrl);
router.post("/:id/profile-picture/upload-url", protect, getProfilePicUploadUrl);
router.post("/:id/resume/save-key", protect, saveResumeKey);
router.get("/:id/resume/view", protectAny, getViewableResumeUrl);
router.get("/:id/resume/download", protectAny, getDownloadableResumeUrl);

// FACT: Jobseeker Verification Documents Endpoints
router.post("/:id/document/upload-url", protect, getJobseekerDocumentUploadUrl);
router.post("/:id/document/save-key", protect, saveJobseekerDocumentKey);
router.get("/:id/document/view", protectAny, getViewableJobseekerDocumentUrl);
router.get("/:id/document/download", protectAny, getDownloadableJobseekerDocumentUrl);
router.delete("/:id/document", protect, deleteJobseekerDocument);

export default router;