import Booking from "../models/Booking.js";
import Rating from "../models/Rating.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createRating = asyncHandler(async (req, res) => {
  const { bookingId, stars, comment } = req.body;

  if (!bookingId || !stars) {
    return res.status(400).json({ message: "bookingId and stars are required" });
  }
  if (stars < 1 || stars > 5) {
    return res.status(400).json({ message: "stars must be between 1 and 5" });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.status !== "completed") {
    return res.status(400).json({ message: "You can only rate a completed booking" });
  }

  const raterId = req.user._id.toString();
  let toUser;
  if (booking.passengerId.toString() === raterId) {
    toUser = booking.driverId;
  } else if (booking.driverId.toString() === raterId) {
    toUser = booking.passengerId;
  } else {
    return res.status(403).json({ message: "You weren't part of this booking" });
  }

  try {
    await Rating.create({ bookingId, fromUser: req.user._id, toUser, stars, comment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You've already rated this booking" });
    }
    throw err;
  }

  // Atomic pipeline update so concurrent ratings for the same user can't
  // race a read-then-write average calculation.
  await User.updateOne({ _id: toUser }, [
    {
      $set: {
        avgRating: {
          $round: [
            {
              $divide: [
                { $add: [{ $multiply: ["$avgRating", "$ratingCount"] }, stars] },
                { $add: ["$ratingCount", 1] },
              ],
            },
            2,
          ],
        },
        ratingCount: { $add: ["$ratingCount", 1] },
      },
    },
  ]);

  res.status(201).json({ ok: true });
});
