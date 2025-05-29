import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Footer from "../components/Footer";

// Función para obtener los formularios de contacto
const fetchContactForms = async (pageParam, token) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/contact-forms`, {
    params: { page: pageParam, limit: 10 },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};

const ContactFormsPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Obtener los formularios de contacto
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['contactForms', selectedStatus],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getToken();
      return fetchContactForms(pageParam, token);
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: isLoaded && isSignedIn,
  });

  // Mutación para eliminar un formulario
  const deleteMutation = useMutation({
    mutationFn: async (formId) => {
      const token = await getToken();
      return axios.delete(`${import.meta.env.VITE_API_URL}/contact-forms/${formId}`, {
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
      const token = await getToken();
      return axios.patch(`${import.meta.env.VITE_API_URL}/contact-forms/${formId}/status`, 
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

  // Manejar la eliminación de un formulario
  const handleDelete = (formId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este formulario?")) {
      deleteMutation.mutate(formId);
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

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div className="flex flex-col min-h-screen">
        <Helmet>
          <title>Administración de Formularios de Contacto | Blog</title>
        </Helmet>

        <div className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Administración de Formularios de Contacto</h1>
          
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

          {status === "loading" ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : status === "error" ? (
            <div className="text-center py-10 text-red-500">
              <p>Error al cargar los formularios: {error.message}</p>
            </div>
          ) : data?.pages?.[0]?.forms?.length === 0 ? (
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
                  {data?.pages?.map((page) =>
                    page?.forms?.map((form) => (
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
                            onClick={() => handleDelete(form._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {hasNextPage && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300"
                  >
                    {isFetchingNextPage ? "Cargando más..." : "Cargar más"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="-mx-4 md:-mx-8 lg:-mx-16 xl:-mx-32 2xl:-mx-64 mt-auto">
          <Footer />
        </div>
      </div>
    </HelmetProvider>
  );
};

export default ContactFormsPage;