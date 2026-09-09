import mongoose from "mongoose";

const { Schema } = mongoose;

const ratingSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

ratingSchema.index({ bookingId: 1, fromUser: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
