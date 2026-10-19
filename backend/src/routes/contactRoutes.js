import express from "express";
import { contactUs,getContactmessage } from "../controllers/contactControllers.js";
import { protectAdmin } from "../middleware/authorization.js";

const router = express.Router();


router.post("/", contactUs);

router.get("/:id", protectAdmin, getContactmessage);



export default router;