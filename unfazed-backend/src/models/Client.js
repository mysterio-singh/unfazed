const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    demographics: {
      age: {
        type: Number,
        min: 0,
      },
      gender: {
        type: String,
        default: "",
      },
    },

    presentingConcern: {
      type: String,
      default: "",
    },

    history: {
      type: String,
      default: "",
    },

    consentGiven: {
      type: Boolean,
      default: false,
    },

    consentTimestamp: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

clientSchema.index(
  { therapist: 1, email: 1 },
  { unique: true }
);

module.exports = mongoose.model("Client", clientSchema);