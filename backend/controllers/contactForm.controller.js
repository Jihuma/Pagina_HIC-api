import ContactForm from "../models/contactForm.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";

// Obtener todos los formularios de contacto (solo para administradores)
export const getAllContactForms = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener los formularios con paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Crear el filtro de búsqueda basado en el estado
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const forms = await ContactForm.find(filter)
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación (más reciente primero)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("relatedPost", "title slug");

    const total = await ContactForm.countDocuments(filter);

    res.status(200).json({
      forms,
      total,
      page,
      limit,
      hasMore: total > page * limit,
    });
  } catch (error) {
    console.error("Error al obtener formularios de contacto:", error);
    res.status(500).json({ message: "Error al obtener formularios de contacto" });
  }
};

// Crear un nuevo formulario de contacto
export const createContactForm = async (req, res) => {
  try {
    const { 
      parentName, 
      parentSurname, 
      childName, 
      childGender, 
      childAge, 
      childBirthDate, 
      contactPhone, 
      contactEmail, 
      consultationReason,
      postId 
    } = req.body;

    // Validar campos requeridos
    if (!parentName || !parentSurname || !contactPhone || !contactEmail || !consultationReason) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Crear el nuevo formulario
    const newForm = new ContactForm({
      parentName,
      parentSurname,
      childName,
      childGender,
      childAge,
      childBirthDate,
      contactPhone,
      contactEmail,
      consultationReason,
      relatedPost: postId || null
    });

    const savedForm = await newForm.save();
    res.status(201).json(savedForm);
  } catch (error) {
    console.error("Error al crear formulario de contacto:", error);
    res.status(500).json({ message: "Error al crear formulario de contacto" });
  }
};

// Eliminar un formulario de contacto
export const deleteContactForm = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const formId = req.params.id;
    const deletedForm = await ContactForm.findByIdAndDelete(formId);

    if (!deletedForm) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }

    res.status(200).json({ message: "Formulario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar formulario de contacto:", error);
    res.status(500).json({ message: "Error al eliminar formulario de contacto" });
  }
};

// Actualizar el estado de un formulario
export const updateContactFormStatus = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { status } = req.body;
    const formId = req.params.id;

    if (!status || !['pending', 'reviewed', 'contacted'].includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const updatedForm = await ContactForm.findByIdAndUpdate(
      formId,
      { status },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }

    res.status(200).json(updatedForm);
  } catch (error) {
    console.error("Error al actualizar estado del formulario:", error);
    res.status(500).json({ message: "Error al actualizar estado del formulario" });
  }
};