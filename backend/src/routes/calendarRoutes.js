import { Router } from "express";
import {
  listCalendars,
  listEvents,
  getAvailability,
  bookAppointment,
} from "../controllers/calendarController.js";
const router = Router();

router.get("/calendars", listCalendars);
router.get("/events", listEvents);
router.get("/availability", getAvailability);
router.post("/book-appointment", bookAppointment);

export default router;
