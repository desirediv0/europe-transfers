import { uploadToR2, deleteFromR2, listR2Objects, createR2Folder, getPresignedDownloadUrl } from "../config/r2.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { resolve, extname, basename } from "path";
import env from "../config/env.config.js";

const isR2Configured = env.R2_ACCESS_KEY_ID && env.R2_BUCKET_NAME && env.R2_ENDPOINT;

// ─── Upload File ─────────────────────────────────────────
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const folder = req.body.folder || "uploads";
  let url;

  if (isR2Configured) {
    const key = `${folder}/${Date.now()}-${req.file.originalname}`;
    url = await uploadToR2(req.file, key);
  } else {
    const uploadsDir = resolve(process.cwd(), "public", folder);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    const ext = extname(req.file.originalname);
    const filename = `${Date.now()}${ext}`;
    const filepath = resolve(uploadsDir, filename);
    await writeFile(filepath, req.file.buffer);
    url = `http://localhost:${env.PORT}/${folder}/${filename}`;
  }

  return apiResponse(res, 200, "File uploaded successfully", { url });
});

// ─── List Files & Folders ────────────────────────────────
export const listFiles = asyncHandler(async (req, res) => {
  const prefix = req.query.prefix || "";

  if (!isR2Configured) {
    return apiResponse(res, 200, "Files listed", { folders: [], files: [], prefix });
  }

  const result = await listR2Objects(prefix);
  return apiResponse(res, 200, "Files listed", result);
});

// ─── Delete File ─────────────────────────────────────────
export const deleteFile = asyncHandler(async (req, res) => {
  const { key } = req.body;

  if (!key) {
    throw new ApiError(400, "File key is required");
  }

  if (!isR2Configured) {
    throw new ApiError(500, "R2 not configured");
  }

  await deleteFromR2(key);
  return apiResponse(res, 200, "File deleted successfully");
});

// ─── Create Folder ───────────────────────────────────────
export const createFolder = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;

  if (!name) {
    throw new ApiError(400, "Folder name is required");
  }

  if (!isR2Configured) {
    throw new ApiError(500, "R2 not configured");
  }

  const folderPath = parent ? `${parent}${name}/` : `${name}/`;
  await createR2Folder(folderPath);
  return apiResponse(res, 200, "Folder created successfully", { path: folderPath });
});

// ─── Get Download URL ────────────────────────────────────
export const getDownloadUrl = asyncHandler(async (req, res) => {
  const { key } = req.query;

  if (!key) {
    throw new ApiError(400, "File key is required");
  }

  if (!isR2Configured) {
    throw new ApiError(500, "R2 not configured");
  }

  const fileName = basename(key);
  const url = await getPresignedDownloadUrl(key, fileName);
  return apiResponse(res, 200, "Download URL generated", { url, fileName });
});
