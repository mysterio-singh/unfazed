import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

export const createSocketConnection = (token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  return io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });
};