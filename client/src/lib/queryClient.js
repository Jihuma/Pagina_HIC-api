import { QueryClient } from '@tanstack/react-query';

// Configuración global para React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Número de reintentos para consultas fallidas
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
      staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar los datos obsoletos
      cacheTime: 1000 * 60 * 30, // 30 minutos de caché
      refetchOnWindowFocus: true, // Revalidar datos cuando la ventana recupera el foco
      refetchOnReconnect: true, // Revalidar datos cuando se recupera la conexión
      refetchOnMount: true, // Revalidar datos cuando el componente se monta
    },
    mutations: {
      retry: 2, // Número de reintentos para mutaciones fallidas
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Backoff exponencial
    },
  },
});

export default queryClient;