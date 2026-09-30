require("dotenv").config();

const connectDB = require("../config/db");
const SubscriptionTierConfig = require("../models/SubscriptionTierConfig");

const seedSubscriptionTiers = async () => {
  try {
    await connectDB();

    const tiers = [
      {
        name: "Basic",
        caps: {
          activeClients: 25,
        },
        featureFlags: {
          analyticsBasic: true,
          analyticsAdvanced: false,
          privateNotes: true,
          sharedNotes: false,
          advancedNoteTemplates: false,
          chat: true,
        },
        isActive: true,
      },

      {
        name: "Professional",
        caps: {
          activeClients: 100,
        },
        featureFlags: {
          analyticsBasic: true,
          analyticsAdvanced: true,
          privateNotes: true,
          sharedNotes: true,
          advancedNoteTemplates: true,
          chat: true,
        },
        isActive: true,
      },

      {
        name: "Enterprise",
        caps: {
          activeClients: null,
        },
        featureFlags: {
          analyticsBasic: true,
          analyticsAdvanced: true,
          privateNotes: true,
          sharedNotes: true,
          advancedNoteTemplates: true,
          chat: true,
        },
        isActive: true,
      },
    ];

    for (const tier of tiers) {
      await SubscriptionTierConfig.findOneAndUpdate(
        { name: tier.name },
        tier,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log("✅ Subscription tiers seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Subscription tier seed failed:",
      error
    );

    process.exit(1);
  }
};

seedSubscriptionTiers();