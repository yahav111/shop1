import express from "express";
import {
  getAllCategories,
  getCategoryById,
  addCategory,
  editCategory,
  deleteCategory,
  getProductsByCategoryId,
} from "../controllers/CategoriesControllers.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", addCategory);
router.put("/:id", editCategory);
router.delete("/:id", deleteCategory);
router.get("/:id/products", getProductsByCategoryId);

export default router;
