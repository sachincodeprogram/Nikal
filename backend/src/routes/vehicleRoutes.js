import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createVehicle, getMyVehicles } from "../controllers/vehicleController.js";

const router = Router();

router.post("/", auth, createVehicle);
router.get("/", auth, getMyVehicles);

export default router;
