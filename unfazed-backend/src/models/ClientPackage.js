const mongoose = require("mongoose");

const clientPackageSchema = new mongoose.Schema(
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

    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      unique: true,
    },

    sessionsTotal: {
      type: Number,
      required: true,
      min: 1,
    },

    sessionsRemaining: {
      type: Number,
      required: true,
      min: 0,
    },

    purchasedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "exhausted", "cancelled"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

clientPackageSchema.index({
  client: 1,
  status: 1,
  expiresAt: 1,
});

module.exports = mongoose.model("ClientPackage", clientPackageSchema);