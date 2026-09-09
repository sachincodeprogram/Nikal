import mongoose from "mongoose";

const { Schema } = mongoose;

const stopSchema = new Schema(
  {
    name: { type: String },
    loc: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    rideId: { type: Schema.Types.ObjectId, ref: "Ride", required: true },
    passengerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seats: { type: Number, required: true, default: 1 },
    pickup: stopSchema,
    drop: stopSchema,
    amount: { type: Number, required: true },
    serviceFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

bookingSchema.index({ rideId: 1 });
bookingSchema.index({ passengerId: 1 });

export default mongoose.model("Booking", bookingSchema);
