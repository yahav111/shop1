import express from "express";
import {
  // getAllProducts,
  getUserProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  clearCart,
} from "../controllers/controllers.js";

const router = express.Router();

// router.get("/", getAllProducts);
router.get("/", getUserProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.delete("/", clearCart);

export default router;
