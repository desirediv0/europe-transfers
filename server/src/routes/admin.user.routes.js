import { Router } from "express";
import { getUsers, verifyUserDocument } from "../controllers/user.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const verifySchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
});

router.get("/", protectAdmin, getUsers);
router.put("/:id/verify", protectAdmin, validate(verifySchema), verifyUserDocument);

export default router;
