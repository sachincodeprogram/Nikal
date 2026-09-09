import mongoose from "mongoose";

const { Schema } = mongoose;

const payoutSchema = new Schema(
  {
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    period: { type: String, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    upiId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Payout", payoutSchema);
