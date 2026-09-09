import mongoose from "mongoose";

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportedId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved", "dismissed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
