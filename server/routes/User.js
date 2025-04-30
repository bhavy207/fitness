import express from "express";
import {
  UserLogin,
  UserRegister,
  addWorkout,
  deleteWorkout,
  getUserDashboard,
  getWorkoutsByDate,
  updateWorkout,
} from "../controllers/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", UserRegister);
router.post("/signin", UserLogin);

router.get("/dashboard", verifyToken, getUserDashboard);
router.get("/workout", verifyToken, getWorkoutsByDate);
router.post("/workout", verifyToken, addWorkout);
router.put("/workout/:id", verifyToken, updateWorkout);
router.delete("/workout/:id", verifyToken, deleteWorkout);

export default router;
