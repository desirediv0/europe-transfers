import ApiError from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/tokens.js";
import prisma from "../config/db.js";

const protectAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Not authenticated");
    }

    const decoded = verifyAccessToken(token);

    if (decoded.role === undefined) {
      throw new ApiError(401, "Invalid token type");
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!admin) {
      throw new ApiError(401, "Admin not found");
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Invalid or expired token"));
    }
    next(error);
  }
};

export default protectAdmin;
