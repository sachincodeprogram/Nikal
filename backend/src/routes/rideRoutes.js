import { Router } from "express";
import { auth, optionalAuth } from "../middleware/auth.js";
import { createRide, getMyRides, getRide, searchRides, updateRideStatus } from "../controllers/rideController.js";

const router = Router();

router.post("/", auth, createRide);
router.get("/search", optionalAuth, searchRides);
router.get("/mine", auth, getMyRides);
router.get("/:id", getRide);
router.patch("/:id/status", auth, updateRideStatus);

export default router;
