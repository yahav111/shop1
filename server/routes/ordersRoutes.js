import express from "express";
import Protect from "../middleware/protect.js";
import {
  postOrder,
  getOrdersUser,
  getOrderById,
  deleteOrderUser,
  getOrders,
  deleteOrder,
} from "../controllers/OrdersControllers.js";

const router = express.Router();

router.get("/allOrders", getOrders);
router.delete("/allOrders/:orderId", deleteOrder);
router.post("/", Protect, postOrder);
router.get("/", Protect, getOrdersUser);
router.get("/:orderId", Protect, getOrderById);
router.delete("/:orderId", Protect, deleteOrderUser);

export default router;
