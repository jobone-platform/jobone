import express from "express";
import multer from "multer";
import { protectEmployer } from "../middleware/employercheck.js";
import {protect} from "../middleware/authorization.js";
import { generateJobDetails , parseResume} from "../controllers/aiControllers.js";
import { recommendJobs } from "../controllers/aiControllers.js";
import { handleChatBot } from "../controllers/aiChatControllers.js";


const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.post("/parse-resume", protect, upload.single("resume"), parseResume);


// Employer must be logged in to use AI (prevents public API abuse)
router.post("/generate-job-details", protectEmployer, generateJobDetails);

router.get("/recommend-jobs", protect, recommendJobs);



// Note: Ensure your Express app has express.json() middleware enabled
router.post("/chat", handleChatBot);


export default router;