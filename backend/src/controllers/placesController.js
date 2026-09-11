import { autocompletePlaces, getPlaceDetails } from "../services/places.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchPlaces = asyncHandler(async (req, res) => {
  const input = req.query.input?.trim();
  if (!input || input.length < 3) {
    return res.json([]);
  }
  const predictions = await autocompletePlaces(input);
  res.json(predictions);
});

export const getPlace = asyncHandler(async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) {
    return res.status(400).json({ message: "placeId is required" });
  }
  const place = await getPlaceDetails(placeId);
  res.json(place);
});
