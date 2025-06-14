// database.js
import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("A variável de ambiente MONGODB_URI não está definida.");
    process.exit(1);
  }

  try {
    // Mongoose gerencia o pool de conexões internamente
    await mongoose.connect(uri);
    console.log("Conectado com sucesso ao MongoDB via Mongoose!");
  } catch (error) {
    console.error("Não foi possível conectar ao MongoDB", error);
    process.exit(1);
  }
};
