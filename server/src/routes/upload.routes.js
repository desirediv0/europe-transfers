import { Router } from "express";
import { uploadFile, listFiles, deleteFile, createFolder, getDownloadUrl } from "../controllers/upload.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", protectAdmin, listFiles);
router.post("/", protectAdmin, upload.single("file"), uploadFile);
router.delete("/", protectAdmin, deleteFile);
router.post("/folder", protectAdmin, createFolder);
router.get("/download", protectAdmin, getDownloadUrl);

export default router;
