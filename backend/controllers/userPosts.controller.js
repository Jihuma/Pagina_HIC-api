import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";

// Obtener todos los posts del usuario autenticado
export const getUserPosts = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener los posts del usuario con paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    

    // Obtener todas las categorías para relacionarlas con los posts
    const categories = await Category.find();
    const categoriesMap = {};
    categories.forEach(category => {
      categoriesMap[category.name] = category;
    });

    let posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación (más reciente primero)
      .limit(limit)
      .skip((page - 1) * limit);
      
    // Transformación simple para que la categoría sea compatible con el frontend
    posts = posts.map(post => {
      const postObj = post.toObject();
      // Convertir la categoría de string a un objeto simple
      postObj.category = {
        name: postObj.category || "General"
      };
      return postObj;
    });

    const totalPosts = await Post.countDocuments({ user: user._id });
    const hasMore = page * limit < totalPosts;

    // Añadir el número de página actual a la respuesta
    res.status(200).json({ 
      posts, 
      hasMore, 
      totalPosts,
      page // Añadir el número de página actual
    });
  } catch (error) {
    console.error("Error al obtener posts del usuario:", error);
    res.status(500).json({ message: "Error al obtener los posts del usuario" });
  }
};

// Obtener un post específico del usuario por ID
export const getUserPost = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const postId = req.params.id;
    
    console.log(`Fetching post with ID: ${postId} for user: ${clerkUserId}`);

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el post pertenece al usuario
    const post = await Post.findOne({ _id: postId, user: user._id });
    
    console.log('Post found:', post ? 'Yes' : 'No');
    if (post) {
      console.log('Post data:', JSON.stringify(post));
    }

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado o no tienes permiso para editarlo" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error al obtener post del usuario:", error);
    res.status(500).json({ message: "Error al obtener el post" });
  }
};



// Actualizar un post específico del usuario
export const updateUserPost = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const postId = req.params.id;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el post pertenece al usuario
    const post = await Post.findOne({ _id: postId, user: user._id });

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado o no tienes permiso para editarlo" });
    }

    // Actualizar el post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { ...req.body },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error al actualizar post del usuario:", error);
    res.status(500).json({ message: "Error al actualizar el post" });
  }
};

// Eliminar un post específico del usuario
export const deleteUserPost = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const postId = req.params.id;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario es administrador
    const isAdmin = req.auth.sessionClaims?.metadata?.role === "admin";
    
    // Si es administrador, permitir eliminar cualquier post
    if (isAdmin) {
      await Post.findByIdAndDelete(postId);
      return res.status(200).json({ message: "Post eliminado correctamente" });
    }

    // Si no es administrador, verificar que el post pertenece al usuario
    const post = await Post.findOne({ _id: postId, user: user._id });

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado o no tienes permiso para eliminarlo" });
    }

    // Eliminar el post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar post del usuario:", error);
    res.status(500).json({ message: "Error al eliminar el post" });
  }
};

// Obtener todos los posts de todos los usuarios (solo para administradores)
export const getAllUserPosts = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario es administrador (usando los metadatos de Clerk)
    const isAdmin = req.auth.sessionClaims?.metadata?.role === "admin";
    
    if (!isAdmin) {
      return res.status(403).json({ message: "No autorizado. Se requiere rol de administrador" });
    }

    // Obtener todos los posts con paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Obtener todas las categorías para relacionarlas con los posts
    const categories = await Category.find();
    const categoriesMap = {};
    categories.forEach(category => {
      categoriesMap[category.name] = category;
    });

    // Obtener los posts
    let posts = await Post.find({})
      .populate("user", "username img") // Incluir información del usuario
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación (más reciente primero)
      .limit(limit)
      .skip((page - 1) * limit);

    // Transformar los posts para incluir la información completa de la categoría
    posts = posts.map(post => {
      const postObj = post.toObject();
      if (postObj.category && categoriesMap[postObj.category]) {
        postObj.category = categoriesMap[postObj.category];
      } else {
        // Si la categoría no existe, crear un objeto con valores predeterminados
        postObj.category = {
          name: postObj.category || "General",
          icon: "fas fa-folder",
          color: "bg-gray-600 text-white",
          hoverColor: "hover:bg-gray-700"
        };
      }
      return postObj;
    });

    const totalPosts = await Post.countDocuments({});
    const hasMore = page * limit < totalPosts;

    // Añadir el número de página actual a la respuesta
    res.status(200).json({ 
      posts, 
      hasMore, 
      totalPosts,
      page // Añadir el número de página actual
    });
  } catch (error) {
    console.error("Error al obtener todos los posts:", error);
    res.status(500).json({ message: "Error al obtener todos los posts" });
  }
};

// Actualizar un post como administrador (sin cambiar el autor)
export const updatePostAsAdmin = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const postId = req.params.id;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario es administrador
    const isAdmin = req.auth.sessionClaims?.metadata?.role === "admin";
    
    if (!isAdmin) {
      return res.status(403).json({ message: "No autorizado. Se requiere rol de administrador" });
    }

    // Buscar el post sin verificar que pertenezca al usuario actual
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    // Guardar el usuario original para no sobrescribirlo
    const originalUser = post.user;

    // Actualizar el post manteniendo el usuario original
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { 
        ...req.body,
        user: originalUser // Mantener el usuario original
      },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error al actualizar post como administrador:", error);
    res.status(500).json({ message: "Error al actualizar el post" });
  }
};

// Obtener un post específico como administrador (sin verificar propiedad)
export const getPostAsAdmin = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const postId = req.params.id;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario es administrador
    const isAdmin = req.auth.sessionClaims?.metadata?.role === "admin";
    
    if (!isAdmin) {
      return res.status(403).json({ message: "No autorizado. Se requiere rol de administrador" });
    }

    // Buscar el post sin verificar que pertenezca al usuario actual
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error al obtener post como administrador:", error);
    res.status(500).json({ message: "Error al obtener el post" });
  }
};
