import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO, {
            serverSelectionTimeoutMS: 10000, // Timeout de 10s para selección de servidor
            socketTimeoutMS: 45000, // Timeout de 45s para operaciones
        });
        console.log("MongoDB is connected");
        
        // Manejar eventos de conexión
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected, attempting to reconnect...');
        });
        
        mongoose.connection.on('error', (err) => {
            console.log('MongoDB connection error:', err);
        });
        
    } catch (err) {
        console.log(err);
    }
}

export default connectDB;