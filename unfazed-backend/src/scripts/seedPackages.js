require("dotenv").config();

const connectDB = require("../config/db");
const Therapist = require("../models/Therapist");
const Package = require("../models/Package");

const seedPackages = async () => {
  try {
    await connectDB();

    const therapists = await Therapist.find({});

    if (therapists.length === 0) {
      console.log("❌ No therapists found");
      process.exit(1);
    }

    for (const therapist of therapists) {
      const packages = [
        {
          therapist: therapist._id,
          name: "3 Session Package",
          sessionCount: 3,
          perSessionRate: 1000,
          totalAmount: 3000,
          validityDays: 45,
          isActive: true,
        },
        {
          therapist: therapist._id,
          name: "6 Session Package",
          sessionCount: 6,
          perSessionRate: 900,
          totalAmount: 5400,
          validityDays: 90,
          isActive: true,
        },
        {
          therapist: therapist._id,
          name: "12 Session Package",
          sessionCount: 12,
          perSessionRate: 800,
          totalAmount: 9600,
          validityDays: 180,
          isActive: true,
        },
      ];

      for (const packageData of packages) {
        await Package.findOneAndUpdate(
          {
            therapist: therapist._id,
            sessionCount: packageData.sessionCount,
          },
          packageData,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        );
      }

      console.log(`✅ Packages seeded for ${therapist.name}`);
    }

    console.log("✅ Package seeding completed successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Package seed failed:", error);
    process.exit(1);
  }
};

seedPackages();