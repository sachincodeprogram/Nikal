import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const EDITABLE_FIELDS = ["name", "photo", "bio", "gender", "fcmToken", "role"];

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateMe = asyncHandler(async (req, res) => {
  for (const key of EDITABLE_FIELDS) {
    if (key in req.body) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json(req.user);
});

export const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === req.user._id.toString()) {
    return res.status(400).json({ message: "You can't block yourself" });
  }
  await User.updateOne({ _id: req.user._id }, { $addToSet: { blocked: id } });
  res.json({ ok: true });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await User.updateOne({ _id: req.user._id }, { $pull: { blocked: id } });
  res.json({ ok: true });
});
