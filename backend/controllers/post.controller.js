import ImageKit from "imagekit";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
// Añadir esta importación al principio del archivo junto con las otras importaciones
import Category from "../models/category.model.js";

// Inicialización de ImageKit dentro de una función para asegurar que las variables de entorno estén cargadas
let imagekit;

const getImageKitInstance = () => {
  if (!imagekit) {
    if (!process.env.IK_PUBLIC_KEY || !process.env.IK_PRIVATE_KEY || !process.env.IK_URL_ENDPOINT) {
      throw new Error("Faltan variables de entorno para ImageKit");
    }
    imagekit = new ImageKit({
      urlEndpoint: process.env.IK_URL_ENDPOINT,
      publicKey: process.env.IK_PUBLIC_KEY,
      privateKey: process.env.IK_PRIVATE_KEY,
    });
  }
  return imagekit;
};

export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const category = req.query.cat;
  const filter = req.query.filter || 'newest'; // Valor por defecto: newest
  const search = req.query.search; // Parámetro para búsqueda
  const isFeatured = req.query.isFeatured === 'true'; // Nuevo parámetro para posts destacados

  // Crear un objeto de filtro que se usará en la consulta
  const queryFilter = {};
  
  // Si se proporciona una categoría, añadirla al filtro
  if (category) {
    queryFilter.category = category;
  }

  // Si se solicitan posts destacados, añadir el filtro
  if (req.query.isFeatured === 'true') {
    queryFilter.isFeatured = true;
  }

  // Si se proporciona un término de búsqueda, añadir filtro por título
  if (search) {
    // Usar expresión regular para buscar coincidencias parciales, insensible a mayúsculas/minúsculas
    queryFilter.title = { $regex: search, $options: 'i' };
  }

  // Configurar el orden según el filtro seleccionado
  let sortOption = {};
  switch (filter) {
    case 'newest':
      sortOption = { createdAt: -1 }; // Más recientes primero
      break;
    case 'oldest':
      sortOption = { createdAt: 1 }; // Más antiguos primero
      break;
    case 'popular':
      sortOption = { visit: -1 }; // Más visitas primero
      break;
    case 'trending':
      // Para trending, podríamos combinar visitas recientes
      // Esta es una implementación simple, podría mejorarse
      sortOption = { visit: -1, createdAt: -1 };
      break;
    default:
      sortOption = { createdAt: -1 }; // Por defecto, más recientes primero
  }

  const posts = await Post.find(queryFilter)
    .populate("user", "username")
    .sort(sortOption)
    .limit(limit)
    .skip((page - 1) * limit);

  // Contar solo los posts que coinciden con el filtro
  const totalPosts = await Post.countDocuments(queryFilter);
  const hasMore = page * limit < totalPosts;

  res.status(200).json({ posts, hasMore });
};

export const getPost = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate("user", "username img");
  res.status(200).json(post);
};

export const createPost = async (req, res) => {
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ clerkUserId });

  if (!user) {
    return res.status(404).json("User not found!");
  }

  // let slug = req.body.title.replace(/ /g, "-").toLowerCase();
  // Modificar esta línea para manejar caracteres especiales
  let slug = req.body.title
    .replace(/[^\w\s]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-')    // Reemplazar espacios con guiones
    .toLowerCase();
  
  let existingPost = await Post.findOne({ slug });

  let counter = 2;

  while (existingPost) {
    slug = `${slug}-${counter}`;
    existingPost = await Post.findOne({ slug });
    counter++;
  }

  // Si no se proporciona una categoría, obtener la primera categoría disponible
  let postData = { ...req.body };
  if (!postData.category) {
    try {
      // Obtener la primera categoría disponible
      const firstCategory = await Category.findOne().sort({ name: 1 });
      if (firstCategory) {
        postData.category = firstCategory.slug;
      }
    } catch (error) {
      console.error("Error al obtener categoría por defecto:", error);
    }
  }

  const newPost = new Post({ user: user._id, slug, ...postData });

  const post = await newPost.save();
  res.status(200).json(post);
};

export const deletePost = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const role = req.auth.sessionClaims?.metadata?.role || "user";

  if (role === "admin") {
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json("Post has been deleted");
  }

  const user = await User.findOne({ clerkUserId });

  const deletedPost = await Post.findOneAndDelete({
    _id: req.params.id,
    user: user._id,
  });

  if (!deletedPost) {
    return res.status(403).json("You can delete only your posts!");
  }

  res.status(200).json("Post has been deleted");
};

export const featurePost = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const postId = req.body.postId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const role = req.auth.sessionClaims?.metadata?.role || "user";

  if (role !== "admin") {
    return res.status(403).json("You cannot feature posts!");
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json("Post not found!");
  }

  const isFeatured = post.isFeatured;

  // Si estamos intentando destacar un post (no quitarle el destacado)
  if (!isFeatured) {
    // Contar cuántos posts destacados hay actualmente
    const featuredCount = await Post.countDocuments({ isFeatured: true });
    
    // Si ya hay 3 posts destacados, no permitir destacar más
    if (featuredCount >= 3) {
      return res.status(400).json({
        message: "No se pueden destacar más de 3 posts. Quita el destacado a uno existente primero."
      });
    }
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      isFeatured: !isFeatured,
    },
    { new: true }
  );

  res.status(200).json(updatedPost);
};

export const uploadAuth = async (req, res) => {
  try {
    const imagekit = getImageKitInstance();
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
  } catch (error) {
    console.error("Error initializing ImageKit:", error.message);
    res.status(500).json({ error: "Error initializing ImageKit" });
  }
};
