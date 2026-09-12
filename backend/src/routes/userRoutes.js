import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  blockUser,
  confirmDigilockerKyc,
  getMe,
  startDigilockerKyc,
  submitKyc,
  unblockUser,
  updateMe,
} from "../controllers/userController.js";

const router = Router();

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);
router.post("/me/kyc", auth, submitKyc);
router.post("/me/kyc/digilocker/start", auth, startDigilockerKyc);
router.post("/me/kyc/digilocker/confirm", auth, confirmDigilockerKyc);
router.post("/:id/block", auth, blockUser);
router.post("/:id/unblock", auth, unblockUser);

export default router;
