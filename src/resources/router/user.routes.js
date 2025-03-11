// routes/userRoutes.js
import express from "express";
import { signup, login } from "../controllers/user.controller.js";

const router = express.Router();

// Define routes
router.post("/signup", signup); // POST /signup
router.post("/login", login);   // POST /login

export default router;