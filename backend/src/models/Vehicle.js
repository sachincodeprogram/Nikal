import mongoose from "mongoose";

const { Schema } = mongoose;

const vehicleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["CAR", "BIKE"], required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String },
    plateNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    seats: { type: Number, required: true },
    photo: { type: String },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
