import express from "express";
import {
  authRedirect,
  handleRedirect,
  listCalendars,
  listEvents,
  availabilty,
  bookAppointment,
} from "../controllers/calendarController.js";
const app = express();
app.use(express.json());
const router = express.Router();

router.get("/", authRedirect);
router.get("/redirect", handleRedirect);
router.get("/calendars", listCalendars);
router.get("/events", listEvents);
router.get("/availability", availabilty);
router.post("/book-appointment", bookAppointment);

export default router;
