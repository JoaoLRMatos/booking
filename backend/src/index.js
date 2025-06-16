import express from "express";
import calendarRouter from "./routes/calendarRoutes.js";
import { loadTokenIfExists } from "./services/tokenService.js";
import { connectDB } from "./db/database.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/", calendarRouter);
app.use("/", authRoutes);

const startServer = async () => {
  await connectDB();
  await loadTokenIfExists();
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
};

startServer();
