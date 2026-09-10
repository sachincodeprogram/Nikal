import { Router } from "express";
import { createRating } from "../controllers/ratingController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/", auth, createRating);

export default router;
