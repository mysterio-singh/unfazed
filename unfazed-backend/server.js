require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const initializeChatSocket = require("./src/sockets/chatSocket");
const startReminderScheduler = require("./src/services/reminderScheduler");
initializeChatSocket(io);


const startServer = async () => {
  await connectDB();

  startReminderScheduler();

  httpServer.listen(PORT, () => {
    console.log(`Unfazed server running on port ${PORT}`);
    console.log("💬 Socket.io server ready");
  });
};

startServer();