import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ bookingId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
