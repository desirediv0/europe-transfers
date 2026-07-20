import { Router } from "express";
import { getMe } from "../controllers/user.controller.js";
import protectUser from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", protectUser, getMe);

export default router;
