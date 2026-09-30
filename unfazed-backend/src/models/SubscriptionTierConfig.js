const mongoose = require("mongoose");

const subscriptionTierConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    caps: {
      activeClients: {
        type: Number,
        default: null,
      },
    },

    featureFlags: {
      analyticsBasic: {
        type: Boolean,
        default: false,
      },

      analyticsAdvanced: {
        type: Boolean,
        default: false,
      },

      privateNotes: {
        type: Boolean,
        default: true,
      },

      sharedNotes: {
        type: Boolean,
        default: false,
      },

      advancedNoteTemplates: {
        type: Boolean,
        default: false,
      },

      chat: {
        type: Boolean,
        default: false,
      },
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

module.exports = mongoose.model(
  "SubscriptionTierConfig",
  subscriptionTierConfigSchema
);