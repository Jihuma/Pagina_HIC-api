import ImageKit from "imagekit";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

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

  const posts = await Post.find()
    .populate("user", "username")
    .limit(limit)
    .skip((page - 1) * limit);

  const totalPosts = await Post.countDocuments();
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

  let slug = req.body.title.replace(/ /g, "-").toLowerCase();

  let existingPost = await Post.findOne({ slug });

  let counter = 2;

  while (existingPost) {
    slug = `${slug}-${counter}`;
    existingPost = await Post.findOne({ slug });
    counter++;
  }

  const newPost = new Post({ user: user._id, slug, ...req.body });

  const post = await newPost.save();
  res.status(200).json(post);
};

export const deletePost = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
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
