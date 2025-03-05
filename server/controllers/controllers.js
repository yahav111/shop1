import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await prisma.product.findMany();
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// };

export const getUserProducts = async (req, res) => {
  try {
    const userId = req.query.userId?.trim();
    console.log(userId);

    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const products = await prisma.product.findMany({
      where: { userId: userId },
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const createProduct = async (req, res) => {
  const {
    title,
    price,
    quantity,
    description,
    category,
    image,
    rating,
    userId,
  } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: {
        title,
        price,
        quantity,
        description,
        category,
        image,
        rating,
        user: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create product", details: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, quantity, description, category, image, rating } =
    req.body;
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        title,
        price,
        quantity,
        description,
        category,
        image,
        rating,
      },
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
