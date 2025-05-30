import DOMPurify from "dompurify";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Image from "../components/Image";
import { Link, useParams } from "react-router-dom";
import PostMenuActions from "../components/PostMenuActions";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
// import { format } from "timeago.js"; // No se usa 'format' directamente, solo 'formatDate' local
import Footer from "../components/Footer";
import { useState, useEffect } from "react";

const fetchPost = async (slug) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
  return res.data;
};

const SinglePostPage = () => {
  const { slug } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formOpacity, setFormOpacity] = useState(1);
  const [formData, setFormData] = useState({
    parentName: "",
    parentSurname: "",
    childName: "",
    childGender: "",
    childAge: "",
    childBirthDate: "",
    contactPhone: "",
    contactEmail: "",
    consultationReason: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
  });

  // Agregar este console.log para debuggear
  if (data) {
    console.log("Datos del post recibidos:", data);
    console.log("Contenido del post:", data.content);
    console.log("Longitud del contenido:", data.content ? data.content.length : 0);
  }

  useEffect(() => {
    // Trigger fade-in after step changes
    setFormOpacity(1);
    // Si volvemos a un paso anterior al de éxito, reseteamos el estado de envío
    if (currentStep < 4) {
        setFormSubmitted(false);
        setSubmitError(null); // También limpiar errores previos al cambiar de paso
    }
  }, [currentStep]);

  // Definir handleInputChange DENTRO del componente
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [id]: value
    }));
  };

  const changeStep = (newStep) => {
    setFormOpacity(0); // Start fade-out
    setTimeout(() => {
      setCurrentStep(newStep);
      // setFormOpacity(1) será manejado por el useEffect que observa currentStep
    }, 300); // Duración del fade-out (debe coincidir con la transición CSS)
  };
  
  // Definir handleSubmitForm DENTRO del componente
  const handleSubmitForm = async () => {
    try {
      setSubmitError(null); // Limpiar errores previos
      setFormSubmitted(false); // Resetear estado de envío para nuevo intento

      // Validar que todos los campos requeridos estén completos
      const requiredFields = {
        parentName: "Nombres del Padre/Madre/Tutor",
        parentSurname: "Apellidos del Padre/Madre/Tutor",
        contactPhone: "Teléfono de Contacto",
        contactEmail: "Correo Electrónico",
        consultationReason: "Motivo de la Consulta"
      };
      
      
      const missingFields = Object.entries(requiredFields)
        .filter(([fieldKey]) => !formData[fieldKey] || formData[fieldKey].trim() === "")
        .map(([, fieldName]) => fieldName);

      if (missingFields.length > 0) {
        setSubmitError(`Por favor complete todos los campos requeridos: ${missingFields.join(', ')}.`);
        return;
      }

      // Validar formato de email
      if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        setSubmitError("Por favor ingrese un correo electrónico válido.");
        return;
      }
      // Validar formato de teléfono (ejemplo: solo números, opcionalmente con guiones o espacios, entre 7 y 15 dígitos)
      if (!/^\+?(\d[\s-]?){6,14}\d$/.test(formData.contactPhone)) {
         setSubmitError("Por favor ingrese un número de teléfono válido.");
         return;
      }

      console.log("Enviando formulario:", formData); // Log para depuración
      // Asegúrate de que el endpoint `/contact-forms` exista en tu backend
      // y esté preparado para recibir estos datos.
      await axios.post(`${import.meta.env.VITE_API_URL}/api/contact-forms`, {
        ...formData,
        postId: data?._id, // Relacionar con el artículo actual, verificar si data existe
        postTitle: data?.title // Opcional: enviar el título del post para referencia
      });

      setFormSubmitted(true); // Indicar que el formulario fue enviado exitosamente
      changeStep(4); // Avanzar al paso de éxito
    } catch (error) {
      console.error("Error al enviar formulario:", error.response ? error.response.data : error.message);
      setSubmitError(error.response?.data?.message || "Ocurrió un error al enviar el formulario. Por favor intente nuevamente más tarde.");
      // No cambiar de paso si hay un error, para que el usuario vea el mensaje.
    }
  };

  if (isPending) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-20 text-red-500">
      <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
      <p>Algo salió mal al cargar el artículo. Por favor, intenta de nuevo más tarde.</p>
      <p className="text-sm mt-2">{error.message}</p>
    </div>
  );
  

  if (!data) return (
    <div className="text-center py-20 text-gray-500">
      <i className="fas fa-search text-3xl mb-3"></i>
      <p>Artículo no encontrado o datos no disponibles.</p>
    </div>
  );


  // Mejorar la sanitización con más debugging
  const sanitizedContent = data?.content ? (() => {
  console.log("Contenido antes de sanitizar:", data.content.substring(0, 200) + "...");
  const sanitized = DOMPurify.sanitize(data.content, {
  ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'em', 'strong', 'br', 'div', 'span'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style']
  });
  console.log("Contenido después de sanitizar:", sanitized.substring(0, 200) + "...");
  return sanitized;
  })() : "";
  const sanitizedDesc = data.desc ? DOMPurify.sanitize(data.desc).replace(/<[^>]+>/g, "").slice(0, 160) : "Descripción no disponible.";
  
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  const handleNextStep = () => {
    // Si estamos en el paso 3, el botón "Siguiente" se convierte en "Enviar"
    // y debe llamar a handleSubmitForm.
    if (currentStep === 3) {
        handleSubmitForm();
    } else if (currentStep < 4) { // Para los pasos 1 y 2, simplemente avanza.
        changeStep(currentStep + 1);
    }
    // Si currentStep es 4 (éxito), este botón no debería estar visible.
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      changeStep(currentStep - 1);
    }
  };

  const getStepIndicatorClass = (stepNumber, type = "icon") => {
    if (type === "icon") {
      return currentStep >= stepNumber ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700";
    }
    if (type === "line") {
      return currentStep > stepNumber ? "bg-blue-500" : "bg-gray-300";
    }
    if (type === "text") {
      return currentStep >= stepNumber ? "text-blue-600 font-semibold" : "text-gray-500";
    }
    return "";
  };
  
  const resetFormAndStartOver = () => {
    setFormData({
        parentName: "", parentSurname: "", childName: "", childGender: "",
        childAge: "", childBirthDate: "", contactPhone: "", contactEmail: "",
        consultationReason: ""
    });
    setFormSubmitted(false);
    setSubmitError(null);
    changeStep(1);
  };


  return (
    <HelmetProvider>
      <div className="flex flex-col min-h-screen">
        <Helmet>
          <title>{data.title || "Artículo"} | Blog</title>
          <meta name="description" content={sanitizedDesc} />
          <meta name="author" content={data.user ? data.user.username : 'Autor desconocido'} />
          <meta property="og:title" content={data.title || "Artículo"} />
          <meta property="og:description" content={sanitizedDesc} />
          <meta property="og:type" content="article" />
          {data.img && <meta property="og:image" content={data.img} />}
        </Helmet>

        <div className="relative flex-grow -mx-4 md:-mx-8 lg:-mx-16 xl:-mx-32 2xl:-mx-64 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-8 bg-[#eff6ff]">
          <div className="absolute top-[-5px] left-0 right-0 h-1 shadow-top-bottom"></div>

          <div className="mb-8 mt-6 pt-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{data.title}</h1>
            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-2">
              <span>Por </span>
              {data.user ? (
                <Link to={`/author/${data.user.username}`} className="text-blue-600 hover:underline mx-1">
                  {data.user.username}
                </Link>
              ) : (
                <span className="text-gray-600 mx-1">Autor desconocido</span>
              )}
              <span className="mx-1">•</span>
              <span>Publicado el {formatDate(data.createdAt)}</span>
              <span className="mx-1">•</span>
              <span>Categoría: </span>
              <Link to={`/posts?cat=${data.category}`} className="text-blue-600 hover:underline mx-1">
                {data.category}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              {data.img && (
                <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
                  <Image 
                    src={data.img} 
                    className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md" 
                    w="1200" // Asegúrate que estos valores sean strings si IKImage los espera así
                    h="500"  // O números si eso es lo que espera
                    alt={data.title || "Imagen del artículo"}
                  />
                </div>
              )}
              
              <div className="mb-8 bg-purple-50 bg-opacity-70 p-6 rounded-lg border-l-4 border-purple-400 shadow-sm">
                <div className="pl-4">
                  <p className="text-lg italic text-purple-800 leading-relaxed">
                    "{sanitizedDesc}"
                  </p>
                  {/* data.author no es un campo estándar en tu modelo Post. Quizás quisiste usar data.user.username? */}
                  {/* Si 'author' y 'authorTitle' son campos que añades al post en el backend, está bien. */}
                  {data.customAuthorField && ( 
                    <p className="mt-3 text-sm text-gray-600">
                      — {data.customAuthorField}, {data.customAuthorTitle || 'Fuente'}
                    </p>
                  )}
                </div>
              </div>
              
              <div 
                className="post-content prose prose-lg max-w-none mb-12 bg-white p-6 rounded-lg shadow-sm"
              >
                {sanitizedContent ? (
                  <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                ) : (
                  <p>No hay contenido disponible para este artículo.</p>
                )}
              </div>
              
                <h2 className="text-3xl font-bold text-center text-gray-700 mb-8">
                  Formulario de Contacto Médico para Padres
                </h2>
              <div className="mb-12 bg-white rounded-lg shadow-lg p-6 md:p-8 text-gray-800">
                
                {/* Indicador de progreso */}
                <div className="flex items-center mb-8">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getStepIndicatorClass(1)} transition-colors duration-300`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <p className={`text-xs mt-1 ${getStepIndicatorClass(1, "text")} transition-colors duration-300`}>Datos Padres</p>
                  </div>
                  <div className={`flex-grow h-1 mx-2 rounded-full ${getStepIndicatorClass(1, "line")} transition-colors duration-300`}></div>
                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getStepIndicatorClass(2)} transition-colors duration-300`}>
                     {/* Icono cambiado a uno infantil */}
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M7 16a6 6 0 0 0 10 0" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" /></svg>
                    </div>
                     <p className={`text-xs mt-1 ${getStepIndicatorClass(2, "text")} transition-colors duration-300`}>Datos Niño/a</p>
                  </div>
                  <div className={`flex-grow h-1 mx-2 rounded-full ${getStepIndicatorClass(2, "line")} transition-colors duration-300`}></div>
                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getStepIndicatorClass(3)} transition-colors duration-300`}>
                       {/* Icono cambiado a uno de comunicación/carta */}
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <p className={`text-xs mt-1 ${getStepIndicatorClass(3, "text")} transition-colors duration-300`}>Motivo Comunicación</p>
                  </div>
                  <div className={`flex-grow h-1 mx-2 rounded-full ${getStepIndicatorClass(3, "line")} transition-colors duration-300`}></div>
                  {/* Step 4 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getStepIndicatorClass(4)} transition-colors duration-300`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className={`text-xs mt-1 ${getStepIndicatorClass(4, "text")} transition-colors duration-300`}>Éxito</p>
                  </div>
                </div>
                
                {/* Mensaje de error global para el formulario */}
                {submitError && currentStep === 3 && ( // Mostrar error solo en el paso de envío si persiste
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {submitError}
                    </div>
                )}

                <div style={{ transition: 'opacity 0.3s ease-in-out', opacity: formOpacity }}>
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-gray-700">Datos del Padre/Madre/Tutor</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="parentName" className="block text-sm mb-2 text-gray-600">Nombres</label>
                          <input 
                            type="text" id="parentName" placeholder="Nombres del padre/madre/tutor"
                            value={formData.parentName} onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="parentSurname" className="block text-sm mb-2 text-gray-600">Apellidos</label>
                          <input 
                            type="text" id="parentSurname" placeholder="Apellidos del padre/madre/tutor"
                            value={formData.parentSurname} onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-gray-700">Datos del Niño/a</h2>
                      <div className="mb-6">
                        <label htmlFor="childName" className="block text-sm font-medium mb-1 text-gray-600">Nombre completo del Niño/a</label>
                        <input 
                          type="text" id="childName" placeholder="Ej: Juanito Pérez Rodríguez"
                          value={formData.childName} onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <label htmlFor="childGender" className="block text-sm font-medium mb-1 text-gray-600">Género</label>
                          <select 
                            id="childGender" value={formData.childGender} onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Seleccione...</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="childAge" className="block text-sm font-medium mb-1 text-gray-600">Número de Expediente</label>
                          <input 
                            type="text" id="childAge" placeholder="Ej: 74367401"
                            value={formData.childAge} onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="childBirthDate" className="block text-sm font-medium mb-1 text-gray-600">Fecha de Nacimiento</label>
                          <input 
                            type="date" id="childBirthDate"
                            value={formData.childBirthDate} onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-gray-700">Información de Contacto y Motivo</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="contactPhone" className="block text-sm font-medium mb-1 text-gray-600">Teléfono de Contacto</label>
                          <input 
                            type="tel" id="contactPhone" placeholder="Ej: (614) 123-4567"
                            value={formData.contactPhone} onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="contactEmail" className="block text-sm font-medium mb-1 text-gray-600">Correo Electrónico</label>
                          <input 
                            type="email" id="contactEmail" placeholder="Ej: correo@ejemplo.com"
                            value={formData.contactEmail} onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mb-6">
                        <label htmlFor="consultationReason" className="block text-sm font-medium mb-1 text-gray-600">Motivo de la Consulta</label>
                        <textarea 
                          id="consultationReason" rows="5" placeholder="Describa brevemente el motivo de comunicación..."
                          value={formData.consultationReason} onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="text-center py-8">
                      {formSubmitted && !submitError ? (
                        <>
                          <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <h2 className="text-2xl font-bold mb-3 text-gray-700">¡Formulario Enviado con Éxito!</h2>
                          <p className="text-gray-600 mb-6">Gracias por contactarnos. Nos pondremos en contacto contigo pronto.</p>
                        </>
                      ) : submitError ? (
                         <>
                            <div className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-red-700">Error al Enviar</h2>
                            <p className="text-gray-600 mb-6">{submitError}</p>
                         </>
                      ) : (
                        // Estado intermedio o inesperado
                        <p className="text-gray-600">Procesando...</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Botones de navegación del formulario */}
                {currentStep < 4 && (
                  <div className="flex justify-between items-center mt-8">
                    {currentStep > 1 ? (
                      <button 
                        onClick={handlePreviousStep}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded-md transition duration-300"
                      >
                        Regresar
                      </button>
                    ) : ( <div></div> ) /* Placeholder para mantener el botón "Siguiente" a la derecha */}
                    
                    <button 
                      onClick={handleNextStep} // Esta función ahora llama a handleSubmitForm en el paso 3
                      className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-md transition duration-300"
                    >
                      {currentStep === 3 ? 'Enviar Formulario' : 'Siguiente'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Barra lateral */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Buscar Artículo</h2>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Buscar..." 
                      className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="absolute right-3 top-2.5 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Artículos Relacionados</h2>
                  {/* Aquí podrías cargar artículos relacionados dinámicamente */}
                  <ul className="space-y-4">
                    <li><Link to="#" className="text-blue-600 hover:underline">Artículo Relacionado 1</Link></li>
                    <li><Link to="#" className="text-blue-600 hover:underline">Artículo Relacionado 2</Link></li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Categorías</h2>
                   {/* Aquí podrías cargar categorías dinámicamente */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center"><Link to="#" className="text-blue-600 hover:underline">Categoría A</Link><span className="text-gray-500 text-sm">(5)</span></div>
                    <div className="flex justify-between items-center"><Link to="#" className="text-blue-600 hover:underline">Categoría B</Link><span className="text-gray-500 text-sm">(8)</span></div>
                  </div>
                </div>
                
                {data && data.user && ( // Solo mostrar PostMenuActions si hay datos del post y del usuario
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <PostMenuActions post={data}/>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="-mx-4 md:-mx-8 lg:-mx-16 xl:-mx-32 2xl:-mx-64 mt-auto">
          <Footer />
        </div>
        
        <style jsx>{`
          .shadow-inner-bottom { box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1); }
          .shadow-top-bottom { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        `}</style>
      </div>
    </HelmetProvider>
  );
};

export default SinglePostPage;
