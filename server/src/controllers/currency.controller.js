import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getRates } from "../config/currency.js";

export const getCurrencyRates = asyncHandler(async (req, res) => {
  const rates = await getRates();
  return apiResponse(res, 200, "Currency rates retrieved", { base: "EUR", rates });
});
