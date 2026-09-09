import { Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { AuthedRequest, requireAuth } from "../middleware/auth";

const router = Router();

const createSchema = z.object({
  bookingId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const data = createSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { ride: true },
    });
    if (!booking) throw new ApiError(404, "Booking not found");
    if (booking.status !== "COMPLETED" && booking.ride.status !== "COMPLETED") {
      throw new ApiError(400, "Can only rate after the trip is completed");
    }

    const isPassenger = booking.passengerId === req.userId;
    const isDriver = booking.ride.driverId === req.userId;
    if (!isPassenger && !isDriver) throw new ApiError(403, "Not part of this trip");

    const rateeId = isPassenger ? booking.ride.driverId : booking.passengerId;

    const rating = await prisma.$transaction(async (tx) => {
      const created = await tx.rating.create({
        data: {
          bookingId: booking.id,
          raterId: req.userId as string,
          rateeId,
          score: data.score,
          comment: data.comment,
        },
      });

      const agg = await tx.rating.aggregate({
        where: { rateeId },
        _avg: { score: true },
        _count: true,
      });

      await tx.user.update({
        where: { id: rateeId },
        data: {
          ratingAvg: agg._avg.score ?? data.score,
          ratingCount: agg._count,
        },
      });

      return created;
    });

    res.status(201).json({ rating });
  })
);

router.get(
  "/user/:userId",
  asyncHandler(async (req, res: Response) => {
    const ratings = await prisma.rating.findMany({
      where: { rateeId: req.params.userId },
      include: { rater: { select: { id: true, name: true, photoUrl: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ ratings });
  })
);

export default router;
