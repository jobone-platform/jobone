import express from "express";
import { serveImage } from "../controllers/imageControllers.js";

const router = express.Router();

router.get("/:folder/:filename", serveImage);

export default router;
