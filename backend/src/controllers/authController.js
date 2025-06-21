import { oauth2Client } from "../config/googleClient.js";
import { saveCredentials } from "../services/tokenService.js";

export function authRedirect(req, res) {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
  res.redirect(url);
}

export async function handleRedirect(req, res) {
  const { code } = req.query;
  try {
    if (!code) {
      return res.status(400).send("Código de autorização não encontrado.");
    }
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await saveCredentials(tokens);
    res.send("Login bem-sucedido! Pode fechar essa aba.");
  } catch (error) {
    console.error("Erro ao obter token:", error.message);
    res.status(500).send("Erro na autenticação.");
  }
}
