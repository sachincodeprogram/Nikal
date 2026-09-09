import Vehicle from "../models/Vehicle.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createVehicle = asyncHandler(async (req, res) => {
  const { make, model, color, plateNo, seats, photo } = req.body;
  const vehicle = await Vehicle.create({
    userId: req.user._id,
    make,
    model,
    color,
    plateNo,
    seats,
    photo,
  });
  res.status(201).json(vehicle);
});

export const getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(vehicles);
});
