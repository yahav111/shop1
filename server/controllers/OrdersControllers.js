import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const postOrder = async (req, res) => {
  const userId = req.cookies.authToken;
  const userIdVerify = jwt.verify(userId, JWT_SECRET);
  const userIdVerify2 = userIdVerify.userId;
  console.log(userId, "userId");
  console.log(userIdVerify, "userIdVerify");
  console.log(userIdVerify2, "gghehdtd");

  try {
    // 1️⃣ Get all products from the user's cart (UserProducts)
    const userCart = await prisma.userProducts.findMany({
      where: { userId: userIdVerify2 },
    });

    if (userCart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // 2️⃣ Create a new order
    const newOrder = await prisma.order.create({
      data: {
        userId: userIdVerify2,
        orderItems: {
          create: userCart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    // 3️⃣ Clear the user's cart after placing the order
    await prisma.userProducts.deleteMany({
      where: { userId: userIdVerify2 },
    });

    return res
      .status(201)
      .json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const getOrders = async (req, res) => {
  try {
    // 1️⃣ Verify JWT token and extract userId
    const token = req.cookies.authToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // 2️⃣ Fetch all orders for the user
    const userOrders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true, // Include product details
          },
        },
      },
      orderBy: { createdAt: "desc" }, // Sort by newest first
    });

    // 3️⃣ If no orders, return message
    if (userOrders.length === 0) {
      return res.status(200).json({ message: "No orders found." });
    }

    return res.status(200).json({ orders: userOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const getOrderById = async (req, res) => {
  try {
    // 1️⃣ Extract user token from cookies
    const token = req.cookies.authToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // 2️⃣ Extract orderId from request params
    const { orderId } = req.params;

    // 3️⃣ Fetch the specific order
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId }, // Ensure user can only fetch their own order
      include: {
        orderItems: {
          include: {
            product: true, // Include product details
          },
        },
      },
    });

    // 4️⃣ If order not found, return error
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    // 1️⃣ Extract user token from cookies
    const token = req.cookies.authToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // 2️⃣ Extract orderId from request params
    const { orderId } = req.params;

    // 3️⃣ Find the order and ensure it belongs to the user
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId },
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or does not belong to you." });
    }

    // 4️⃣ Delete the order and its associated items
    await prisma.orderItem.deleteMany({ where: { orderId } }); // Delete order items first
    await prisma.order.delete({ where: { id: orderId } }); // Then delete the order

    return res.status(200).json({ message: "Order deleted successfully!" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
