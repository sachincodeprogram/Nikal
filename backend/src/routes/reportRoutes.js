import { Router } from "express";
import { createReport } from "../controllers/reportController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/", auth, createReport);

export default router;
