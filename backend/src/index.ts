import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoutes from "./controllers/authController";
import vehicleRoutes from "./controllers/vehicleController";
import rideRoutes from "./controllers/rideController";
import bookingRoutes from "./controllers/bookingController";
import ratingRoutes from "./controllers/ratingController";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/rides", rideRoutes);
app.use("/bookings", bookingRoutes);
app.use("/ratings", ratingRoutes);

app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => console.log(`Nikal backend listening on :${port}`));
