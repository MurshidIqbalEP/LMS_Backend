import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import cookieParser from "cookie-parser";
import studentsRoutes from "./routes/studentsRoutes"
import educatorRoutes from "./routes/educaterRoutes"
import adminRoutes from "./routes/adminRoutes"
import connectDB from "./db";



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_URL,
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));


app.use('/api/students',studentsRoutes);
app.use('/api/educator',educatorRoutes);
app.use('/api/admin',adminRoutes);

app.listen(PORT, async() => {
   await connectDB()
  console.log(`Server running on port ${PORT}`);
});
