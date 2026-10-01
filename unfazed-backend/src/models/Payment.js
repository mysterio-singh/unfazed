const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },

    package: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Package",
  required: true,
},

    gateway_transaction_id: {
      type: String,
      default: "",
      index: true,
    },

    gateway_order_id: {
      type: String,
      default: "",
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    platform_fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    net_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: [
        "created",
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "created",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);