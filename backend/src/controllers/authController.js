import { getFirebaseAdmin } from "../config/firebase.js";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken is required" });

  const decoded = await getFirebaseAdmin().auth().verifyIdToken(idToken);
  const phone = decoded.phone_number;
  if (!phone) return res.status(400).json({ message: "Token has no phone number" });

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({
      phone,
      name: decoded.name || "New User",
      isVerified: true,
    });
  } else if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
  }

  const token = signToken(user);
  res.json({ token, user });
});
