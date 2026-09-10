import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  cancelBooking,
  createBooking,
  getDriverBookings,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const router = Router();

router.post("/", auth, createBooking);
router.get("/mine", auth, getMyBookings);
router.get("/driver", auth, getDriverBookings);
router.patch("/:id/status", auth, updateBookingStatus);
router.patch("/:id/cancel", auth, cancelBooking);

export default router;
