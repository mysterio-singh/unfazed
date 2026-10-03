const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true,
    },

    clientPackage: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ClientPackage",
  default: null,
  index: true,
},

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    startAt: {
      type: Date,
      required: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      enum: [30, 45, 60, 90],
      required: true,
    },

    timezone: {
      type: String,
      required: true,
      default: "Asia/Kolkata",
    },

    status: {
  type: String,
  enum: [
    "pending_payment",
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
  ],
  default: "scheduled",
},

    bookingSource: {
      type: String,
      enum: ["client", "therapist"],
      default: "client",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);