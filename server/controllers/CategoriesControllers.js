import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      },
    });

    const categoriesWithProductCount = categories.map((category) => ({
      id: category.id,
      name: category.name,
      productCount: category.products.length,
    }));

    res.json(categoriesWithProductCount);
  } catch (err) {
    res.status(500).json({ error: "Failed to get categories" });
  }
};

// 🔍 Get category by ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: "Failed to get category" });
  }
};

// ➕ Add category
export const addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

// ✏️ Edit category
export const editCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
};

// 🗑️ Delete category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};

export const getProductsByCategoryId = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the category by ID and include the associated products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true, // Include related products
      },
    });

    // If the category doesn't exist, return a 404 error
    if (!category) return res.status(404).json({ error: "Category not found" });

    // Return the products belonging to this category
    res.json(category.products);
  } catch (err) {
    res.status(500).json({ error: "Failed to get products for category" });
  }
};
