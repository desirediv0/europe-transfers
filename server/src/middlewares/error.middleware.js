import apiResponse from "../utils/apiResponse.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return apiResponse(res, statusCode, message);
};

export default errorMiddleware;
