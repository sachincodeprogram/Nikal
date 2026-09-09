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
