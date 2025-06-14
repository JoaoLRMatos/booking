// models/Booking.js
import mongoose from "mongoose";

// Este é o "molde" para cada agendamento que será salvo no banco
const bookingSchema = new mongoose.Schema({
  googleEventId: {
    type: String,
    required: true,
    unique: true,
  },
  guestName: {
    type: String,
    required: [true, "O nome do convidado é obrigatório."],
  },
  attendeeEmail: {
    type: String,
    required: [true, "O e-mail do convidado é obrigatório."],
  },
  phoneNumber: {
    type: String,
    required: [true, "Informe o telefone para confirmação da agenda"],
  },
  establishmentName: {
    type: String,
    required: false,
  },
  cnpj: {
    type: String,
    required: [true, "O CNPJ é obrigatório."],
  },
  customSubject: String,
  status: {
    type: String,
    default: "confirmed",
  },
  createdAt: {
    type: Date,
    default: Date.now, // Adiciona a data de criação automaticamente
  },
});

export default mongoose.model("Booking", bookingSchema);
