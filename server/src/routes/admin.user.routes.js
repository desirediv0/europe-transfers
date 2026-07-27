import { Router } from "express";
import { getUsers, verifyUserDocument, deleteUser } from "../controllers/user.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const verifySchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  reason: z.string().optional(),
});

router.get("/", protectAdmin, getUsers);
router.put("/:id/verify", protectAdmin, validate(verifySchema), verifyUserDocument);
router.delete("/:id", protectAdmin, deleteUser);

export default router;
