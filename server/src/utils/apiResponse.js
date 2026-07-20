const apiResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export default apiResponse;
