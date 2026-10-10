import { 
  createJob, getJob, getJobs, getJobApplicants, getEmployerCreatedJobs, 
  updateJob, deleteJob, getEmployerMetrics, jobCreatedByUser, getJobCountsByIndustry, getSimilarJobs, getNearbyJobs, getPublicStats
} from "../controllers/jobsControllers.js";
import { protect, protectAdmin } from "../middleware/authorization.js";
import { protectEmployer } from "../middleware/employercheck.js";
import express from "express";
import { body } from "express-validator";

const router = express.Router();


router.post("/", protectEmployer, [
  body("title").notEmpty().withMessage("Job title is required"),
  body("industry").notEmpty().withMessage("Industry is required"),
  body("subdomain").notEmpty().withMessage("Subdomain is required")
], createJob);

router.get("/category-counts", getJobCountsByIndustry);

router.get("/public-stats", getPublicStats);

// Get employer created jobs (with detailed application stats)
router.get("/employer-jobs", protectEmployer, getEmployerCreatedJobs);

// Get Employer Metrics (Total jobs, active, views, etc)
router.get("/metrics", protectEmployer, getEmployerMetrics);

// jobs created by a specific employer changed now the path has been changed to employer
router.get("/employer/:id",protectEmployer, jobCreatedByUser);



router.get("/", getJobs);

router.get("/nearby", getNearbyJobs);

router.get("/:id/similar", getSimilarJobs);

router.get("/:id", getJob);

router.get("/:id/applicants", protectEmployer, getJobApplicants);

router.delete("/:id", protectAdmin, deleteJob);

router.patch("/:id",protectEmployer,updateJob);

router.put("/:id",protectEmployer,updateJob);

router.patch("/:id",protectEmployer,updateJob);


export default router;