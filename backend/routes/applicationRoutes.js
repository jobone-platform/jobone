import express from "express";
import {protect }from "../middleware/authorization.js";
import { protectEmployer } from "../middleware/employercheck.js"; // Import this!

import { 
  allApplicationFromUser, 
  createApplication, 
  getJobApplications,   // Import this
  updateApplicationStatus ,markApplicationAsSeen,requestInterviewReschedule,respondToRescheduleRequest// Import this
} from "../controllers/applicationControllers.js";

const router = express.Router();

// --- USER ROUTES ---
router.post("/", protect, createApplication);
router.post("/:id/reschedule", protect, requestInterviewReschedule);
router.patch("/:id/reschedule/respond", protectEmployer, respondToRescheduleRequest);
router.patch("/:id/seen", protect, markApplicationAsSeen);
router.get("/:id", protect, allApplicationFromUser); 

// --- EMPLOYER ROUTES (These were missing) ---

// 1. Get all candidates for a specific job
router.get("/job/:jobId", protectEmployer, getJobApplications);

// 2. Update status (Hire/Reject)
router.patch("/:id/status", protectEmployer, updateApplicationStatus);

export default router;