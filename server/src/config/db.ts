import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/minicrm';
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB conectado: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
