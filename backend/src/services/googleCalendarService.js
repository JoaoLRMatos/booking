import { google } from "googleapis";
import { oauth2Client } from "../config/googleClient.js";
import Booking from "../db/models/Booking.js";
import { buildEventDescription } from "../utils/formatDescription.js";
import "dotenv/config";

// Instância do cliente do Calendar
const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export async function fetchCalendars() {
  const response = await calendar.calendarList.list({});
  return response.data.items;
}

export async function fetchEvents(calendarId) {
  const response = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults: 15,
    singleEvents: true,
    orderBy: "startTime",
  });
  return response.data.items;
}

export async function fetchAvailability() {
  const calendarId = process.env.CALENDAR_ID;
  if (!calendarId) {
    throw new Error("O ID da agenda de disponibilidade não foi configurado!");
  }

  const response = await calendar.events.list({
    calendarId: calendarId,
    timeMin: new Date().toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: "startTime",
  });
  return response.data.items;
}

export async function createBookingAndUpdateEvent(bookingData) {
  const { eventId, establishmentName, guestName, attendeeEmail } = bookingData;
  const calendarId = process.env.CALENDAR_ID;

  if (!calendarId) {
    throw new Error(
      "ID da agenda de disponibilidade não está configurado no servidor!"
    );
  }

  // 1. Salvar no MongoDB primeiro
  const newBooking = new Booking({
    googleEventId: eventId,
    ...bookingData,
  });
  await newBooking.save();
  console.log("Agendamento salvo no MongoDB:", newBooking._id);

  try {
    // 2. Tentar atualizar o evento no Google Calendar
    const descriptionForEvent = buildEventDescription(
      bookingData,
      newBooking._id
    );
    const meetingSummary = `OverView WIFIRE - ${
      establishmentName || guestName
    }`;

    const updateEvent = await calendar.events.patch({
      calendarId: calendarId,
      eventId: eventId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: meetingSummary,
        description: descriptionForEvent,
        status: "confirmed",
        colorId: "2",
        attendees: [
          { email: attendeeEmail },
          { email: process.env.ORGANIZER_EMAIL }, // Use uma variável de ambiente para o email do organizador
        ],
        conferenceData: {
          createRequest: {
            requestId: `meet-${eventId}-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    // Se tudo deu certo, retorna os dados
    return {
      bookingId: newBooking._id,
      event: updateEvent.data,
    };
  } catch (error) {
    // 3. Se a API do Google falhar, faz o ROLLBACK no banco de dados.
    console.error("Erro ao atualizar evento no Google. Iniciando rollback...");
    await Booking.findByIdAndDelete(newBooking._id);
    console.log(`ROLLBACK: Agendamento ${newBooking._id} removido do MongoDB.`);

    // Lança o erro para que o controller possa capturá-lo
    throw new Error(
      `Erro ao atualizar o evento no Google Calendar: ${error.message}`
    );
  }
}
