const mongoose = require("mongoose");

const SessionNote = require("../models/SessionNote");
const Client = require("../models/Client");
const Session = require("../models/Session");

const { canAccess } = require("../services/entitlementService");

const createNote = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;

    const {
      client,
      session,
      type = "private",
      templateType = "basic",
      content,
    } = req.body;

    // Validate required fields
    if (!client || !session || !content) {
      return res.status(400).json({
        success: false,
        message: "Client, session and content are required",
      });
    }

    // Validate note type
    if (!["private", "shared"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note type",
      });
    }

    // Validate template type
    if (!["basic", "advanced"].includes(templateType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template type",
      });
    }

    // Validate MongoDB IDs
    if (
      !mongoose.isValidObjectId(client) ||
      !mongoose.isValidObjectId(session)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid client or session ID",
      });
    }

    // Verify client belongs to this therapist
    const existingClient = await Client.findOne({
      _id: client,
      therapist: therapistId,
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Verify session belongs to this therapist and client
    const existingSession = await Session.findOne({
      _id: session,
      therapist: therapistId,
      client,
    });

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check advanced template entitlement
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

    // Check shared notes entitlement
    if (type === "shared") {
      const allowed = await canAccess(
        therapistId,
        "sharedNotes"
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message:
            "Shared notes are not available on your current plan",
          feature: "sharedNotes",
          upgradeRequired: true,
        });
      }
    }

    const note = await SessionNote.create({
      therapist: therapistId,
      client,
      session,
      type,
      templateType,
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

// Therapist can view their own private and shared notes
const getTherapistNotes = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;

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

const getClientSharedNotes = async (req, res, next) => {
  try {
    const clientId = req.clientId;
    const therapistId = req.therapistId;

    // Verify that this client actually belongs to this therapist
    const client = await Client.findOne({
      _id: clientId,
      therapist: therapistId,
      status: "active",
    }).select("_id");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // IMPORTANT:
    // Only shared notes are queried.
    // Private notes never enter the client-facing response.
    const notes = await SessionNote.find({
      client: clientId,
      therapist: therapistId,
      type: "shared",
    })
      .select("_id client session type templateType content createdAt updatedAt")
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
  getClientSharedNotes,
};