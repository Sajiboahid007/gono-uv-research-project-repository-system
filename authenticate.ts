import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./interface";
const jwt = require("jsonwebtoken");
const GRPConfig = require("./GRPConfig");

// Authentication Middleware
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Authorization token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, GRPConfig.GRPConfig.JwtSecret) as {
      userId: number;
      userEmail: string;
    };
    req.userId = decoded.userId;
    req.userEmail = decoded.userEmail;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
