import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-toastify';

const GlobalDataManager = () => {
  const queryClient = useQueryClient();
  const { getToken, isSignedIn } = useAuth();

  // Manejar cambios de visibilidad de la página
  useEffect(() => {
    let reconnectTimeout;
    let isReconnecting = false;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Página visible de nuevo, verificando conexión...');
        
        // Evitar múltiples reconexiones simultáneas
        if (isReconnecting) return;
        isReconnecting = true;
        
        try {
          // Verificar conexión a internet
          const online = navigator.onLine;
          if (!online) {
            console.log('Sin conexión a internet, esperando reconexión...');
            return;
          }
          
          // Si el usuario está autenticado, renovar el token
          if (isSignedIn) {
            try {
              const token = await getToken({ skipCache: true });
              localStorage.setItem('clerk-auth-token', token);
              console.log('Token renovado correctamente');
            } catch (error) {
              console.error('Error al renovar el token:', error);
            }
          }
          
          // Invalidar todas las consultas activas para forzar su revalidación
          console.log('Revalidando datos...');
          await queryClient.invalidateQueries();
          
        } catch (error) {
          console.error('Error durante la reconexión:', error);
        } finally {
          isReconnecting = false;
        }
      }
    };

    // Manejar eventos de conexión
    const handleOnline = () => {
      console.log('Conexión a internet restaurada');
      toast.success('Conexión restaurada');
      
      // Esperar un momento antes de revalidar para asegurar que la conexión es estable
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(async () => {
        if (!isReconnecting) {
          isReconnecting = true;
          try {
            await queryClient.invalidateQueries();
          } catch (error) {
            console.error('Error al revalidar datos después de reconexión:', error);
          } finally {
            isReconnecting = false;
          }
        }
      }, 2000);
    };

    const handleOffline = () => {
      console.log('Conexión a internet perdida');
      toast.error('Conexión a internet perdida. Intentando reconectar...');
    };

    // Registrar listeners para eventos de visibilidad y conexión
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(reconnectTimeout);
    };
  }, [queryClient, isSignedIn, getToken]);

  // Este componente no renderiza nada, solo maneja la lógica
  return null;
};

export default GlobalDataManager;