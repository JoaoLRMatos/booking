import fs from "fs/promises";
import path from "path";
import { oauth2Client } from "../config/googleClient.js";

const TOKEN_PATH = path.join(process.cwd(), "token.json");

export async function loadTokenIfExists() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const tokens = JSON.parse(content);
    oauth2Client.setCredentials(tokens);
    console.log("Token carregado com sucesso.");
  } catch {
    console.log("Token não encontrado");
  }
}

export async function saveCredentials(tokens) {
  if (tokens.refresh_token) {
    console.log("Salvando refresh_token.");
  }
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
  console.log("Token salvo.");
}
