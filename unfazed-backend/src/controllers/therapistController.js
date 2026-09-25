const Therapist = require("../models/Therapist");

const getProfile = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.therapistId).select(
      "-password_hash"
    );

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    res.status(200).json({
      success: true,
      therapist,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      specializations,
      languages,
      slug,
    } = req.body;

    const therapist = await Therapist.findById(req.therapistId);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    if (slug && slug !== therapist.slug) {
      const existingSlug = await Therapist.findOne({
        slug: slug.toLowerCase(),
        _id: { $ne: therapist._id },
      });

      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: "This profile slug is already in use",
        });
      }

      therapist.slug = slug.toLowerCase().trim();
    }

    if (name !== undefined) therapist.name = name.trim();
    if (bio !== undefined) therapist.bio = bio;
    if (specializations !== undefined) {
      therapist.specializations = specializations;
    }
    if (languages !== undefined) {
      therapist.languages = languages;
    }

    await therapist.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        bio: therapist.bio,
        specializations: therapist.specializations,
        languages: therapist.languages,
      },
    });
  } catch (error) {
    next(error);
  }
};
const getPublicProfile = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const therapist = await Therapist.findOne({ slug })
      .select("name slug bio specializations languages");
console.log("XYZ PUBLIC PROFILE ID:", therapist?._id?.toString());
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    res.status(200).json({
      success: true,
      therapist,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getProfile,
  updateProfile,
  getPublicProfile,
};