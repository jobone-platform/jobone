import express from "express";
import { contactUs,getContactmessage } from "../controllers/contactControllers.js";
import { protectAdmin } from "../middleware/authorization.js";

import { contactLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();


router.post("/", contactLimiter, contactUs);

router.get("/:id", protectAdmin, getContactmessage);



export default router;