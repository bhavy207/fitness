import express from "express";
import {
  addNutritionItem,
  getNutritionItems,
  getNutritionSummary,
  deleteNutritionItem,
  updateNutritionItem,
} from "../controllers/nutrition.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, addNutritionItem);
router.get("/items", verifyToken, getNutritionItems);
router.get("/summary", verifyToken, getNutritionSummary);
router.delete("/:id", verifyToken, deleteNutritionItem);
router.put("/:id", verifyToken, updateNutritionItem);

export default router;
