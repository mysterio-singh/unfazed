const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const Therapist = require("../models/Therapist");

const generateToken = (therapistId) => {
  return jwt.sign(
    { therapistId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const registerTherapist = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password, name } = req.body;

    const existingTherapist = await Therapist.findOne({
      email: email.toLowerCase(),
    });

    if (existingTherapist) {
      return res.status(409).json({
        success: false,
        message: "Therapist with this email already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existingSlug = await Therapist.findOne({ slug });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "This therapist profile slug already exists",
      });
    }

    const therapist = await Therapist.create({
      email: email.toLowerCase(),
      password_hash,
      name,
      slug,
    });

    const token = generateToken(therapist._id);

    res.status(201).json({
      success: true,
      message: "Therapist registered successfully",
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginTherapist = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const therapist = await Therapist.findOne({
      email: email.toLowerCase(),
    });

    if (!therapist) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      therapist.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(therapist._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
      },
    });
  } catch (error) {
    next(error);
  }
};

const validateRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = {
  registerTherapist,
  loginTherapist,
  validateRegistration,
  validateLogin,
};