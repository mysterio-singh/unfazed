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
  qualifications,
  certifications,
  experienceYears,
  professionalApproach,
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
    
if (qualifications !== undefined) {
  therapist.qualifications = qualifications;
}

if (certifications !== undefined) {
  therapist.certifications = certifications;
}

if (experienceYears !== undefined) {
  const experience = Number(experienceYears);

  if (
    experienceYears === "" ||
    experienceYears === null
  ) {
    therapist.experienceYears = null;
  } else if (
    !Number.isFinite(experience) ||
    experience < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Experience must be a valid non-negative number",
    });
  } else {
    therapist.experienceYears = experience;
  }
}

if (professionalApproach !== undefined) {
  therapist.professionalApproach = professionalApproach;
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
        
qualifications: therapist.qualifications,
certifications: therapist.certifications,
experienceYears: therapist.experienceYears,
professionalApproach: therapist.professionalApproach,

      },
    });
  } catch (error) {
    next(error);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const therapist = await Therapist.findOne({
      slug: { $eq: slug },
      name: { $type: "string", $regex: /\S/ },
    }).select(
      "name slug bio specializations languages qualifications certifications experienceYears professionalApproach"
    );

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






const getPublicTherapists = async (req, res, next) => {
  try {
    const therapists = await Therapist.find({
      name: { $type: "string", $regex: /\S/ },
      slug: { $type: "string", $regex: /\S/ },
    })
      .select(
        "name slug bio specializations languages qualifications certifications experienceYears professionalApproach"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: therapists.length,
      therapists,
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  getProfile,
  updateProfile,
  getPublicProfile,
  getPublicTherapists,
};
