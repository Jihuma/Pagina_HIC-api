// Añadir estas importaciones si no existen
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "../components/Image";
import { toast } from "react-toastify";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Footer from "../components/Footer";
import Confetti from "../components/Confetti";

// Función para obtener los artículos del usuario


// Modificar la función fetchUserPosts para manejar errores
const fetchUserPosts = async (pageParam, token) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user-posts`, {
      params: { page: pageParam, limit: 10 },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error en fetchUserPosts:", error);
    // Si el error es 404, podría ser un problema temporal
    if (error.response && error.response.status === 404) {
      toast.error("No se pudo conectar con el servidor. Intentando nuevamente...");
      // Retornar datos vacíos para evitar errores en la UI
      return { posts: [], hasMore: false, totalPosts: 0, page: pageParam };
    }
    throw error;
  }
};

// Función para obtener los formularios de contacto
const fetchContactForms = async (pageParam, token) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contact-forms`, {
    params: { page: pageParam, limit: 10 },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};

// Añadir función para obtener todos los artículos (solo para administradores)
const fetchAllUserPosts = async (pageParam, token) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user-posts/all`, {
      params: { page: pageParam, limit: 10 },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error en fetchAllUserPosts:", error);
    if (error.response && error.response.status === 403) {
      toast.error("No tienes permisos para ver todos los artículos");
    } else if (error.response && error.response.status === 404) {
      toast.error("No se pudo conectar con el servidor. Intentando nuevamente...");
    }
    throw error;
  }
};

const UserArticlesPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Añadir esta variable de estado para el nuevo tab
  const [activeTab, setActiveTab] = useState("articles"); // Mantener "articles" como pestaña por defecto
  const [selectedStatus, setSelectedStatus] = useState("all"); // Añadir esta línea
  // Añadir estado para verificar si el usuario es administrador
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Inicializar el confeti
  const confetti = Confetti();
  
  // Añadir estos estados para el manejo de categorías
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "fas fa-folder",
    color: "bg-blue-600 text-white",
    hoverColor: "hover:bg-blue-700"
  });
  const [iconOptions] = useState([
    "fas fa-folder", "fas fa-child", "fas fa-syringe", "fas fa-apple-alt", 
    "fas fa-shield-alt", "fas fa-calendar-alt", "fas fa-heartbeat", "fas fa-brain",
    "fas fa-stethoscope", "fas fa-hospital", "fas fa-pills", "fas fa-book-medical"
  ]);
  const [colorOptions] = useState([
    { bg: "bg-blue-600", hover: "hover:bg-blue-700", text: "Azul" },
    { bg: "bg-green-600", hover: "hover:bg-green-700", text: "Verde" },
    { bg: "bg-red-600", hover: "hover:bg-red-700", text: "Rojo" },
    { bg: "bg-yellow-500", hover: "hover:bg-yellow-600", text: "Amarillo" },
    { bg: "bg-purple-600", hover: "hover:bg-purple-700", text: "Púrpura" },
    { bg: "bg-pink-500", hover: "hover:bg-pink-600", text: "Rosa" },
    { bg: "bg-indigo-600", hover: "hover:bg-indigo-700", text: "Índigo" },
    { bg: "bg-gray-700", hover: "hover:bg-gray-800", text: "Gris" },
  ]);
  
  // Añadir esta consulta para obtener las categorías
  const {
    data: categoriesData,
    error: categoriesError,
    status: categoriesStatus,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
      return res.data;
    },
    enabled: activeTab === "categories",
  });
  
  // Añadir esta mutación para crear categorías
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData) => {
      return axios.post(`${import.meta.env.VITE_API_URL}/api/categories`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Categoría creada correctamente");
      setNewCategory({
        name: "",
        icon: "fas fa-folder",
        color: "bg-blue-600 text-white",
        hoverColor: "hover:bg-blue-700"
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al crear la categoría");
    }
  });
  
  // Añadir esta mutación para eliminar categorías
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId) => {
      return axios.delete(`${import.meta.env.VITE_API_URL}/api/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Categoría eliminada correctamente");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al eliminar la categoría");
    }
  });
  
  // Añadir esta función para manejar la creación de categorías
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }
    createCategoryMutation.mutate(newCategory);
  };
  
  // Añadir esta función para manejar la eliminación de categorías
  const handleDeleteCategory = (categoryId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };
  
  // Obtener el token de autenticación
  useEffect(() => {
    const fetchToken = async () => {
      if (isSignedIn) {
        const token = await getToken();
        setToken(token);
      }
    };
    fetchToken();
  }, [isSignedIn, getToken]);

    // Verificar si el usuario es administrador
    useEffect(() => {
      if (isLoaded && isSignedIn && user) {
        // Verificar si el usuario tiene el rol de administrador en sus metadatos públicos
        const userRole = user.publicMetadata?.role;
        setIsAdmin(userRole === "admin");
      }
    }, [isLoaded, isSignedIn, user]);
    
  // Efecto para mostrar el confeti si se llega desde la página de publicación
  useEffect(() => {
    if (location.state?.showConfetti) {
      // Mostrar el confeti en el centro de la pantalla
      console.log('Mostrando confeti en UserArticlesPage');
      confetti.fire();
      // Limpiar el estado para que no se muestre de nuevo al recargar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, confetti, navigate]);

  // Consulta para obtener los artículos del usuario
  const {
    data: articlesData,
    error: articlesError,
    fetchNextPage: fetchNextArticlesPage,
    hasNextPage: hasNextArticlesPage,
    status: articlesStatus,
    refetch: refetchArticles,
    isFetching: isArticlesFetching,
  } = useInfiniteQuery({
    queryKey: ['userPosts'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!token) return { posts: [], hasMore: false, totalPosts: 0, page: 1 };
      return fetchUserPosts(pageParam, token);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!token && activeTab === "articles",
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 3, // Intentar 3 veces si falla
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Espera exponencial
  });

  // Efecto para refrescar los artículos cuando se monta el componente o se cambia a la pestaña de artículos
  useEffect(() => {
    if (token && activeTab === "articles") {
      refetchArticles();
    }
  }, [token, activeTab, refetchArticles]);

  // Consulta para obtener los formularios de contacto
  const {
    data: formsData,
    error: formsError,
    fetchNextPage: fetchNextFormsPage,
    hasNextPage: hasNextFormsPage,
    status: formsStatus,
    isFetchingNextPage: isFormsFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['contactForms', selectedStatus],
    queryFn: async ({ pageParam = 1 }) => {
      if (!token) return { forms: [], hasMore: false, totalForms: 0, page: 1 };
      return fetchContactForms(pageParam, token);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!token && activeTab === "forms",
  });

  // Consulta para obtener todos los artículos (solo para administradores)
  const {
    data: allArticlesData,
    error: allArticlesError,
    fetchNextPage: fetchNextAllArticlesPage,
    hasNextPage: hasNextAllArticlesPage,
    status: allArticlesStatus,
    isFetchingNextPage: isAllArticlesFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['allUserPosts'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!token) return { posts: [], hasMore: false, totalPosts: 0, page: 1 };
      return fetchAllUserPosts(pageParam, token);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!token && isAdmin && activeTab === "allArticles",
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

    // Procesar los datos de todos los artículos
    const allUserPosts = allArticlesData?.pages.flatMap(page => page.posts) || [];
    const totalAllPosts = allArticlesData?.pages[0]?.totalPosts || 0;

  // Mutación para eliminar un artículo
  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      return axios.delete(`${import.meta.env.VITE_API_URL}/api/user-posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allUserPosts'] }); // Añadir esta línea
      toast.success("Artículo eliminado correctamente");
      setShowDeleteModal(false);
      setIsDeleting(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al eliminar el artículo");
      setIsDeleting(false);
    }
  });

  // Mutación para eliminar un formulario
  const deleteFormMutation = useMutation({
    mutationFn: async (formId) => {
      return axios.delete(`${import.meta.env.VITE_API_URL}/api/contact-forms/${formId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactForms'] });
      toast.success("Formulario eliminado correctamente");
    },
    onError: (error) => {
      console.error("Error al eliminar formulario:", error);
      toast.error("Error al eliminar el formulario");
    }
  });

  // Mutación para actualizar el estado de un formulario
  const updateStatusMutation = useMutation({
    mutationFn: async ({ formId, status }) => {
      return axios.patch(`${import.meta.env.VITE_API_URL}/api/contact-forms/${formId}/status`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactForms'] });
      toast.success("Estado actualizado correctamente");
    },
    onError: (error) => {
      console.error("Error al actualizar estado:", error);
      toast.error("Error al actualizar el estado");
    }
  });

  // Manejar la eliminación de un artículo
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      setIsDeleting(true);
      deleteMutation.mutate(postToDelete._id);
    }
  };

  // Manejar la eliminación de un formulario
  const handleDeleteForm = (formId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este formulario?")) {
      deleteFormMutation.mutate(formId);
    }
  };

  // Manejar el cambio de estado de un formulario
  const handleStatusChange = (formId, newStatus) => {
    updateStatusMutation.mutate({ formId, status: newStatus });
  };

  // Formatear la fecha para mostrarla en formato "Octubre 19, 2024"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/login");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Mostrar un spinner mientras se carga la información del usuario
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si el usuario no está autenticado, mostrar un mensaje
  if (isLoaded && !isSignedIn) {
    return (
      <div className="text-center py-20 text-red-500">
        <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
        <p>Debes iniciar sesión para ver tus artículos.</p>
      </div>
    );
  }

  const allPosts = articlesData?.pages?.flatMap((page) => page.posts) || [];
  const totalPosts = articlesData?.pages?.[0]?.totalPosts || 0;
  const allForms = formsData?.pages?.flatMap((page) => page.forms) || [];

  return (
    <HelmetProvider>
      <div className="flex flex-col min-h-screen">
        {/* Renderizar el componente de confeti */}
        {confetti.component}
        <Helmet>
          <title>Mi Panel | Administración</title>
          <meta name="description" content="Administra tus artículos y formularios de contacto" />
        </Helmet>

        {/* Contenido principal */}
        <div className="relative flex-grow -mx-4 md:-mx-8 lg:-mx-16 xl:-mx-32 2xl:-mx-64 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-8 bg-[#eff6ff]">
          {/* Sombra superior */}
          <div className="absolute top-[-5px] left-0 right-0 h-1 shadow-top-bottom"></div>

          {/* Contenedor centrado */}
          <div className="max-w-6xl mx-auto">
            {/* Encabezado de la página */}
            <div className="mb-8 mt-6 pt-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Mi Panel</h1>
              <div className="text-sm text-gray-600 mb-6">
                Administra tus artículos y formularios de contacto
              </div>
              
              {/* Pestañas de navegación */}
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-lg shadow-sm p-1 inline-flex flex-wrap">
                  <button 
                    onClick={() => setActiveTab("articles")}
                    className={`px-6 py-3 rounded-md transition-colors ${activeTab === "articles" ? "bg-blue-800 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <i className="fas fa-file-alt mr-2"></i>
                    Mis Artículos
                  </button>
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => setActiveTab("allArticles")}
                        className={`px-6 py-3 rounded-md transition-colors ${activeTab === "allArticles" ? "bg-blue-800 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        <i className="fas fa-globe mr-2"></i>
                        Todos los Artículos
                      </button>
                      <button 
                        onClick={() => setActiveTab("forms")}
                        className={`px-6 py-3 rounded-md transition-colors ${activeTab === "forms" ? "bg-blue-800 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        <i className="fas fa-envelope mr-2"></i>
                        Formularios de Contacto
                      </button>
                      <button 
                        onClick={() => setActiveTab("categories")}
                        className={`px-6 py-3 rounded-md transition-colors ${activeTab === "categories" ? "bg-blue-800 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        <i className="fas fa-tags mr-2"></i>
                        Categorías
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Botón para crear nuevo artículo (solo visible en la pestaña de artículos) */}
              {activeTab === "articles" && (
                <div className="mt-6">
                  <Link 
                    to="/write" 
                    className="inline-flex items-center bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Crear Nuevo Artículo
                  </Link>
                </div>
              )}
            </div>

            {/* Contenido de la pestaña de Artículos */}
            {activeTab === "articles" && (
              <>
                {/* Estadísticas */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-3xl font-bold text-blue-800">{totalPosts}</div>
                      <div className="text-sm text-gray-600">Total de Artículos</div>
                    </div>
                    {/* Aquí podrían ir más estadísticas en el futuro */}
                  </div>
                </div>

                {/* Lista de artículos */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Mis Artículos Publicados</h2>

                  {articlesStatus === "loading" && (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                    </div>
                  )}

                  {articlesStatus === "error" && (
                    <div className="text-center py-10 text-red-500">
                      <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                      <p>Algo salió mal al cargar tus artículos. Por favor, intenta de nuevo más tarde.</p>
                      <p className="text-sm mt-2">{articlesError.message}</p>
                    </div>
                  )}

                  {articlesStatus === "success" && allPosts.length === 0 && (
                    <div className="text-center py-10">
                      <i className="fas fa-file-alt text-3xl text-gray-400 mb-3"></i>
                      <p className="text-gray-600">Aún no has publicado ningún artículo.</p>
                      <Link 
                        to="/write" 
                        className="mt-4 inline-block bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition-colors"
                      >
                        Crear tu primer artículo
                      </Link>
                    </div>
                  )}

                  {articlesStatus === "success" && allPosts.length > 0 && (
                    <InfiniteScroll
                      dataLength={allPosts.length}
                      next={fetchNextArticlesPage}
                      hasMore={hasNextArticlesPage}
                      loader={
                        <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                        </div>
                      }
                      endMessage={
                        <div className="text-center py-4 text-gray-500">
                          <p>Has llegado al final de tus artículos</p>
                        </div>
                      }
                    >
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Artículo
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoría
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {allPosts.map((post) => (
                              <tr key={post._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {post.img && (
                                      <div className="flex-shrink-0 h-10 w-10 mr-4">
                                        <Image
                                          src={post.img}
                                          className="h-10 w-10 rounded-md object-cover"
                                          w="40"
                                          h="40"
                                          alt={post.title}
                                        />
                                      </div>
                                    )}
                                    <div className="ml-0">
                                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                        {post.title}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{formatDate(post.createdAt)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {post.category || "General"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <Link 
                                      to={`/post/${post.slug}`} 
                                      className="text-blue-600 hover:text-blue-900"
                                      title="Ver artículo"
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Link>
                                    <Link 
                                      to={`/edit/${post._id}`} 
                                      className="text-indigo-600 hover:text-indigo-900"
                                      title="Editar artículo"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Link>
                                    <button 
                                      onClick={() => handleDeleteClick(post)}
                                      className="text-red-600 hover:text-red-900"
                                      title="Eliminar artículo"
                                    >
                                      <i className="fas fa-trash-alt"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </InfiniteScroll>
                  )}
                </div>
              </>
            )}

              {/* Contenido de la pestaña de Todos los Artículos (solo para administradores) */}
              {activeTab === "allArticles" && (
              <>
                {/* Estadísticas */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de Todos los Artículos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-3xl font-bold text-blue-800">{totalAllPosts}</div>
                      <div className="text-sm text-gray-600">Total de Artículos</div>
                    </div>
                  </div>
                </div>

                {/* Lista de todos los artículos */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Todos los Artículos Publicados</h2>

                  {allArticlesStatus === "loading" && (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                    </div>
                  )}

                  {allArticlesStatus === "error" && (
                    <div className="text-center py-10 text-red-500">
                      <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                      <p>Algo salió mal al cargar los artículos. Por favor, intenta de nuevo más tarde.</p>
                      <p className="text-sm mt-2">{allArticlesError.message}</p>
                    </div>
                  )}

                  {allArticlesStatus === "success" && allUserPosts.length === 0 && (
                    <div className="text-center py-10">
                      <i className="fas fa-file-alt text-3xl text-gray-400 mb-3"></i>
                      <p className="text-gray-600">No hay artículos publicados en el sistema.</p>
                    </div>
                  )}

                  {allArticlesStatus === "success" && allUserPosts.length > 0 && (
                    <InfiniteScroll
                      dataLength={allUserPosts.length}
                      next={fetchNextAllArticlesPage}
                      hasMore={hasNextAllArticlesPage}
                      loader={
                        <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                        </div>
                      }
                      endMessage={
                        <div className="text-center py-4 text-gray-500">
                          <p>Has llegado al final de los artículos</p>
                        </div>
                      }
                    >
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Artículo
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Autor
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoría
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {allUserPosts.map((post) => (
                              <tr key={post._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {post.img && (
                                      <div className="flex-shrink-0 h-10 w-10 mr-4">
                                        <Image
                                          src={post.img}
                                          className="h-10 w-10 rounded-md object-cover"
                                          w="40"
                                          h="40"
                                          alt={post.title}
                                        />
                                      </div>
                                    )}
                                    <div className="ml-0">
                                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                        {post.title}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{post.user?.username || 'Usuario desconocido'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {new Date(post.createdAt).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {post.category ? (
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${post.category.color}`}>
                                      <i className={`${post.category.icon} mr-1`}></i>
                                      {post.category.name}
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                      Sin categoría
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <Link 
                                      to={`/post/${post.slug}`} 
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Link>
                                    <Link 
                                      to={`/edit-admin/${post._id}`} 
                                      className="text-indigo-600 hover:text-indigo-900"
                                      title="Editar artículo"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Link>
                                    <button
                                      onClick={() => handleDeleteClick(post)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </InfiniteScroll>
                  )}
                </div>
              </>
            )}

            {/* Contenido de la pestaña de Formularios de Contacto */}
            {activeTab === "forms" && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Formularios de Contacto</h2>
                
                {/* Filtros de estado */}
                <div className="mb-6">
                  <label className="mr-2">Filtrar por estado:</label>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border rounded p-2"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendientes</option>
                    <option value="reviewed">Revisados</option>
                    <option value="contacted">Contactados</option>
                  </select>
                </div>

                {formsStatus === "loading" ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : formsStatus === "error" ? (
                  <div className="text-center py-10 text-red-500">
                    <p>Error al cargar los formularios: {formsError.message}</p>
                  </div>
                ) : allForms.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>No hay formularios de contacto disponibles.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-3 px-4 text-left">Fecha</th>
                          <th className="py-3 px-4 text-left">Padre/Madre</th>
                          <th className="py-3 px-4 text-left">Niño/a</th>
                          <th className="py-3 px-4 text-left">Contacto</th>
                          <th className="py-3 px-4 text-left">Motivo</th>
                          <th className="py-3 px-4 text-left">Estado</th>
                          <th className="py-3 px-4 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allForms.map((form) => (
                          <tr key={form._id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4">{formatDate(form.createdAt)}</td>
                            <td className="py-3 px-4">{form.parentName} {form.parentSurname}</td>
                            <td className="py-3 px-4">
                              {form.childName}<br />
                              <span className="text-sm text-gray-500">
                                {form.childAge} años - {form.childGender}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {form.contactEmail}<br />
                              <span className="text-sm text-gray-500">{form.contactPhone}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="max-w-xs truncate">{form.consultationReason}</div>
                            </td>
                            <td className="py-3 px-4">
                              <select 
                                value={form.status} 
                                onChange={(e) => handleStatusChange(form._id, e.target.value)}
                                className="border rounded p-1 text-sm w-full"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="reviewed">Revisado</option>
                                <option value="contacted">Contactado</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => handleDeleteForm(form._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {hasNextFormsPage && (
                      <div className="text-center mt-6">
                        <button
                          onClick={() => fetchNextFormsPage()}
                          disabled={isFormsFetchingNextPage}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300"
                        >
                          {isFormsFetchingNextPage ? "Cargando más..." : "Cargar más"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

                        {/* Contenido de la pestaña de Categorías */}
                        {activeTab === "categories" && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Gestión de Categorías</h2>
                
                {/* Formulario para crear nueva categoría */}
                <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Crear Nueva Categoría</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Categoría</label>
                      <input 
                        type="text" 
                        value={newCategory.name} 
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Nutrición Infantil"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                      <div className="grid grid-cols-4 gap-2">
                        {iconOptions.map((icon, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setNewCategory({...newCategory, icon})}
                            className={`p-3 rounded-md flex items-center justify-center ${newCategory.icon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                          >
                            <i className={icon}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                      <div className="grid grid-cols-4 gap-2">
                        {colorOptions.map((color, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setNewCategory({...newCategory, color: color.bg, hoverColor: color.hover})}
                            className={`p-3 rounded-md flex items-center justify-center ${color.bg} text-white ${newCategory.color === color.bg ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                          >
                            {color.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleCreateCategory}
                      className="inline-flex items-center bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Crear Categoría
                    </button>
                  </div>
                </div>
                
                {/* Lista de categorías existentes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Categorías Existentes</h3>
                  
                  {categoriesStatus === "loading" ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : categoriesStatus === "error" ? (
                    <div className="text-center py-10 text-red-500">
                      <p>Error al cargar las categorías: {categoriesError.message}</p>
                    </div>
                  ) : categoriesData?.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <p>No hay categorías disponibles.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Categoría
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Icono
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Color
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {categoriesData && categoriesData.length > 0 ? (
                            categoriesData.map((category) => (
                              <tr key={category._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <i className={`${category.icon} text-lg`}></i>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${category.color}`}>
                                    Ejemplo
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button 
                                    onClick={() => handleDeleteCategory(category._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                No hay categorías disponibles
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar el artículo "{postToDelete?.title}"? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer con fondo extendido a los lados */}
        <div className="-mx-4 md:-mx-8 lg:-mx-16 xl:-mx-32 2xl:-mx-64 mt-auto">
          <Footer />
        </div>
      </div>
    </HelmetProvider>
  );
};

export default UserArticlesPage;
