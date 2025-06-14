import express from "express";
import calendarRouter from "./routes/calendarRoutes.js";
import { loadTokenIfExists } from "./services/tokenService.js";
import { connectDB } from "./db/database.js";
const app = express();
const PORT = 3000;
app.use(express.json());
app.use("/", calendarRouter);

const startServer = async () => {
  await connectDB();
  await loadTokenIfExists();
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
};

startServer();
