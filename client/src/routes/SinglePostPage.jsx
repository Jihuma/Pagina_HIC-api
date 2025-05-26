import DOMPurify from "dompurify";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Image from "../components/Image";
import { Link, useParams } from "react-router-dom";
import PostMenuActions from "../components/PostMenuActions";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";
import Footer from "../components/Footer";
import { useState, useEffect } from "react"; // Import useState and useEffect

const fetchPost = async (slug) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
  return res.data;
};

const SinglePostPage = () => {
  const { slug } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formOpacity, setFormOpacity] = useState(1); // For fade transition

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
  });

  useEffect(() => {
    // Trigger fade-in after step changes
    setFormOpacity(1);
  }, [currentStep]);

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
      <p>Artículo no encontrado.</p>
    </div>
  );

  const sanitizedContent = DOMPurify.sanitize(data.content);
  const sanitizedDesc = DOMPurify.sanitize(data.desc).replace(/<[^>]+>/g, "").slice(0, 160);
  
  const readingTime = 10;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  const changeStep = (newStep) => {
    setFormOpacity(0); // Start fade-out
    setTimeout(() => {
      setCurrentStep(newStep);
      // setFormOpacity(1) will be handled by useEffect watching currentStep
    }, 300); // Duration of fade-out (must match CSS transition)
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      changeStep(currentStep + 1);
    }
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

  return (
    <HelmetProvider>
      <div className="flex flex-col min-h-screen">
        <Helmet>
          <title>{data.title} | Blog</title>
          <meta name="description" content={sanitizedDesc} />
          <meta name="author" content={data.user.username} />
          <meta property="og:title" content={data.title} />
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
              <Link to={`/author/${data.user.username}`} className="text-blue-600 hover:underline mx-1">
                {data.user.username}
              </Link>
              <span className="mx-1">•</span>
              <span>Publicado el {formatDate(data.createdAt)}</span>
              <span className="mx-1">•</span>
              <span>Categoría: </span>
              <Link to={`/posts?cat=${data.category}`} className="text-blue-600 hover:underline mx-1">
                {data.category}
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              Tiempo de lectura estimado: {readingTime} minutos
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              {data.img && (
                <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
                  <Image 
                    src={data.img} 
                    className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md" 
                    w="1200"
                    alt={data.title}
                  />
                </div>
              )}
              
              <div className="mb-8 bg-purple-50 bg-opacity-70 p-6 rounded-lg border-l-4 border-purple-400 shadow-sm">
                <div className="pl-4">
                  <p className="text-lg italic text-purple-800 leading-relaxed">
                    "{sanitizedDesc}"
                  </p>
                  {data.author && (
                    <p className="mt-3 text-sm text-gray-600">
                      — {data.author}, {data.authorTitle || 'Autor'}
                    </p>
                  )}
                </div>
              </div>
              
              <div 
                className="post-content prose prose-lg max-w-none mb-12 bg-white p-6 rounded-lg shadow-sm"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
              {/* NUEVO TÍTULO DEL FORMULARIO */}
                <h2 className="text-3xl font-bold text-center text-gray-700 mb-8">
                  Formulario de Contacto Médico para Padres
                </h2>
              <div className="mb-12 bg-white rounded-lg shadow-lg p-6 md:p-8 text-gray-800">
                
                {/* Indicador de progreso */}
                <div className="flex items-center mb-8">
                  {/* Step 1: Personal Info */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getStepIndicatorClass(1)} transition-colors duration-300`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className={`text-xs mt-1 ${getStepIndicatorClass(1, "text")} transition-colors duration-300`}>Datos Padres</p>
                  </div>
                  
                  <div className={`flex-grow h-1 mx-2 rounded-full ${getStepIndicatorClass(1, "line")} transition-colors duration-300`}></div>
                  
                  {/* Step 2: Address Info */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getStepIndicatorClass(2)} transition-colors duration-300`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                     <p className={`text-xs mt-1 ${getStepIndicatorClass(2, "text")} transition-colors duration-300`}>Datos Niño/a</p>
                  </div>

                  <div className={`flex-grow h-1 mx-2 rounded-full ${getStepIndicatorClass(2, "line")} transition-colors duration-300`}></div>
                  
                  {/* Step 3: Payment Info */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getStepIndicatorClass(3)} transition-colors duration-300`}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className={`text-xs mt-1 ${getStepIndicatorClass(3, "text")} transition-colors duration-300`}>Motivo Comunicacion</p>
                  </div>

                  <div className={`flex-grow h-1 mx-2 rounded-full ${getStepIndicatorClass(3, "line")} transition-colors duration-300`}></div>
                  
                  {/* Step 4: Success */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getStepIndicatorClass(4)} transition-colors duration-300`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className={`text-xs mt-1 ${getStepIndicatorClass(4, "text")} transition-colors duration-300`}>Éxito</p>
                  </div>
                </div>
                
                {/* Contenido del Paso Actual con Transición */}
                <div style={{ transition: 'opacity 0.3s ease-in-out', opacity: formOpacity }}>
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-gray-700">Datos del Padre/Madre/Tutor</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm mb-2 text-gray-600">Nombres</label>
                          <input 
                            type="text" 
                            placeholder="John"
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2 text-gray-600">Apellidos</label>
                          <input 
                            type="text" 
                            placeholder="Doe"
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      {/* <div className="mb-8">
                        <label className="block text-sm mb-2 text-gray-600">Email</label>
                        <input 
                          type="email" 
                          placeholder="john.doe@example.com"
                          className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div> */}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-gray-700">Datos del Niño/a</h2>
                      <div className="mb-6">
                        <label htmlFor="ninoNombreCompleto" className="block text-sm font-medium mb-1 text-gray-600">Nombre completo del Niño/a</label>
                        <input 
                          type="text" 
                          id="ninoNombreCompleto"
                          placeholder="Ej: Juanito Pérez Rodríguez"
                          className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <label htmlFor="ninoGenero" className="block text-sm font-medium mb-1 text-gray-600">Género</label>
                          <select 
                            id="ninoGenero"
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Seleccione...</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="ninoEdad" className="block text-sm font-medium mb-1 text-gray-600">Edad</label>
                          <input 
                            type="number"
                            id="ninoEdad"
                            placeholder="Ej: 5"
                            min="0"
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="ninoFechaNacimiento" className="block text-sm font-medium mb-1 text-gray-600">Fecha de Nacimiento</label>
                          <input 
                            type="date" 
                            id="ninoFechaNacimiento"
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
                          <label htmlFor="contactoTelefono" className="block text-sm font-medium mb-1 text-gray-600">Teléfono de Contacto</label>
                          <input 
                            type="tel"
                            id="contactoTelefono"
                            placeholder="Ej: 664-123-4567"
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="contactoEmail" className="block text-sm font-medium mb-1 text-gray-600">Correo Electrónico</label>
                          <input 
                            type="email" 
                            id="contactoEmail"
                            placeholder="Ej: correo@ejemplo.com"
                            className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mb-6">
                        <label htmlFor="motivoConsulta" className="block text-sm font-medium mb-1 text-gray-600">Motivo de la Consulta</label>
                        <textarea 
                          id="motivoConsulta"
                          rows="5" 
                          placeholder="Describa brevemente el motivo de comunicacion..."
                          className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold mb-3 text-gray-700">¡Completado con Éxito!</h2>
                      <p className="text-gray-600">Tu información ha sido procesada.</p>
                       <button 
                          onClick={() => changeStep(1)} // Reset to first step with transition
                          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition duration-300"
                        >
                          Empezar de Nuevo
                        </button>
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
                    ) : ( <div></div> ) /* Placeholder to keep "Next" button to the right */ }
                    
                    <button 
                      onClick={handleNextStep}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-md transition duration-300"
                    >
                      {currentStep === 3 ? 'Enviar' : 'Siguiente'}
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
                  <ul className="space-y-4">
                    <li>
                      <Link to="/post/otro-articulo" className="text-blue-600 hover:underline">
                        Otro Artículo Interesante Sobre IA
                      </Link>
                    </li>
                    <li>
                      <Link to="/post/guia-tailwind" className="text-blue-600 hover:underline">
                        Guía Completa de Tailwind CSS
                      </Link>
                    </li>
                    <li>
                      <Link to="/post/tendencias-web" className="text-blue-600 hover:underline">
                        Las Últimas Tendencias en Diseño Web
                      </Link>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Categorías</h2>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <Link to="/posts?cat=desarrollo-web" className="text-blue-600 hover:underline">Desarrollo Web</Link>
                      <span className="text-gray-500 text-sm">(12)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Link to="/posts?cat=diseno-uxui" className="text-blue-600 hover:underline">Diseño UX/UI</Link>
                      <span className="text-gray-500 text-sm">(8)</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <PostMenuActions post={data}/>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="-mx-4 md:-mx-8 lg:-mx-16 xl:-mx-32 2xl:-mx-64 mt-auto">
          <Footer />
        </div>
        
        <style jsx>{`
          .shadow-inner-bottom {
            box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .shadow-top-bottom {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </HelmetProvider>
  );
};

export default SinglePostPage;