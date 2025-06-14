import { google } from "googleapis";
import { oauth2Client } from "../config/googleClient.js";
import { saveCredentials } from "../services/tokenService.js";
import "dotenv/config";
import { connectDB } from "../db/database.js";
import Booking from "../db/models/Booking.js";

export function authRedirect(req, res) {
  const url = oauth2Client.generateAuthUrl({
    acess_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
  res.redirect(url);
}

// Utilizar o token
export async function handleRedirect(req, res) {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await saveCredentials(tokens);
    res.send("Login bem-sucedido! Pode fechar essa aba.");
  } catch (error) {
    console.error("Erro ao obter token:", error.message);
    res.status(500).send("Erro na autenticação.");
  }
}
// Mostra todas as agendas disponíveis
export async function listCalendars(req, res) {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  calendar.calendarList.list({}, (err, response) => {
    if (err) {
      console.error("Erro ao buscar calendários:", err.message);
      return res.status(401).send('Não autenticado. Acesse <a href="/">/</a>');
    }
    res.json(response.data.items);
  });
}

// Lista os eventos da agenda "Primary"
export async function listEvents(req, res) {
  const calendarId = req.query.calendar || "primary";
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  calendar.events.list(
    {
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 15,
      singleEvents: true,
      orderBy: "startTime",
    },
    (err, response) => {
      if (err) {
        console.error("Erro ao buscar eventos:", err.message);
        return res
          .status(401)
          .send('Não autenticado. Acesse <a href="/">/</a>');
      }
      res.json(response.data.items);
    }
  );
}

// Lisya os eventos da agenda mencionada no .env "CALENDAR_id"
export async function availabilty(req, res) {
  const calendarId = process.env.CALENDAR_ID;
  if (!calendarId) {
    return res
      .status(500)
      .send("O ID da agenda de disponibilidade não foi configurado!");
  }
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  calendar.events.list(
    {
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    },
    (err, response) => {
      if (err) {
        console.error("Erro ao buscar horários disponíveis:", err.message);
        return res.status(500).send("Erro ao buscar horários.");
      }
      const availableSlots = response.data.items;
      res.json(availableSlots);
    }
  );
}

// Agendar reunião (Atualizar o evento "Disponível")
export async function bookAppointment(req, res) {
  try {
    const {
      eventId,
      guestName,
      attendeeEmail,
      phoneNumber,
      establishmentName,
      cnpj,
      customSubject,
    } = req.body;
    if (!eventId || !guestName || !attendeeEmail || !cnpj) {
      return res.status(400).json({
        error:
          "Dados insuficientes para o agendamento. Verifique se eventId, guestName e attendeeEmail foram enviados.",
      });
    }
    const calendarId = process.env.CALENDAR_ID;
    const descriptionForEvent = `
Reservado por
${guestName}
${attendeeEmail}
${phoneNumber || "Não informado"}

Nome do Estabelecimento
${establishmentName || "Não informado"}

CNPJ
${cnpj}

Assunto
${customSubject || "Não informado"}

---
Agendado através do sistema de agendamento automático.
    `;
    if (!calendarId) {
      return res
        .status(500)
        .json({ error: "ID de agendamento não está correto ou preenchido!" });
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const meetingSummary = `OverView WIFIRE - ${
      establishmentName || guestName
    }`;

    const updateEvent = await calendar.events.patch({
      calendarId: calendarId,
      eventId: eventId,
      requestBody: {
        summary: meetingSummary,
        description: descriptionForEvent,
        status: "confirmed",
        colorId: "2",
        attendees: [
          { email: attendeeEmail },
          { email: "jojoaoluca02@gmail.com" },
        ],
        conferenceData: {
          createRequest: {
            requestId: `meet-${eventId}-${Date.now()}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
      conferenceDataVersion: 1,
    });
    res.status(200).json({
      message: "Agendamento confirmado com sucesso!",
      event: updateEvent.data,
    });
  } catch (error) {
    console.error("Erro ao agendar reunião:", error);
    res.status(500).json({
      error: "Ocorreu um erro interno no servidor ao tentar agendar a reunião",
    });
  }
}
