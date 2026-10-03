const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
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
      trim: true,
      lowercase: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    source: {
      type: String,
      enum: ["branded_link", "website", "referral", "manual", "other"],
      default: "branded_link",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "converted", "lost"],
      default: "new",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    convertedClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ therapist: 1, createdAt: -1 });
leadSchema.index({ therapist: 1, status: 1 });

module.exports = mongoose.model("Lead", leadSchema);