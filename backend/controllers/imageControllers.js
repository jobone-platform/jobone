import expressAsyncHandler from "express-async-handler";
import { getS3Client } from "./employerControllers.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const serveImage = expressAsyncHandler(async (req, res) => {
  const { folder, filename } = req.params;
  const key = `${folder}/${filename}`;

  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  try {
    // Generate a presigned URL that is valid for 1 hour
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    // Redirect the browser to the presigned URL
    res.redirect(url);
  } catch (error) {
    res.status(500).json({ message: "Error generating image URL" });
  }
});
