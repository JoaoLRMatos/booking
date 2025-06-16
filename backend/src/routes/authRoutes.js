import { Router } from "express";
import { authRedirect, handleRedirect } from "../controllers/authController.js";

const router = Router();

router.get("/auth/google", authRedirect);
router.get("/auth/google/callback", handleRedirect);

export default router;
