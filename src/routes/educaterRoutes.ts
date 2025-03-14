import express from 'express';
import { Request, Response } from "express";
import {registerEducator,loginEducator,postCourse, fetchCoursesById,deleteCourseById, fetchCourseByCourseId,UpdateCourse,fetchAllCategory } from '../controllers/educaterController'; 
import { educatorauth } from '../middleware/EducatorAuth';

const router = express.Router();

router.post('/register',registerEducator);
router.post('/login',loginEducator);
router.post('/postCourse',educatorauth,postCourse);
router.get('/fetchCoursesById',educatorauth,fetchCoursesById);
router.delete('/deleteCourse',educatorauth,deleteCourseById);
router.get('/fetchCourseByCourseid/:courseId',educatorauth,fetchCourseByCourseId);
router.patch('/updateCourse',educatorauth,UpdateCourse);
router.get('/fetchCategory',educatorauth,fetchAllCategory);



export default router;