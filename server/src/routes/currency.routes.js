import { Router } from "express";
import { getCurrencyRates } from "../controllers/currency.controller.js";

const router = Router();

router.get("/rates", getCurrencyRates);

export default router;
