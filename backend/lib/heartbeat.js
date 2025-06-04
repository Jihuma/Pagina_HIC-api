import mongoose from "mongoose";

// Función para mantener la conexión activa
const setupHeartbeat = () => {
    const interval = 4 * 60 * 1000; // 4 minutos
    
    setInterval(async () => {
        if (mongoose.connection.readyState === 1) { // 1 = conectado
            try {
                // Ejecutar una operación simple para mantener la conexión viva
                await mongoose.connection.db.admin().ping();
                console.log("Heartbeat: MongoDB connection active");
            } catch (error) {
                console.error("Heartbeat error:", error);
            }
        }
    }, interval);
};

export default setupHeartbeat;