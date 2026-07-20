import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.get("/stats", protectAdmin, getDashboardStats);

export default router;
