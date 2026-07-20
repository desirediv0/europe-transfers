import { uploadToR2 } from "../config/r2.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { resolve, extname } from "path";
import env from "../config/env.config.js";

const isR2Configured = env.R2_ACCESS_KEY_ID && env.R2_BUCKET_NAME && env.R2_ENDPOINT;

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  let url;

  if (isR2Configured) {
    const key = `uploads/${Date.now()}-${req.file.originalname}`;
    url = await uploadToR2(req.file, key);
  } else {
    const uploadsDir = resolve(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    const ext = extname(req.file.originalname);
    const filename = `${Date.now()}${ext}`;
    const filepath = resolve(uploadsDir, filename);
    await writeFile(filepath, req.file.buffer);
    url = `http://localhost:${env.PORT}/uploads/${filename}`;
  }

  return apiResponse(res, 200, "File uploaded successfully", { url });
});
