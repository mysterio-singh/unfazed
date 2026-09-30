const mongoose = require("mongoose");

const sessionNoteSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["private", "shared"],
      required: true,
      default: "private",
    },

    templateType: {
      type: String,
      enum: ["basic", "advanced"],
      default: "basic",
    },

    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SessionNote", sessionNoteSchema);