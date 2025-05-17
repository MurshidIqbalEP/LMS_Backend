import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Educator from "../modal/educatorModal";

export const educatorauth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
       res.status(401).json({ success: false, message: "Unauthorized: No token provided"   });
       return
    }

    const decoded =  jwt.verify(token, process.env.JWT_SECRET as string) as { id: string,role:string };
    if (decoded.role !== "educator") {
      res.status(403).json({ message: "Access denied for non-educators" });
      return;
    }
    const educatorId = decoded.id;
    
    const educator = await Educator.findById(educatorId);

    if (!educator) {
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
