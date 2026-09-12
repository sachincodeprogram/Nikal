import { getFirebaseAdmin } from "../config/firebase.js";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken is required" });

  const decoded = await getFirebaseAdmin().auth().verifyIdToken(idToken);
  const phone = decoded.phone_number;
  const email = decoded.email;
  if (!phone && !email) {
    return res.status(400).json({ message: "Token has no phone number or email" });
  }

  // Phone-OTP and Google logins both land here — look up by whichever
  // identifier this token carries so a Google user isn't forced to have a
  // phone number (and vice versa).
  let user = phone ? await User.findOne({ phone }) : await User.findOne({ email });
  if (!user) {
    // isVerified starts false — that badge means "KYC approved by an admin",
    // not just "signed in", so it's earned via POST /users/me/kyc below.
    user = await User.create({
      phone: phone || undefined,
      email: email || undefined,
      name: decoded.name || "New User",
      photo: decoded.picture,
    });
  }

  const token = signToken(user);
  res.json({ token, user });
});
