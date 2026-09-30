const SessionNote = require("../models/SessionNote");
const { canAccess } = require("../services/entitlementService");
const createNote = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;

    const {
      client,
      session,
      type,
      templateType,
      content,
    } = req.body;
    if (templateType === "advanced") {
  const allowed = await canAccess(
    therapistId,
    "advancedNoteTemplates"
  );

  if (!allowed) {
    return res.status(403).json({
      success: false,
      message:
        "Advanced note templates are not available on your current plan",
      feature: "advancedNoteTemplates",
      upgradeRequired: true,
    });
  }
}

    if (!client || !session || !content) {
      return res.status(400).json({
        success: false,
        message: "Client, session and content are required",
      });
    }

    if (!["private", "shared"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note type",
      });
    }

    const note = await SessionNote.create({
      therapist: therapistId,
      client,
      session,
      type: type || "private",
      templateType: templateType || "basic",
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Session note created successfully",
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const getTherapistNotes = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;
    if (templateType === "advanced") {
  const allowed = await canAccess(
    therapistId,
    "advancedNoteTemplates"
  );

  if (!allowed) {
    return res.status(403).json({
      success: false,
      message:
        "Advanced note templates are not available on your current plan",
      feature: "advancedNoteTemplates",
      upgradeRequired: true,
    });
  }
}

    const notes = await SessionNote.find({
      therapist: therapistId,
    })
      .populate("client", "name email")
      .populate("session", "startAt endAt status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getTherapistNotes,
};