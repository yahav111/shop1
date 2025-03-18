import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const getAllProducts = async (req, res) => {
  try {
    const userId = req.cookies.authToken;
    console.log(userId, "userid");
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const userId = req.cookies.authToken;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify JWT token and extract user ID
    const decodedToken = jwt.verify(userId, JWT_SECRET);
    const userIdVerify = decodedToken.userId;

    // Find the user
    const existingUser = await prisma.user.findUnique({
      where: { id: userIdVerify },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all products linked to the user
    const userProducts = await prisma.userProducts.findMany({
      where: { userId: userIdVerify },
      include: { product: true }, // Include product details
    });

    res.status(200).json({ products: userProducts });
  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).json({
      error: "Failed to fetch user products",
      details: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { productId, title, price, description, category, image, rating } =
      req.body;

    const newProduct = await prisma.product.create({
      data: {
        productId,
        title,
        price,
        description,
        category,
        image,
        rating,
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating product", details: error.message });
  }
};

export const createUserProduct = async (req, res) => {
  try {
    const { title, price, description, category, image, rating, productId } =
      req.body;

    const userId = req.cookies.authToken;
    const userIdVerify = jwt.verify(userId, JWT_SECRET);
    const userIdVerify2 = userIdVerify.userId;
    console.log(userId, "userId");
    console.log(userIdVerify, "userIdVerify");
    console.log(userIdVerify2, "gghehdtd");

    if (!title || !price || !productId) {
      return res.status(400).json({
        error: "Title, price, productId are required",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userIdVerify2 },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the product already exists in the product table
    let existingProduct = await prisma.product.findUnique({
      where: { productId },
    });

    // If product does not exist, create it
    if (!existingProduct) {
      existingProduct = await prisma.product.create({
        data: {
          productId,
          title,
          price,
          description,
          category,
          image,
          rating,
        },
      });
    }

    // Check if the user already has this product in their cart (UserProducts)
    let userProduct = await prisma.userProducts.findUnique({
      where: {
        productId_userId: {
          productId: existingProduct.productId,
          userId: existingUser.id,
        },
      },
    });

    // If the user does not have the product in their cart, add it with quantity = 1
    if (!userProduct) {
      userProduct = await prisma.userProducts.create({
        data: {
          userId: existingUser.id,
          productId: existingProduct.productId,
          quantity: 1, // Always start with 1 item when adding to cart
        },
      });
    } else {
      // If the product is already in the cart, increment the quantity by 1
      userProduct = await prisma.userProducts.update({
        where: {
          id: userProduct.id,
        },
        data: {
          quantity: userProduct.quantity + 1, // Increment by 1 when updating
        },
      });
    }

    // Respond with the updated or created product
    res.status(201).json({
      product: { ...existingProduct, quantity: userProduct.quantity },
      message: "Product added to user cart successfully",
    });
  } catch (error) {
    console.error("Error creating or updating product:", error);
    res.status(500).json({
      error: "Failed to create or update product",
      details: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity == null) {
      return res
        .status(400)
        .json({ error: "userId, productId, and quantity are required" });
    }

    const existingUserProduct = await prisma.userProducts.findUnique({
      where: {
        productId_userId: { productId, userId },
      },
    });

    if (!existingUserProduct) {
      return res.status(404).json({ error: "Product not found for this user" });
    }

    const updatedUserProduct = await prisma.userProducts.update({
      where: {
        productId_userId: { productId, userId },
      },
      data: { quantity },
    });

    res.status(200).json({
      product: updatedUserProduct,
      message: "Product quantity updated successfully",
    });
  } catch (error) {
    console.error("Error updating product quantity:", error);
    res.status(500).json({
      error: "Failed to update product quantity",
      details: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ error: "userId and productId are required" });
    }

    // בדוק אם המוצר קיים אצל המשתמש
    const existingUserProduct = await prisma.userProducts.findUnique({
      where: {
        productId_userId: { productId, userId },
      },
    });

    if (!existingUserProduct) {
      return res.status(404).json({ error: "Product not found for this user" });
    }

    // מחק את המוצר מהטבלה של userProducts
    await prisma.userProducts.delete({
      where: {
        productId_userId: { productId, userId },
      },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "Failed to delete product",
      details: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  const { userId } = req.body;
  try {
    const userProducts = await prisma.userProducts.findMany({
      where: { userId },
    });

    if (!userProducts || userProducts.length === 0) {
      return res.status(404).json({ error: "No products found in cart" });
    }

    await prisma.userProducts.deleteMany({
      where: { userId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error clearing cart:", error);
    res
      .status(500)
      .json({ error: "Failed to clear cart", details: error.message });
  }
};
