import expressAsyncHandler from "express-async-handler";
import path from "path";
import { getS3Client } from "./employerControllers.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Allowed public image folders
const ALLOWED_PUBLIC_FOLDERS = new Set(["profile_pictures"]);

// Allowed image file extensions
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export const serveImage = expressAsyncHandler(async (req, res) => {
  const { folder, filename } = req.params;

  // 1. Enforce strict folder whitelist
  if (!ALLOWED_PUBLIC_FOLDERS.has(folder)) {
    return res.status(403).json({
      message: "Access forbidden: Requested folder is not a public asset directory",
    });
  }

  // 2. Prevent path traversal and enforce safe filename pattern
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return res.status(400).json({ message: "Invalid filename parameter" });
  }

  // Allow only alphanumeric characters, dashes, underscores, and dots
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
    return res.status(400).json({ message: "Invalid filename characters" });
  }

  // 3. Enforce image file extension
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return res.status(403).json({
      message: "Access forbidden: Only image assets are accessible through this route",
    });
  }

  const key = `${folder}/${filename}`;
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  try {
    // Generate a presigned URL valid for 30 minutes
    const url = await getSignedUrl(client, command, { expiresIn: 1800 });
    return res.redirect(url);
  } catch (error) {
    return res.status(500).json({ message: "Error generating image URL" });
  }
});

