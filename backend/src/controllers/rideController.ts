import { Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { distanceKm } from "../utils/geo";

const router = Router();

const publishSchema = z.object({
  vehicleId: z.string().min(1),
  fromLabel: z.string().min(1),
  fromLat: z.number(),
  fromLng: z.number(),
  toLabel: z.string().min(1),
  toLat: z.number(),
  toLng: z.number(),
  departureAt: z.string().datetime(),
  totalSeats: z.number().int().min(1).max(8),
  pricePerSeat: z.number().positive(),
  autoApprove: z.boolean().optional(),
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const data = publishSchema.parse(req.body);
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });
    if (!vehicle || vehicle.ownerId !== req.userId) {
      throw new ApiError(404, "Vehicle not found");
    }
    if (data.totalSeats > vehicle.seatCount) {
      throw new ApiError(400, "totalSeats exceeds vehicle seat capacity");
    }

    const ride = await prisma.ride.create({
      data: {
        driverId: req.userId as string,
        vehicleId: vehicle.id,
        vehicleType: vehicle.type,
        fromLabel: data.fromLabel,
        fromLat: data.fromLat,
        fromLng: data.fromLng,
        toLabel: data.toLabel,
        toLat: data.toLat,
        toLng: data.toLng,
        departureAt: new Date(data.departureAt),
        totalSeats: data.totalSeats,
        availableSeats: data.totalSeats,
        pricePerSeat: data.pricePerSeat,
        autoApprove: data.autoApprove ?? true,
      },
    });
    res.status(201).json({ ride });
  })
);

// Search rides near a from/to point, on a given date, optionally filtered by
// vehicle type (CAR/BIKE). Matches rides whose start/end are within
// `radiusKm` of the requested points — a simple stand-in for real route
// matching (upgrade path: PostGIS + polyline detour matching).
const searchSchema = z.object({
  fromLat: z.coerce.number(),
  fromLng: z.coerce.number(),
  toLat: z.coerce.number(),
  toLng: z.coerce.number(),
  date: z.string(), // YYYY-MM-DD
  vehicleType: z.enum(["CAR", "BIKE"]).optional(),
  radiusKm: z.coerce.number().default(15),
  seats: z.coerce.number().int().min(1).default(1),
});

router.get(
  "/search",
  asyncHandler(async (req, res: Response) => {
    const q = searchSchema.parse(req.query);
    const dayStart = new Date(`${q.date}T00:00:00.000Z`);
    const dayEnd = new Date(`${q.date}T23:59:59.999Z`);

    const candidates = await prisma.ride.findMany({
      where: {
        status: "ACTIVE",
        departureAt: { gte: dayStart, lte: dayEnd },
        availableSeats: { gte: q.seats },
        ...(q.vehicleType ? { vehicleType: q.vehicleType } : {}),
      },
      include: { driver: true, vehicle: true },
      orderBy: { departureAt: "asc" },
    });

    const rides = candidates.filter((ride) => {
      const startOk =
        distanceKm(q.fromLat, q.fromLng, ride.fromLat, ride.fromLng) <=
        q.radiusKm;
      const endOk =
        distanceKm(q.toLat, q.toLng, ride.toLat, ride.toLng) <= q.radiusKm;
      return startOk && endOk;
    });

    res.json({ rides });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res: Response) => {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id },
      include: { driver: true, vehicle: true, bookings: true },
    });
    if (!ride) throw new ApiError(404, "Ride not found");
    res.json({ ride });
  })
);

router.get(
  "/mine/published",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const rides = await prisma.ride.findMany({
      where: { driverId: req.userId },
      include: { bookings: true, vehicle: true },
      orderBy: { departureAt: "desc" },
    });
    res.json({ rides });
  })
);

router.post(
  "/:id/cancel",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const ride = await prisma.ride.findUnique({ where: { id: req.params.id } });
    if (!ride || ride.driverId !== req.userId) {
      throw new ApiError(404, "Ride not found");
    }
    await prisma.$transaction([
      prisma.ride.update({
        where: { id: ride.id },
        data: { status: "CANCELLED" },
      }),
      prisma.booking.updateMany({
        where: { rideId: ride.id, status: { in: ["PENDING", "CONFIRMED"] } },
        data: { status: "CANCELLED" },
      }),
    ]);
    res.status(204).send();
  })
);

export default router;
