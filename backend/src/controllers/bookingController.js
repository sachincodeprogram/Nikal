import Booking from "../models/Booking.js";
import Ride from "../models/Ride.js";
import { refundPayment } from "../services/payments.js";
import { matchRide } from "../services/rideMatching.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const APPROVAL_STATUSES = ["confirmed", "rejected"];
const CLOSED_STATUSES = ["cancelled", "rejected", "completed"];

function toGeoStop({ name, lat, lng }) {
  return { name, loc: { type: "Point", coordinates: [lng, lat] } };
}

export const createBooking = asyncHandler(async (req, res) => {
  const { rideId, seats, pickup, drop } = req.body;

  if (!rideId || !seats || pickup?.lat == null || pickup?.lng == null || drop?.lat == null || drop?.lng == null) {
    return res
      .status(400)
      .json({ message: "rideId, seats, pickup {lat,lng} and drop {lat,lng} are required" });
  }
  if (seats < 1) return res.status(400).json({ message: "seats must be at least 1" });

  const ride = await Ride.findById(rideId);
  if (!ride) return res.status(404).json({ message: "Ride not found" });
  if (ride.driverId.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot book your own ride" });
  }
  if (ride.status !== "active") {
    return res.status(400).json({ message: `Ride is not open for booking (status: ${ride.status})` });
  }
  if (ride.seatsLeft < seats) {
    return res.status(400).json({ message: "Not enough seats left" });
  }

  const match = matchRide(ride, pickup, drop);
  if (!match) {
    return res.status(400).json({ message: "Pickup/drop is not on this ride's route" });
  }

  const autoConfirm = ride.approval === "auto";

  const booking = await Booking.create({
    rideId: ride._id,
    passengerId: req.user._id,
    driverId: ride.driverId,
    seats,
    pickup: toGeoStop(pickup),
    drop: toGeoStop(drop),
    amount: match.passengerFare * seats,
    status: autoConfirm ? "confirmed" : "pending",
  });

  if (autoConfirm) {
    ride.seatsLeft -= seats;
    if (ride.seatsLeft <= 0) ride.status = "full";
    await ride.save();
  }

  res.status(201).json(booking);
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ passengerId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("rideId", "from to departureAt status")
    .populate("driverId", "name photo avgRating ratingCount");
  res.json(bookings);
});

export const getDriverBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ driverId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("rideId", "from to departureAt status")
    .populate("passengerId", "name photo avgRating ratingCount");
  res.json(bookings);
});

// Driver approves/rejects a booking that needed manual approval.
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!APPROVAL_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of ${APPROVAL_STATUSES.join(", ")}` });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.driverId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only the driver can approve or reject this booking" });
  }
  if (booking.status !== "pending") {
    return res.status(400).json({ message: `Booking is already ${booking.status}` });
  }

  if (status === "confirmed") {
    const ride = await Ride.findById(booking.rideId);
    if (!ride || ride.seatsLeft < booking.seats) {
      return res.status(400).json({ message: "Not enough seats left to confirm this booking" });
    }
    ride.seatsLeft -= booking.seats;
    if (ride.seatsLeft <= 0) ride.status = "full";
    await ride.save();
  }

  booking.status = status;
  await booking.save();
  res.json(booking);
});

// Passenger or driver cancels a pending/confirmed booking. Confirmed
// bookings free their seat back up on the ride and trigger a refund.
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const isPassenger = booking.passengerId.toString() === req.user._id.toString();
  const isDriver = booking.driverId.toString() === req.user._id.toString();
  if (!isPassenger && !isDriver) {
    return res.status(403).json({ message: "Not authorized to cancel this booking" });
  }
  if (CLOSED_STATUSES.includes(booking.status)) {
    return res.status(400).json({ message: `Booking is already ${booking.status}` });
  }

  const wasConfirmed = booking.status === "confirmed";
  booking.status = "cancelled";
  await booking.save();

  if (wasConfirmed) {
    const ride = await Ride.findById(booking.rideId);
    if (ride) {
      ride.seatsLeft += booking.seats;
      if (ride.status === "full") ride.status = "active";
      await ride.save();
    }
    await refundPayment(booking.paymentId);
  }

  res.json(booking);
});
