import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { GRPConfig } from "../GRPConfig";
import { authenticate } from "../authenticate";

const router = express.Router();

cloudinary.config({
  cloud_name: GRPConfig.CloudinaryConfig.cloud_name,
  api_key: GRPConfig.CloudinaryConfig.api_key,
  api_secret: GRPConfig.CloudinaryConfig.api_secret,
});

export default cloudinary;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const originalName = file.originalname;
    const ext = originalName.split(".").pop();

    return {
      folder: "academic-papers",
      resource_type: file.mimetype === "application/pdf" ? "raw" : "auto",
      public_id: `${Date.now()}_${originalName}`,
      tags: [ext],
    };
  },
});

const upload = multer({
  storage,
});

router.post("/upload", authenticate, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ data: { url: null }, message: "No file uploaded" });
    }

    const fileUrl = req.file.path; // Cloudinary URL

    return res.json({
      data: { url: fileUrl },
      message: "Upload successful",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ data: { url: null }, message: error });
  }
});

module.exports = router;
