import express from "express";
import {
  getAllProducts,
  getUserCart,
  createProduct,
  updateProduct,
  deleteProduct,
  clearCart,
} from "../controllers/ProductControllers.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:userId", getUserCart);
router.post("/", createProduct);
router.put("/:userId", updateProduct);
router.delete("/", deleteProduct);
router.delete("/", clearCart);

export default router;
