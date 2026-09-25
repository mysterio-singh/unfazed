const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["weekly", "override", "blocked"],
      required: true,
    },

    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },

    date: {
      type: Date,
    },

    startTime: {
      type: String,
    },

    endTime: {
      type: String,
    },

    sessionDuration: {
      type: Number,
      enum: [30, 45, 60, 90],
      default: 60,
    },

    bufferMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Availability", availabilitySchema);