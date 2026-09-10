import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    photo: { type: String },
    bio: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    isVerified: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    fcmToken: { type: String },
    role: { type: String, enum: ["passenger", "driver"], default: "passenger" },
    isAdmin: { type: Boolean, default: false },
    blocked: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
