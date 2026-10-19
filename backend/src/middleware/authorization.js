import jwt from "jsonwebtoken";
import User from "../models/users.js";
import Admin from "../models/admin.js";
import asyncHandler from "express-async-handler";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      // FACT: Operational lock. If frozen, reject all requests.
      if (req.user.isFrozen) {
        return res.status(403).json({ message: "Account Suspended: Your account has been frozen by the administration." });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
};

export const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) {
        return res.status(401).json({ message: "Not authorized, admin not found" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
});

// FACT: The RBAC Gatekeeper. Verifies specific admin roles.
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to perform this action." });
    }
    next();
  };
};

import Employer from "../models/employer.js";

// FACT: Middleware that allows either a User or an Employer
export const protectAny = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const targetId = decoded.id || (decoded.employer && decoded.employer.id);
      
      const user = await User.findById(targetId).select("-password");
      if (user) {
        if (user.isFrozen) return res.status(403).json({ message: "Account Suspended" });
        req.user = user;
        return next();
      }

      const employer = await Employer.findById(targetId).select("-password");
      if (employer) {
        if (employer.isFrozen) return res.status(403).json({ message: "Account Suspended" });
        req.employerId = employer._id;
        return next();
      }

      return res.status(401).json({ message: "Not authorized, entity not found" });
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  return res.status(401).json({ message: "Not authorized, no token" });
};