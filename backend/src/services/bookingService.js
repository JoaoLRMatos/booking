// src/services/bookingService.js
import Booking from "../db/models/Booking.js";

export async function createBooking(data) {
  const booking = new Booking({
    googleEventId: data.eventId,
    guestName: data.guestName,
    attendeeEmail: data.attendeeEmail,
    phoneNumber: data.phoneNumber,
    establishmentName: data.establishmentName,
    cnpj: data.cnpj,
    customSubject: data.customSubject,
  });

  await booking.save();
  console.log("Agendamento salvo no MongoDB:", booking._id);
  return booking;
}

export async function rollbackBookingIfExists(bookingId) {
  if (!bookingId) return;
  await Booking.findByIdAndDelete(bookingId);
  console.log(`ROLLBACK: Agendamento ${bookingId} removido do MongoDB.`);
}
