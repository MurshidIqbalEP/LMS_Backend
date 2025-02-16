import { Request, Response } from "express";
import {  hashPassword } from "../utils/bcript";
import Educator from "../modal/educatorModal";

export const registerEducator = async(req:Request,res:Response)=>{
    try {
        const {name,email,password,subjectExpertise,qualification,profilePicture,governmentId} = req.body;

        const existedEducator = await Educator.findOne({email});
        if (existedEducator) {
            res.status(400).json({ message: "Educator already exists" });
            return;
          }

        const hashedPassword = await hashPassword(password);
        const educator = await Educator.create({name,email,password:hashedPassword,subjectExpertise,qualification,profilePicture,governmentId})
        res.status(201).json({ message: "Educator created successfully" });

    } catch (error) {
        const err = error as Error;
        res.status(500).json({ success: false, message: err.message });
    }
}