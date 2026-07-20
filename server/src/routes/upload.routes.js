import { Router } from "express";
import { uploadFile } from "../controllers/upload.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/", protectAdmin, upload.single("file"), uploadFile);

export default router;
