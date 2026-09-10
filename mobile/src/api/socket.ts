import { io, Socket } from "socket.io-client";
import { API_BASE_URL, loadStoredToken } from "./client";

// One socket per screen that needs it (chat) — created on mount, torn down
// on unmount, rather than a global singleton, since only the chat screen
// uses it today.
export async function connectSocket(): Promise<Socket> {
  const token = await loadStoredToken();
  return io(API_BASE_URL, { auth: { token }, transports: ["websocket"] });
}
