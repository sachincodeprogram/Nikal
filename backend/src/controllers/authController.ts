import { Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { getFirebaseAuth } from "../config/firebase";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { Router } from "express";

const router = Router();

// Mobile app signs the user in with Firebase Phone Auth (OTP handled entirely
// on the client/Firebase side) and sends us the resulting ID token. We verify
// it server-side, then find-or-create the user and issue our own JWT.
const verifySchema = z.object({
  idToken: z.string().min(10),
  name: z.string().min(1).optional(),
});

router.post(
  "/verify",
  asyncHandler(async (req, res: Response) => {
    const { idToken, name } = verifySchema.parse(req.body);

    const decoded = await getFirebaseAuth()
      .verifyIdToken(idToken)
      .catch((err) => {
        throw new ApiError(
          401,
          err instanceof Error && err.message.includes("not configured")
            ? "Firebase phone auth is not set up yet on the server"
            : "Invalid Firebase ID token"
        );
      });

    const phone = decoded.phone_number;
    if (!phone) throw new ApiError(400, "Token has no phone number");

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          phoneVerified: true,
          name: name ?? "New User",
        },
      });
    } else if (!user.phoneVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    const signOptions: jwt.SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || "30d") as jwt.SignOptions["expiresIn"],
    };
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET as string, signOptions);

    res.json({ token, user });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { vehicles: true },
    });
    if (!user) throw new ApiError(404, "User not found");
    res.json({ user });
  })
);

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  photoUrl: z.string().url().optional(),
});

router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
    });
    res.json({ user });
  })
);

export default router;
