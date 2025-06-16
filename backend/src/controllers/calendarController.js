// Importa o nosso novo serviço
import * as googleCalendarService from "../services/googleCalendarService.js";

export async function listCalendars(req, res) {
  try {
    const calendars = await googleCalendarService.fetchCalendars();
    res.json(calendars);
  } catch (error) {
    console.error("Erro no controller ao buscar calendários:", error.message);
    res
      .status(401)
      .send('Não autenticado. Acesse <a href="/">/auth/google</a>');
  }
}

export async function listEvents(req, res) {
  try {
    const calendarId = req.query.calendar || "primary";
    const events = await googleCalendarService.fetchEvents(calendarId);
    res.json(events);
  } catch (error) {
    console.error("Erro no controller ao buscar eventos:", error.message);
    res
      .status(401)
      .send('Não autenticado. Acesse <a href="/">/auth/google</a>');
  }
}

export async function getAvailability(req, res) {
  try {
    const availableSlots = await googleCalendarService.fetchAvailability();
    res.json(availableSlots);
  } catch (error) {
    console.error("Erro no controller ao buscar horários:", error.message);
    res.status(500).send(error.message);
  }
}

export async function bookAppointment(req, res) {
  try {
    const bookingData = req.body;

    // Validação básica pode ficar no controller
    if (
      !bookingData.eventId ||
      !bookingData.guestName ||
      !bookingData.attendeeEmail
    ) {
      return res.status(400).json({
        error: "eventId, guestName e attendeeEmail são obrigatórios.",
      });
    }

    const result = await googleCalendarService.createBookingAndUpdateEvent(
      bookingData
    );

    res.status(200).json({
      message: "Agendamento confirmado com sucesso em ambos os sistemas!",
      ...result,
    });
  } catch (error) {
    console.error("Erro no controller ao agendar reunião:", error.message);
    res.status(500).json({
      error: "Ocorreu um erro interno no servidor ao tentar agendar a reunião",
      details: error.message,
    });
  }
}
