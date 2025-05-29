import express from "express"
import { 
    getUserPosts,
    getUserPost,
    updateUserPost,
    deleteUserPost,
    getAllUserPosts,
    updatePostAsAdmin,
    getPostAsAdmin // Añadir esta importación
} from "../controllers/userPosts.controller.js"
import { requireAuth } from '@clerk/express'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(requireAuth())

// Obtener todos los posts del usuario autenticado
router.get("/", getUserPosts)

// Obtener todos los posts de todos los usuarios (solo para administradores)
router.get("/all", getAllUserPosts)

// Obtener un post específico del usuario por ID
router.get("/:id", getUserPost)

// Obtener un post específico como administrador
router.get("/admin/:id", getPostAsAdmin) // Añadir esta ruta

// Actualizar un post específico del usuario
router.put("/:id", updateUserPost)

// Eliminar un post específico del usuario
router.delete("/:id", deleteUserPost)

// Actualizar un post como administrador (sin cambiar el autor)
router.put("/admin/:id", updatePostAsAdmin)

export default router