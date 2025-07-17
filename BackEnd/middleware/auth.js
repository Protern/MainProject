import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    if (!req.body || !req.body.problemId) {
      req.user = null;
      return next();
    }
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      console.log("User not found");
      return res.status(401).json({ message: "Unauthorized access" });
    }
    next();
  } catch (error) {
    console.log("Invalid token:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
