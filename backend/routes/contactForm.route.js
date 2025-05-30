import express from "express"
import { 
    getAllContactForms, 
    createContactForm, 
    deleteContactForm, 
    updateContactFormStatus 
} from "../controllers/contactForm.controller.js";
import { requireAuth } from '@clerk/express'

const router = express.Router()

// Ruta para crear un nuevo formulario de contacto (accesible para todos)
router.post("/", createContactForm);

// Rutas protegidas que requieren autenticación
router.use(requireAuth());

// Obtener todos los formularios de contacto (solo para administradores)
router.get("/", getAllContactForms);

// Eliminar un formulario de contacto
router.delete("/:id", deleteContactForm);

// Actualizar el estado de un formulario
router.patch("/:id/status", updateContactFormStatus);

export default router