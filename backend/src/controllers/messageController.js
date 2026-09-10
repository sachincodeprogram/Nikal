import Booking from "../models/Booking.js";
import Message from "../models/Message.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMessages = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const userId = req.user._id.toString();
  if (booking.passengerId.toString() !== userId && booking.driverId.toString() !== userId) {
    return res.status(403).json({ message: "You weren't part of this booking" });
  }

  const messages = await Message.find({ bookingId }).sort({ createdAt: 1 }).lean();
  res.json(messages);
});
