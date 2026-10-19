import express from "express";
import { registerEmployer,loginEmployer,verifyOTP,resendOTP,checkEmployerEligibility,searchCandidatesBySkills,getMyCandidates, getPublicEmployerProfile ,updateEmployerProfile,getPresignedUploadUrl,saveDocumentKey,googleLoginEmployer,getViewableDocumentUrl,getDownloadableDocumentUrl, forgotPasswordEmployer, resetPasswordEmployer, getEmployerProfilePicUploadUrl, getExploreEmployers} from "../controllers/employerControllers.js";
import { getEmployerCreatedJobs } from "../controllers/jobsControllers.js";
import { body } from 'express-validator';
import {protect} from "../middleware/authorization.js";
import { protectEmployer } from "../middleware/employercheck.js";

const router = express.Router();

const rules = [
  body('name', 'Name is required').not().isEmpty().trim(),
  
  body('email', 'A valid email is required').isEmail(), 
  
  body('password', 'Password must be 6+ characters').isLength({ min: 6 })
];


router.post("/register",rules, registerEmployer);

router.post("/verifyotp", verifyOTP);

router.post("/resend-otp", resendOTP);

router.post("/login", loginEmployer);

router.post("/forgot-password", forgotPasswordEmployer);
router.post("/reset-password", resetPasswordEmployer);

router.post("/updateProfile",protectEmployer,updateEmployerProfile)

router.get("/profile/:id", getPublicEmployerProfile);

router.get("/explore", getExploreEmployers);

router.post("/generate-upload-url",protectEmployer, getPresignedUploadUrl);
router.post("/profile-picture/upload-url",protectEmployer, getEmployerProfilePicUploadUrl);

router.patch("/save-document-key", protectEmployer,saveDocumentKey);

router.get("/documentViewUrl", protectEmployer,getViewableDocumentUrl);

router.get("/documentDownloadUrl", protectEmployer,getDownloadableDocumentUrl);

router.post('/google-login', googleLoginEmployer);

router.get("/createdJobs", protectEmployer,getEmployerCreatedJobs);

router.get("/check-eligibility", protectEmployer, checkEmployerEligibility);

router.get("/search-candidates", protectEmployer, searchCandidatesBySkills);

router.get("/my-candidates", protectEmployer, getMyCandidates);




export default router;