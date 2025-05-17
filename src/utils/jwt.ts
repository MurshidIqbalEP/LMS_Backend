import jwt from "jsonwebtoken";

export const generateToken = (id:string,role: "student" | "educator") => {
  return jwt.sign({ id,role }, process.env.JWT_SECRET as string, { expiresIn: "15m" });
};

export const generateRefreshtoken = (id:string,role: "student" | "educator") => {
  return jwt.sign({ id,role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

export const verifyToken =(token:string,secret:string)=>{
  return jwt.verify(token, process.env.JWT_SECRET as string)
}