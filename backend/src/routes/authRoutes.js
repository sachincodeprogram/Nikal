import { Router } from "express";
import { firebaseLogin } from "../controllers/authController.js";

const router = Router();

router.post("/firebase", firebaseLogin);

export default router;
