import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import cloudinary from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage(); // שמירת הקובץ בזיכרון לצורך העלאה לענן
const upload = multer({ storage }).single("image");

export const getAllProducts = async (req, res) => {
  try {
    // const userId = req.cookies.authToken;
    // console.log(userId, "userid");
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params; // Get productId from the route parameters
    const product = await prisma.product.findUnique({
      where: { productId }, // Search for the product by productId
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
    // Validate request file
    if (!req.file) {
      return res.status(400).json({ error: "Empty or invalid image file" });
    }
    // Log detailed file information for debugging
    console.log("File details:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer.length,
    });

    // Validate required fields
    const { productId, title, price, description, category, rating } = req.body;

    const requiredFields = { productId, title, price, category };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
      });
    }
    
    console.log("Uploading to cloudinary")
    console.log(req.file.buffer);

    // Upload image to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);

    console.log(uploadResult)

    // Create product in database
    const newProduct = await prisma.product.create({
      data: {
        productId,
        title,
        price: parseFloat(price),
        description: description || "",
        category,
        image: uploadResult.secure_url,
        rating: {
          create: rating || { rate: 0, count: 0 },
        },
      },
    });

    // Return success response
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("Product creation error:", error);

    // Handle specific error types
    if (error.message && error.message.includes("Empty file")) {
      return res.status(400).json({
        error: "Empty file error from Cloudinary",
        details: error.message,
      });
    }

    // Generic error response
    return res.status(500).json({
      error: "Error creating product",
      details: error.message,
    });
  }
};
// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    // Validate buffer before attempting upload
    if (!buffer || buffer.length === 0) {
      reject(new Error("Invalid or empty image buffer"));
      return;
    }
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

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
    const { productId, quantity } = req.body; // Get the productId and quantity from the request body

    if (!productId || !quantity) {
      return res.status(400).json({
        error: "ProductId and quantity are required",
      });
    }

    const userId = req.user.userId;
    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the product exists in the user's cart
    let userProduct = await prisma.userProducts.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: existingUser.id,
        },
      },
    });

    // If the user does not have the product in their cart, add it with the given quantity
    if (!userProduct) {
      userProduct = await prisma.userProducts.create({
        data: {
          userId: existingUser.id,
          productId,
          quantity, // Set the quantity as provided in the request
        },
      });
    } else {
      // If the product is already in the cart, set the quantity directly to the provided value
      userProduct = await prisma.userProducts.update({
        where: {
          id: userProduct.id,
        },
        data: {
          quantity, // Directly set the new quantity (no addition)
        },
      });
    }

    // Respond with the updated or created product
    res.status(201).json({
      product: { quantity: userProduct.quantity },
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
    const { productId } = req.params; // Get product ID from request parameters
    const updateData = req.body; // Get the new product data from request body

    const updatedProduct = await prisma.product.update({
      where: { productId },
      data: updateData, // Update all columns dynamically
    });

    res.json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update product", details: error.message });
  }
};

// export const updateProduct = async (req, res) => {
//   try {
//     const { userId, productId, quantity } = req.body;

//     if (!userId || !productId || quantity == null) {
//       return res
//         .status(400)
//         .json({ error: "userId, productId, and quantity are required" });
//     }

//     const existingUserProduct = await prisma.userProducts.findUnique({
//       where: {
//         productId_userId: { productId, userId },
//       },
//     });

//     if (!existingUserProduct) {
//       return res.status(404).json({ error: "Product not found for this user" });
//     }

//     const updatedUserProduct = await prisma.userProducts.update({
//       where: {
//         productId_userId: { productId, userId },
//       },
//       data: { quantity },
//     });

//     res.status(200).json({
//       product: updatedUserProduct,
//       message: "Product quantity updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating product quantity:", error);
//     res.status(500).json({
//       error: "Failed to update product quantity",
//       details: error.message,
//     });
//   }
// };

export const deleteProductuser = async (req, res) => {
  try {
    const { productId } = req.body;

    const userId = req.user.userId;
    if (!productId) {
      return res.status(400).json({ error: "ProductId is required" });
    }

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the product exists in the user's cart
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

    // Delete the product from the user's cart
    await prisma.userProducts.delete({
      where: { id: userProduct.id },
    });

    return res.status(200).json({
      message: "Product removed from cart successfully",
      productId,
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
