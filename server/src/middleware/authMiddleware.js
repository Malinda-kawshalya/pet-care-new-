import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized, user not found"));
    }
    if (req.user.approvalStatus === "blocked") {
      res.status(403);
      return next(new Error("Account is blocked"));
    }
    return next();
  } catch (_error) {
    res.status(401);
    return next(new Error("Not authorized, token failed"));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("Forbidden for this role"));
    }
    return next();
  };
}
