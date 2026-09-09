import { Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { AuthedRequest, requireAuth } from "../middleware/auth";

const router = Router();

const vehicleSchema = z.object({
  type: z.enum(["CAR", "BIKE"]),
  make: z.string().min(1),
  model: z.string().min(1),
  color: z.string().min(1),
  plateNumber: z.string().min(1),
  seatCount: z.number().int().min(1).max(8),
  photoUrl: z.string().url().optional(),
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const data = vehicleSchema.parse(req.body);
    const vehicle = await prisma.vehicle.create({
      data: { ...data, ownerId: req.userId as string },
    });
    res.status(201).json({ vehicle });
  })
);

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const vehicles = await prisma.vehicle.findMany({
      where: { ownerId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ vehicles });
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
    });
    if (!vehicle || vehicle.ownerId !== req.userId) {
      throw new ApiError(404, "Vehicle not found");
    }
    await prisma.vehicle.delete({ where: { id: vehicle.id } });
    res.status(204).send();
  })
);

export default router;
