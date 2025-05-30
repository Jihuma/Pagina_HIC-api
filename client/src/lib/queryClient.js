import { QueryClient } from '@tanstack/react-query';

// Configuración global para React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Número de reintentos para consultas fallidas
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
      staleTime: 1000 * 60 * 10, // 10 minutos antes de considerar los datos obsoletos (aumentado)
      cacheTime: 1000 * 60 * 60, // 60 minutos de caché (aumentado)
      refetchOnWindowFocus: true, // Mantener la revalidación cuando la ventana recupera el foco
      refetchOnReconnect: true, // Revalidar datos cuando se recupera la conexión
      refetchOnMount: true, // Revalidar datos cuando el componente se monta
      // Configuración clave para mantener datos antiguos visibles durante la recarga
      keepPreviousData: true, // Mantener los datos anteriores mientras se cargan los nuevos
      // Manejador global de errores para marcar errores recientes
      onError: (error) => {
        console.error('Error en consulta:', error);
        // Marcar error reciente para que el focusManager lo maneje
        if (window.markQueryError) {
          window.markQueryError();
        }
      },
    },
    mutations: {
      retry: 2, // Número de reintentos para mutaciones fallidas
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Backoff exponencial
    },
  },
});

export default queryClient;