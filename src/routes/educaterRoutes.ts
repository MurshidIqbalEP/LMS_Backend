import express from 'express';
import { Request, Response } from "express";
import {registerEducator,loginEducator,postCourse, fetchCoursesById,deleteCourseById, fetchCourseByCourseId,UpdateCourse } from '../controllers/educaterController'; 

const router = express.Router();

router.post('/register',registerEducator);
router.post('/login',loginEducator);
router.post('/postCourse',postCourse);
router.get('/fetchCoursesById',fetchCoursesById);
router.delete('/deleteCourse',deleteCourseById);
router.get('/fetchCourseByCourseid/:courseId',fetchCourseByCourseId);
router.patch('/updateCourse',UpdateCourse);



export default router;