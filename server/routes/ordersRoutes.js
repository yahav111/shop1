import express from "express";
import {
  postOrder,
  getOrders,
  getOrderById,
  deleteOrder,
} from "../controllers/OrdersControllers.js";

const router = express.Router();

router.post("/", postOrder);
router.get("/", getOrders);
router.get("/:orderId", getOrderById);
router.delete("/:orderId", deleteOrder);

export default router;
