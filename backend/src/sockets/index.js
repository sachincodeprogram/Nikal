import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

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
    socket.on("booking:join", (bookingId) => {
      socket.join(`booking:${bookingId}`);
    });

    socket.on("message:send", async ({ bookingId, to, text }) => {
      const message = await Message.create({ bookingId, from: socket.userId, to, text });
      io.to(`booking:${bookingId}`).emit("message:new", message);
    });
  });

  return io;
};
