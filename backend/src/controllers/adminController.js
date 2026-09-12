import Booking from "../models/Booking.js";
import Payout from "../models/Payout.js";
import Report from "../models/Report.js";
import Ride from "../models/Ride.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginate, paginationParams } from "../utils/pagination.js";

export const listUsers = asyncHandler(async (req, res) => {
  const { q, kycStatus } = req.query;
  const filter = {
    ...(q ? { $or: [{ name: new RegExp(q, "i") }, { phone: new RegExp(q, "i") }] } : {}),
    ...(kycStatus ? { "kyc.status": kycStatus } : {}),
  };
  const result = await paginate(User, filter, paginationParams(req));
  res.json(result);
});

export const verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, "kyc.status": "verified" },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export const rejectUserKyc = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: false, "kyc.status": "rejected", "kyc.rejectionReason": reason || "Documents unclear" },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export const verifyVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
  res.json(vehicle);
});

export const banUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { banned: true }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export const listRides = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const result = await paginate(Ride, filter, {
    ...paginationParams(req),
    populate: [
      { path: "driverId", select: "name phone" },
      { path: "vehicleId", select: "type make model plateNo" },
    ],
  });
  res.json(result);
});

export const listBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const result = await paginate(Booking, filter, {
    ...paginationParams(req),
    populate: [
      { path: "rideId", select: "from to departureAt status" },
      { path: "passengerId", select: "name phone" },
      { path: "driverId", select: "name phone" },
    ],
  });
  res.json(result);
});

export const listReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const result = await paginate(Report, filter, {
    ...paginationParams(req),
    populate: [
      { path: "reporterId", select: "name phone" },
      { path: "reportedId", select: "name phone" },
    ],
  });
  res.json(result);
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: "resolved" },
    { new: true }
  );
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json(report);
});

export const listPayouts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const result = await paginate(Payout, filter, {
    ...paginationParams(req),
    populate: [{ path: "driverId", select: "name phone" }],
  });
  res.json(result);
});

export const markPayoutPaid = asyncHandler(async (req, res) => {
  const payout = await Payout.findByIdAndUpdate(req.params.id, { status: "paid" }, { new: true });
  if (!payout) return res.status(404).json({ message: "Payout not found" });
  res.json(payout);
});
