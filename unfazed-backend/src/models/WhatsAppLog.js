const mongoose = require("mongoose");

const whatsappLogSchema = new mongoose.Schema(
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
      index: true,
    },

    eventType: {
      type: String,
      enum: [
        "booking_confirmed",
        "session_reminder",
        "post_session",
      ],
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["queued", "stubbed", "sent", "failed"],
      default: "queued",
    },

    provider: {
      type: String,
      default: "stub",
    },
  },
  {
    timestamps: true,
  }
);

whatsappLogSchema.index({
  session: 1,
  eventType: 1,
});

module.exports = mongoose.model("WhatsAppLog", whatsappLogSchema);