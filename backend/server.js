import "dotenv/config";
import http from "http";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import vehicleRoutes from "./src/routes/vehicleRoutes.js";
import rideRoutes from "./src/routes/rideRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import ratingRoutes from "./src/routes/ratingRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";
import { initSockets } from "./src/sockets/index.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/rides", rideRoutes);
app.use("/bookings", bookingRoutes);
app.use("/ratings", ratingRoutes);
app.use("/messages", messageRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const start = async () => {
  await connectDB();
  const httpServer = http.createServer(app);
  initSockets(httpServer);
  httpServer.listen(port, () => console.log(`Nikal backend listening on :${port}`));
};

start();
