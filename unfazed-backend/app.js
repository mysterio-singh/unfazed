const express = require("express");
const cors = require("cors");

const therapistRoutes = require("./src/routes/therapistRoutes");
const authRoutes = require("./src/routes/authRoutes");
const schedulingRoutes = require("./src/routes/schedulingRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");

const {
  handleRazorpayWebhook,
} = require("./src/controllers/paymentController");

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

app.use("/api/auth", authRoutes);
app.use("/api/therapist", therapistRoutes);
app.use("/api/scheduling", schedulingRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/payments", paymentRoutes);

console.log("ROUTES CHECK:", {
  authRoutes: typeof authRoutes,
  therapistRoutes: typeof therapistRoutes,
  schedulingRoutes: typeof schedulingRoutes,
  clientRoutes: typeof clientRoutes,
  paymentRoutes: typeof paymentRoutes,
});

module.exports = app;