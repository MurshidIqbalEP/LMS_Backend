import express from 'express';
import {registerEducator,loginEducator } from '../controllers/educaterController'; 

const router = express.Router();

router.post('/register',registerEducator);
router.post('/login',loginEducator);



export default router;