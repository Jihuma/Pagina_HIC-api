import Category from "../models/category.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";

// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};

// Crear una nueva categoría
export const createCategory = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Crear slug a partir del nombre
    const name = req.body.name;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // Verificar si ya existe una categoría con ese nombre o slug
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }]
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Ya existe una categoría con ese nombre" });
    }

    // Crear la nueva categoría
    const newCategory = new Category({
      name,
      slug,
      icon: req.body.icon || "fas fa-folder",
      color: req.body.color || "bg-blue-600 text-white",
      hoverColor: req.body.hoverColor || "hover:bg-blue-700",
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ message: "Error al crear categoría" });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const categoryId = req.params.id;

    // Verificar si hay posts que usan esta categoría
    const postsWithCategory = await Post.findOne({ category: categoryId });

    if (postsWithCategory) {
      return res.status(400).json({ 
        message: "No se puede eliminar la categoría porque hay artículos que la utilizan" 
      });
    }

    // Eliminar la categoría
    await Category.findByIdAndDelete(categoryId);
    res.status(200).json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ message: "Error al eliminar categoría" });
  }
};