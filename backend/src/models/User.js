import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // A user has a phone (Phone-OTP login), an email (Google login), or both —
    // sparse indexes so two Google-only users (no phone) or two phone-only
    // users (no email) don't collide on the missing field.
    phone: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
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
    // KYC identity check — `isVerified` above now only flips to true once
    // either DigiLocker confirms the user's identity automatically, or an
    // admin approves a manually-submitted document.
    kyc: {
      docType: { type: String, enum: ["aadhaar", "driving_license", "passport", "voter_id"] },
      docNumber: { type: String, trim: true },
      docPhoto: { type: String },
      status: {
        type: String,
        enum: ["unsubmitted", "pending", "verified", "rejected"],
        default: "unsubmitted",
      },
      rejectionReason: { type: String },
      submittedAt: { type: Date },
      // Set while a DigiLocker consent flow is in progress, so the
      // server-side confirmation step knows which Setu request to check.
      digilockerRequestId: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
