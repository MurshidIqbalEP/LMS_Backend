import express from 'express';
import {registerEducator } from '../controllers/educaterController'; 

const router = express.Router();

router.post('/register',registerEducator);



export default router;