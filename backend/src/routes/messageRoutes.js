import { Router } from "express";
import { getMessages } from "../controllers/messageController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/:bookingId", auth, getMessages);

export default router;
