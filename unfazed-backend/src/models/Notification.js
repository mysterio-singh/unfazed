const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: [
        "booking_confirmed",
        "session_reminder",
        "post_session",
      ],
      required: true,
    },

    channel: {
      type: String,
      enum: ["in_app", "whatsapp", "email"],
      default: "in_app",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  client: 1,
  createdAt: -1,
});

notificationSchema.index({
  therapist: 1,
  createdAt: -1,
});

notificationSchema.index(
  {
    session: 1,
    type: 1,
    channel: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      session: { $type: "objectId" },
    },
  }
);

module.exports = mongoose.model("Notification", notificationSchema);