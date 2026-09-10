import Report from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReport = asyncHandler(async (req, res) => {
  const { reportedId, bookingId, reason } = req.body;

  if (!reportedId || !reason) {
    return res.status(400).json({ message: "reportedId and reason are required" });
  }
  if (reportedId === req.user._id.toString()) {
    return res.status(400).json({ message: "You can't report yourself" });
  }

  const report = await Report.create({
    reporterId: req.user._id,
    reportedId,
    bookingId,
    reason,
  });

  res.status(201).json(report);
});
