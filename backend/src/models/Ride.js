import mongoose from "mongoose";

const { Schema } = mongoose;

const pointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const placeSchema = new Schema(
  {
    name: { type: String, required: true },
    loc: { type: pointSchema, required: true },
  },
  { _id: false }
);

const waypointSchema = new Schema(
  {
    name: { type: String },
    loc: { type: pointSchema },
  },
  { _id: false }
);

const rideSchema = new Schema(
  {
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    from: { type: placeSchema, required: true },
    to: { type: placeSchema, required: true },
    routePolyline: { type: String },
    waypoints: [waypointSchema],
    departureAt: { type: Date, required: true },
    seatsTotal: { type: Number, required: true },
    seatsLeft: { type: Number, required: true },
    pricePerSeat: { type: Number, required: true },
    approval: { type: String, enum: ["auto", "manual"], default: "auto" },
    prefs: {
      smoking: { type: Boolean, default: false },
      pets: { type: Boolean, default: false },
      music: { type: Boolean, default: false },
      womenOnly: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["active", "full", "started", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

rideSchema.index({ "from.loc": "2dsphere" });
rideSchema.index({ "to.loc": "2dsphere" });
rideSchema.index({ departureAt: 1 });

export default mongoose.model("Ride", rideSchema);
