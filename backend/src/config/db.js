import mongoose from "mongoose";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
};
