import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../modal/userModal";

export const studentauth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
       res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
       return
    }

    const decoded =  jwt.verify(token, process.env.JWT_SECRET as string) as { id: string,role: string };
    if (decoded.role !== "student") {
   res.status(403).json({ message: "Access denied for non-student" });
   return
   }
    const userId = decoded.id;
    
    const user = await User.findById(userId);

    if (!user) {
       res.status(400).json({ message: "User not found" });
       return
    }

    // if (user.isBlocked) {
    //   return res.status(403).json({ message: "User is blocked", accountType: "user" });
    // }

    next();
  } catch (error) {
     res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
     return
  }
};
