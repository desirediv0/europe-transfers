import apiResponse from "../utils/apiResponse.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  if (statusCode >= 500 || process.env.NODE_ENV !== "production") {
    console.error(`[${req.method} ${req.originalUrl}] ${statusCode}:`, err);
  }
  return apiResponse(res, statusCode, message);
};

export default errorMiddleware;
