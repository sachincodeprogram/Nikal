import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";
import Ride from "../models/Ride.js";

async function isBookingParticipant(bookingId, userId) {
  const booking = await Booking.findById(bookingId).select("passengerId driverId");
  if (!booking) return null;
  const isParticipant = [booking.passengerId, booking.driverId].some((id) => id.toString() === userId);
  return isParticipant ? booking : null;
}

export const initSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN || "*" },
  });

  io.use((socket, next) => {
    try {
      const payload = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      socket.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Chat: one room per booking, restricted to its two participants.
    socket.on("booking:join", async (bookingId) => {
      const booking = await isBookingParticipant(bookingId, socket.userId);
      if (booking) socket.join(`booking:${bookingId}`);
    });

    socket.on("message:send", async ({ bookingId, text }) => {
      if (!text?.trim()) return;
      const booking = await isBookingParticipant(bookingId, socket.userId);
      if (!booking) return;

      const to =
        booking.passengerId.toString() === socket.userId ? booking.driverId : booking.passengerId;
      const message = await Message.create({ bookingId, from: socket.userId, to, text });
      io.to(`booking:${bookingId}`).emit("message:new", message);
    });

    // Live location: one room per ride, restricted to the driver and its
    // confirmed passengers. Only the driver may publish, and only while the
    // ride is actually under way.
    socket.on("ride:join", async (rideId) => {
      const ride = await Ride.findById(rideId).select("driverId");
      if (!ride) return;

      const isDriver = ride.driverId.toString() === socket.userId;
      const isConfirmedPassenger =
        !isDriver &&
        (await Booking.exists({ rideId, passengerId: socket.userId, status: "confirmed" }));

      if (isDriver || isConfirmedPassenger) socket.join(`ride:${rideId}`);
    });

    socket.on("location:update", async ({ rideId, lat, lng }) => {
      if (typeof lat !== "number" || typeof lng !== "number") return;

      const ride = await Ride.findById(rideId).select("driverId status");
      if (!ride || ride.driverId.toString() !== socket.userId || ride.status !== "started") return;

      socket.to(`ride:${rideId}`).emit("location:update", { rideId, lat, lng, at: Date.now() });
    });
  });

  return io;
};
