import User from "../models/User.js";
import { createDigilockerRequest, getDigilockerStatus } from "../services/digilocker.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// DigiLocker's own login/consent screen redirects here when it's done — the
// app's WebView intercepts this custom-scheme URL before it actually loads,
// so nothing needs to be hosted at this address.
const DIGILOCKER_REDIRECT_URL = "nikal://digilocker-callback";

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

export const submitKyc = asyncHandler(async (req, res) => {
  const { docType, docNumber, docPhoto } = req.body;
  if (!docType || !docNumber || !docPhoto) {
    return res.status(400).json({ message: "docType, docNumber and docPhoto are required" });
  }
  if (req.user.kyc?.status === "verified") {
    return res.status(400).json({ message: "Already verified" });
  }

  req.user.kyc = {
    docType,
    docNumber,
    docPhoto,
    status: "pending",
    rejectionReason: undefined,
    submittedAt: new Date(),
  };
  await req.user.save();
  res.json(req.user);
});

export const startDigilockerKyc = asyncHandler(async (req, res) => {
  if (req.user.kyc?.status === "verified") {
    return res.status(400).json({ message: "Already verified" });
  }

  const request = await createDigilockerRequest(DIGILOCKER_REDIRECT_URL);
  req.user.kyc.status = "pending";
  req.user.kyc.digilockerRequestId = request.id;
  await req.user.save();
  res.json({ url: request.url, id: request.id });
});

export const confirmDigilockerKyc = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id || id !== req.user.kyc?.digilockerRequestId) {
    return res.status(400).json({ message: "No matching DigiLocker request for this user" });
  }

  const status = await getDigilockerStatus(id);
  if (status.status !== "authenticated") {
    req.user.kyc.status = "rejected";
    req.user.kyc.rejectionReason = "DigiLocker consent was not completed";
    await req.user.save();
    return res.status(400).json({ message: "DigiLocker verification wasn't completed" });
  }

  req.user.isVerified = true;
  req.user.kyc.status = "verified";
  req.user.kyc.docType = "aadhaar";
  req.user.kyc.docNumber = status.digilockerUserDetails?.digilockerId;
  req.user.kyc.rejectionReason = undefined;
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
