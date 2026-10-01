const Package = require("../models/Package");
const Therapist = require("../models/Therapist");

const getPublicPackages = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const therapist = await Therapist.findOne({
      slug: slug.toLowerCase(),
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    const packages = await Package.find({
      therapist: therapist._id,
      isActive: true,
    })
      .select(
        "name sessionCount perSessionRate totalAmount validityDays"
      )
      .sort({ sessionCount: 1 });

    return res.status(200).json({
      success: true,
      packages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicPackages,
};