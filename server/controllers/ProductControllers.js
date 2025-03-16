import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.dbProduct.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getUserCart = async (req, res) => {
  const userId = req.cookies;
  console.log(userId, "useridd");

  if (!userId) {
    return res.status(400).json({ error: "User ID not found in cookies" });
  }

  try {
    const UserProducts = await prisma.userProducts.findMany({
      where: { userId },
      include: { product: true },
    });
    res.json(UserProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
};

// export const getproduct = async (req, res) => {
//   const { productId } = req.params;
//   console.log(productId, "bfdbd");

//   try {
//     const UserProducts = await prisma.userProducts.findMany({
//       where: { productId },
//       include: { user: true },
//     });
//     res.json(UserProducts);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch cart items" });
//   }
// };

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      quantity,
      description,
      category,
      image,
      rating,
      productId,
    } = req.body;

    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(400).json({
        error: "UserId is required in the cookies",
      });
    }

    console.log(userId, "yaga");
    console.log(productId);
    console.log(price);
    console.log(title);

    if (!title || !price || !productId) {
      return res.status(400).json({
        error: "Title, price, and productId are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔹 בדוק אם המוצר קיים ב-dbProduct
    const existingDbProduct = await prisma.dbProduct.findUnique({
      where: { id: productId },
    });

    if (!existingDbProduct) {
      return res.status(404).json({ error: "dbProduct not found" });
    }

    // 🔹 בדוק אם המוצר כבר קיים בטבלת `Product`
    let existingProduct = await prisma.product.findUnique({
      where: { productId },
    });

    // אם המוצר לא קיים - צור אותו
    if (!existingProduct) {
      existingProduct = await prisma.product.create({
        data: {
          productId, // שומר את ה-ID של dbProduct
          title,
          price,
          description,
          category,
          image,
          rating,
        },
      });
    }

    // 🔹 בדוק אם המוצר כבר קיים אצל המשתמש ב-UserProducts
    const existingUserProduct = await prisma.userProducts.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (existingUserProduct) {
      // 🔄 אם המוצר כבר קיים - עדכן את הכמות
      const updatedUserProduct = await prisma.userProducts.update({
        where: {
          productId_userId: {
            productId,
            userId,
          },
        },
        data: {
          quantity: existingUserProduct.quantity + (quantity || 1),
        },
      });

      return res.status(200).json({
        product: updatedUserProduct,
        message: "Product quantity updated successfully",
      });
    }

    // 🔹 אם המוצר לא קיים אצל המשתמש, צור אותו
    const userProduct = await prisma.userProducts.create({
      data: {
        userId,
        productId: existingProduct.productId,
        quantity: quantity || 1,
      },
    });

    res.status(201).json({
      product: { ...existingProduct, quantity: userProduct.quantity },
      message: "Product created successfully",
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
