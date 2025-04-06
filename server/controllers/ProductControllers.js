import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params; // Get productId from the route parameters
    const product = await prisma.product.findUnique({
      where: { productId },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const deleteProductById = async (req, res) => {
  try {
    const { productId } = req.params; // Get product ID from request parameters

    const deletedProduct = await prisma.product.delete({
      where: { productId }, // Delete the product with the given ID
    });

    res.json({ message: "Product deleted successfully", deletedProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all products linked to the user
    const userProducts = await prisma.userProducts.findMany({
      where: { userId: userId },
      include: { product: true },
      include: {
        product: {
          include: {
            category: true, // Nested include to get category with each product
          },
        },
      },
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
    if (!req.file)
      return res.status(400).json({ error: "Image file is required" });

    const {
      productId,
      title,
      price,
      description = "",
      category,
      rating = { rate: 0, count: 0 },
    } = req.body;

    // Check required fields
    if (!productId || !title || !price || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload image to Cloudinary in parallel
    const uploadPromise = uploadToCloudinary(req.file.buffer);

    // Create product in database
    const [uploadResult] = await Promise.all([uploadPromise]);

    // Handle category as a relation
    let categoryData;
    if (typeof category === "string") {
      // If category is a string (name), check if it exists in the database
      categoryData = await prisma.category.findUnique({
        where: { name: category },
      });

      if (!categoryData) {
        return res.status(400).json({ error: "Category not found" });
      }
    } else if (typeof category === "number") {
      // If category is passed as an ID
      categoryData = await prisma.category.findUnique({
        where: { id: category },
      });

      if (!categoryData) {
        return res.status(400).json({ error: "Category ID not found" });
      }
    } else {
      return res.status(400).json({ error: "Invalid category value" });
    }

    // Create the new product with category relation
    const newProduct = await prisma.product.create({
      data: {
        productId,
        title,
        price: parseFloat(price),
        description,
        category: { connect: { id: categoryData.id } }, // Connect product to category
        image: uploadResult.secure_url,
        rating, // Just assign the JSON
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating product", details: error.message });
  }
};

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    if (!buffer?.length) return reject(new Error("Invalid image buffer"));
    cloudinary.v2.uploader
      .upload_stream({ resource_type: "image" }, (error, result) =>
        error ? reject(error) : resolve(result)
      )
      .end(buffer);
  });

export const createUserProduct = async (req, res) => {
  try {
    const { title, price, description, category, image, rating, productId } =
      req.body;

    console.log(title, "imageclouding");

    const userId = req.user.userId;

    if (!title || !price || !productId) {
      return res.status(400).json({
        error: "Title, price, productId are required",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
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

export const updateUserProduct = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        error: "ProductId and quantity are required",
      });
    }

    const userId = req.user.userId;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let userProduct = await prisma.userProducts.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: existingUser.id,
        },
      },
    });

    if (!userProduct) {
      userProduct = await prisma.userProducts.create({
        data: {
          userId: existingUser.id,
          productId,
          quantity,
        },
      });
    } else {
      userProduct = await prisma.userProducts.update({
        where: {
          id: userProduct.id,
        },
        data: {
          quantity,
        },
      });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { productId },
      include: { category: true },
    });

    res.status(201).json({
      product: { ...fullProduct, quantity: userProduct.quantity },
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

export const updateProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    let updateData = req.body;
    const { file } = req;

    let updatedImage = null;
    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer);
      updatedImage = uploadResult.secure_url;
    }

    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }

    const updatedProduct = await prisma.product.update({
      where: { productId },
      data: {
        ...updateData,
        image: updatedImage || undefined,
        categoryId: updateData.categoryId || undefined,
      },
      include: {
        category: true,
      },
    });

    res.json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      error: "Failed to update product",
      details: error.message,
    });
  }
};

export const deleteProductuser = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    if (!productId) {
      return res.status(400).json({ error: "ProductId is required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const userProduct = await prisma.userProducts.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: existingUser.id,
        },
      },
    });

    if (!userProduct) {
      return res.status(404).json({ error: "Product not found in user cart" });
    }

    const deleted = await prisma.userProducts.delete({
      where: { id: userProduct.id },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    res.status(200).json({
      message: "Product removed from cart successfully",
      product: deleted.product,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "Failed to delete product",
      details: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  const userId = req.user.userId;

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
    res.status(500).json({
      error: "Failed to clear cart",
      details: error.message,
    });
  }
};
