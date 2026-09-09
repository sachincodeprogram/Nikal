import { Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { AuthedRequest, requireAuth } from "../middleware/auth";

const router = Router();

const createSchema = z.object({
  rideId: z.string().min(1),
  seatsBooked: z.number().int().min(1).max(8).default(1),
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const data = createSchema.parse(req.body);

    const booking = await prisma.$transaction(async (tx) => {
      const ride = await tx.ride.findUnique({ where: { id: data.rideId } });
      if (!ride || ride.status !== "ACTIVE") {
        throw new ApiError(404, "Ride not available");
      }
      if (ride.driverId === req.userId) {
        throw new ApiError(400, "Driver cannot book their own ride");
      }
      if (ride.availableSeats < data.seatsBooked) {
        throw new ApiError(400, "Not enough seats available");
      }

      const status = ride.autoApprove ? "CONFIRMED" : "PENDING";

      const created = await tx.booking.create({
        data: {
          rideId: ride.id,
          passengerId: req.userId as string,
          seatsBooked: data.seatsBooked,
          status,
        },
      });

      if (status === "CONFIRMED") {
        await tx.ride.update({
          where: { id: ride.id },
          data: { availableSeats: ride.availableSeats - data.seatsBooked },
        });
      }

      return created;
    });

    res.status(201).json({ booking });
  })
);

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const bookings = await prisma.booking.findMany({
      where: { passengerId: req.userId },
      include: { ride: { include: { driver: true, vehicle: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ bookings });
  })
);

// Driver approves/rejects a PENDING booking (manual-approval rides).
const decisionSchema = z.object({
  decision: z.enum(["CONFIRMED", "REJECTED"]),
});

router.post(
  "/:id/decision",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { decision } = decisionSchema.parse(req.body);

    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: req.params.id },
        include: { ride: true },
      });
      if (!booking) throw new ApiError(404, "Booking not found");
      if (booking.ride.driverId !== req.userId) {
        throw new ApiError(403, "Not your ride");
      }
      if (booking.status !== "PENDING") {
        throw new ApiError(400, "Booking already decided");
      }
      if (
        decision === "CONFIRMED" &&
        booking.ride.availableSeats < booking.seatsBooked
      ) {
        throw new ApiError(400, "Not enough seats available");
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: decision },
      });

      if (decision === "CONFIRMED") {
        await tx.ride.update({
          where: { id: booking.rideId },
          data: {
            availableSeats: booking.ride.availableSeats - booking.seatsBooked,
          },
        });
      }
    });

    res.status(204).send();
  })
);

router.post(
  "/:id/cancel",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: req.params.id },
        include: { ride: true },
      });
      if (!booking || booking.passengerId !== req.userId) {
        throw new ApiError(404, "Booking not found");
      }
      if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
        throw new ApiError(400, "Booking cannot be cancelled");
      }

      const wasConfirmed = booking.status === "CONFIRMED";

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });

      if (wasConfirmed) {
        await tx.ride.update({
          where: { id: booking.rideId },
          data: {
            availableSeats: booking.ride.availableSeats + booking.seatsBooked,
          },
        });
      }
    });

    res.status(204).send();
  })
);

export default router;
