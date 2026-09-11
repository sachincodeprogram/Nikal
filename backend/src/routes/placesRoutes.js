import { Router } from "express";
import { getPlace, searchPlaces } from "../controllers/placesController.js";

const router = Router();

router.get("/autocomplete", searchPlaces);
router.get("/details", getPlace);

export default router;
