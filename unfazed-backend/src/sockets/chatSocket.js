const jwt = require("jsonwebtoken");
const ChatMessage = require("../models/ChatMessage");
const initializeChatSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      if (
        decoded.role !== "client" &&
        decoded.role !== "therapist"
      ) {
        return next(new Error("Invalid user role"));
      }

      socket.user = decoded;

      next();
    } catch (error) {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `💬 Chat connected: ${socket.user.role} - ${socket.id}`
    );

    const userId =
      socket.user.role === "client"
        ? socket.user.clientId
        : socket.user.therapistId;

    socket.join(`user:${userId}`);

    socket.on("join_chat", ({ clientId, therapistId }) => {
      if (!clientId || !therapistId) {
        return;
      }

      const isClient =
  socket.user.role === "client" &&
  socket.user.clientId === clientId &&
  socket.user.therapistId === therapistId;

const isTherapist =
  socket.user.role === "therapist" &&
  socket.user.therapistId === therapistId;

      if (!isClient && !isTherapist) {
        socket.emit("chat_error", {
          message: "You are not authorized to join this chat",
        });
        return;
      }

      const roomId = `chat:${therapistId}:${clientId}`;

      socket.join(roomId);

      console.log(
        `💬 ${socket.user.role} joined room: ${roomId}`
      );

      socket.emit("chat_joined", {
        roomId,
      });
    });

    socket.on(
  "send_message",
  async ({ clientId, therapistId, message }) => {
    try {
      if (
        !clientId ||
        !therapistId ||
        !message ||
        !message.trim()
      ) {
        return;
      }

      const isClient =
        socket.user.role === "client" &&
        socket.user.clientId === clientId &&
        socket.user.therapistId === therapistId;

      const isTherapist =
        socket.user.role === "therapist" &&
        socket.user.therapistId === therapistId;

      if (!isClient && !isTherapist) {
        socket.emit("chat_error", {
          message: "You are not authorized to send messages",
        });
        return;
      }

      const roomId = `chat:${therapistId}:${clientId}`;

      const senderId =
        socket.user.role === "client"
          ? clientId
          : therapistId;

      // Save message in MongoDB
      const savedMessage = await ChatMessage.create({
        therapist: therapistId,
        client: clientId,
        senderId,
        senderRole: socket.user.role,
        message: message.trim(),
      });

      // Send saved message to everyone in the chat room
      const chatMessage = {
        _id: savedMessage._id,
        senderId: savedMessage.senderId,
        senderRole: savedMessage.senderRole,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
      };

      io.to(roomId).emit(
        "receive_message",
        chatMessage
      );
    } catch (error) {
      console.error("❌ Chat message save error:", error);

      socket.emit("chat_error", {
        message: "Failed to send message",
      });
    }
  }
);

    socket.on("disconnect", () => {
      console.log(
        `💬 Chat disconnected: ${socket.user.role} - ${socket.id}`
      );
    });
  });
};

module.exports = initializeChatSocket;