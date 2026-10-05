const express = require("express");
const cors = require("cors");

const therapistRoutes = require("./src/routes/therapistRoutes");
const authRoutes = require("./src/routes/authRoutes");
const schedulingRoutes = require("./src/routes/schedulingRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const {
  handleRazorpayWebhook,
} = require("./src/controllers/paymentController");
const noteRoutes = require("./src/routes/noteRoutes");
const packageRoutes = require("./src/routes/packageRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const leadRoutes = require("./src/routes/leadRoutes");
const app = express();

app.use(cors());

/*
  Razorpay webhook
  IMPORTANT:
  Webhook must receive the raw request body
  so Razorpay signature can be verified.
*/
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Unfazed API is running",
  });
});

app.use("/auth", authRoutes);
app.use("/therapist", therapistRoutes);
app.use("/scheduling", schedulingRoutes);
app.use("/clients", clientRoutes);
app.use("/payments", paymentRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/packages", packageRoutes);
app.use("/chat", chatRoutes);
app.use("/leads", leadRoutes);
app.use("/notes", noteRoutes);


module.exports = app;