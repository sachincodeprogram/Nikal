import { Router } from "express";
import {
  banUser,
  listBookings,
  listPayouts,
  listReports,
  listRides,
  listUsers,
  markPayoutPaid,
  resolveReport,
  verifyUser,
} from "../controllers/adminController.js";
import { adminOnly, auth } from "../middleware/auth.js";

const router = Router();

router.use(auth, adminOnly);

router.get("/users", listUsers);
router.patch("/users/:id/verify", verifyUser);
router.patch("/users/:id/ban", banUser);

router.get("/rides", listRides);
router.get("/bookings", listBookings);

router.get("/reports", listReports);
router.patch("/reports/:id/resolve", resolveReport);

router.get("/payouts", listPayouts);
router.patch("/payouts/:id/mark-paid", markPayoutPaid);

export default router;
