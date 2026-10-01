const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createPaymentOrder,
  createPublicPaymentOrder,
  cancelPublicPayment,
  verifyPayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.post(
  "/create-order",
  authMiddleware,
  createPaymentOrder
);

router.post(
  "/public/:slug/create-order",
  createPublicPaymentOrder
);

router.post(
  "/public/verify",
  verifyPayment
);

router.post("/public/cancel", cancelPublicPayment);

module.exports = router;