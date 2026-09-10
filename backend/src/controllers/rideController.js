import Booking from "../models/Booking.js";
import Ride from "../models/Ride.js";
import Vehicle from "../models/Vehicle.js";
import { fetchRoute } from "../services/directions.js";
import { refundPayment } from "../services/payments.js";
import { matchRide, sampleWaypoints } from "../services/rideMatching.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUS_TRANSITIONS = ["started", "completed", "cancelled"];

function toGeoPlace({ name, lat, lng }) {
  return { name, loc: { type: "Point", coordinates: [lng, lat] } };
}

// Falls back to a straight from→to line when GOOGLE_MAPS_API_KEY isn't set,
// so ride creation still works in dev without that key configured. Any
// other Directions API failure (bad key, quota, network) still throws.
async function resolveRoute(from, to) {
  try {
    return await fetchRoute({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng });
  } catch (err) {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.warn("GOOGLE_MAPS_API_KEY not set — using a straight-line route fallback");
      return { polyline: null, points: [[from.lat, from.lng], [to.lat, to.lng]] };
    }
    throw err;
  }
}

export const createRide = asyncHandler(async (req, res) => {
  const { from, to, departureAt, seatsTotal, pricePerSeat, approval, prefs, vehicleId } = req.body;

  if (!from?.name || from?.lat == null || from?.lng == null) {
    return res.status(400).json({ message: "from.name, from.lat and from.lng are required" });
  }
  if (!to?.name || to?.lat == null || to?.lng == null) {
    return res.status(400).json({ message: "to.name, to.lat and to.lng are required" });
  }
  if (!departureAt || !seatsTotal || !pricePerSeat || !vehicleId) {
    return res
      .status(400)
      .json({ message: "departureAt, seatsTotal, pricePerSeat and vehicleId are required" });
  }

  const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user._id });
  if (!vehicle) return res.status(400).json({ message: "Vehicle not found for this user" });

  const route = await resolveRoute(from, to);
  const waypoints = sampleWaypoints(route.points, 2).map(([lat, lng]) => ({
    loc: { type: "Point", coordinates: [lng, lat] },
  }));

  const ride = await Ride.create({
    driverId: req.user._id,
    vehicleId,
    from: toGeoPlace(from),
    to: toGeoPlace(to),
    routePolyline: route.polyline,
    waypoints,
    departureAt,
    seatsTotal,
    seatsLeft: seatsTotal,
    pricePerSeat,
    approval: approval || "auto",
    prefs,
  });

  res.status(201).json(ride);
});

export const searchRides = asyncHandler(async (req, res) => {
  const { fromLat, fromLng, toLat, toLng, date } = req.query;

  if (!fromLat || !fromLng || !toLat || !toLng || !date) {
    return res
      .status(400)
      .json({ message: "fromLat, fromLng, toLat, toLng and date are all required" });
  }
  if (!DATE_RE.test(date)) {
    return res.status(400).json({ message: "date must be in YYYY-MM-DD format" });
  }

  const pickup = { lat: Number(fromLat), lng: Number(fromLng) };
  const drop = { lat: Number(toLat), lng: Number(toLng) };
  if ([pickup.lat, pickup.lng, drop.lat, drop.lng].some(Number.isNaN)) {
    return res.status(400).json({ message: "fromLat/fromLng/toLat/toLng must be numbers" });
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const candidates = await Ride.find({
    status: "active",
    seatsLeft: { $gt: 0 },
    departureAt: { $gte: dayStart, $lte: dayEnd },
  })
    .populate("driverId", "name avgRating ratingCount blocked")
    .populate("vehicleId", "type make model")
    .lean();

  const myId = req.user?._id?.toString();
  const myBlocked = new Set((req.user?.blocked ?? []).map(String));

  const results = candidates
    .map((ride) => {
      const match = matchRide(ride, pickup, drop);
      return match && { ...ride, ...match };
    })
    .filter(Boolean)
    .filter((ride) => {
      if (!myId) return true;
      const driver = ride.driverId;
      if (!driver) return true;
      if (myBlocked.has(driver._id.toString())) return false;
      if ((driver.blocked ?? []).some((id) => id.toString() === myId)) return false;
      return true;
    })
    .map((ride) => {
      // driverId.blocked is only needed for the filter above — never expose
      // one driver's block list to whoever is searching.
      if (ride.driverId) delete ride.driverId.blocked;
      return ride;
    })
    .sort((a, b) => new Date(a.departureAt) - new Date(b.departureAt));

  res.json(results);
});

// A driver's own published rides, each with its bookings attached — powers
// the "My Published Rides" screen (pending-request approve/reject + cancel).
export const getMyRides = asyncHandler(async (req, res) => {
  const rides = await Ride.find({ driverId: req.user._id })
    .sort({ departureAt: -1 })
    .populate("vehicleId", "type make model")
    .lean();

  const rideIds = rides.map((r) => r._id);
  const bookings = await Booking.find({ rideId: { $in: rideIds } })
    .populate("passengerId", "name photo avgRating ratingCount")
    .lean();

  const bookingsByRide = new Map();
  for (const booking of bookings) {
    const key = booking.rideId.toString();
    if (!bookingsByRide.has(key)) bookingsByRide.set(key, []);
    bookingsByRide.get(key).push(booking);
  }

  res.json(rides.map((ride) => ({ ...ride, bookings: bookingsByRide.get(ride._id.toString()) || [] })));
});

export const getRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id)
    .populate("driverId", "name photo avgRating ratingCount")
    .populate("vehicleId");
  if (!ride) return res.status(404).json({ message: "Ride not found" });
  res.json(ride);
});

export const updateRideStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUS_TRANSITIONS.includes(status)) {
    return res.status(400).json({ message: `status must be one of ${STATUS_TRANSITIONS.join(", ")}` });
  }

  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ message: "Ride not found" });
  if (ride.driverId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only the driver can update this ride's status" });
  }
  if (["completed", "cancelled"].includes(ride.status)) {
    return res.status(400).json({ message: `Ride is already ${ride.status}` });
  }

  ride.status = status;
  await ride.save();

  if (status === "cancelled") {
    const bookings = await Booking.find({ rideId: ride._id, status: "confirmed" });
    for (const booking of bookings) {
      booking.status = "cancelled";
      await booking.save();
      await refundPayment(booking.paymentId);
    }
  } else if (status === "completed") {
    await Booking.updateMany({ rideId: ride._id, status: "confirmed" }, { status: "completed" });
  }

  res.json(ride);
});
