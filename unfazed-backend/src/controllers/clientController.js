const Client = require("../models/Client");
const Session = require("../models/Session");
const { getEntitlement } = require("../services/entitlementService");
const createClient = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      timezone,
      demographics,
      presentingConcern,
      history,
      consentGiven,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check whether client already exists
    const existingClient = await Client.findOne({
      therapist: req.therapistId,
      email: normalizedEmail,
    });

 


    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: "Client already exists",
      });
    }

    // Get therapist entitlement
    const entitlement = await getEntitlement(req.therapistId);

    if (!entitlement) {
      return res.status(403).json({
        success: false,
        message: "Active subscription plan is required",
        upgradeRequired: true,
      });
    }

    // Read active client cap from subscription configuration
    const activeClientCap = entitlement.caps?.activeClients;

    // Count only active clients
    if (activeClientCap !== null && activeClientCap !== undefined) {
      const activeClientCount = await Client.countDocuments({
        therapist: req.therapistId,
        status: "active",
      });

      if (activeClientCount >= activeClientCap) {
        return res.status(403).json({
          success: false,
          message: "Active client limit reached for your current plan",
          feature: "activeClientCap",
          currentCount: activeClientCount,
          limit: activeClientCap,
          upgradeRequired: true,
        });
      }
    }

    // Add consent timestamp when consent is given
    const consentTimestamp =
      consentGiven === true
        ? req.body.consentTimestamp || new Date()
        : null;

    const client = await Client.create({
      therapist: req.therapistId,
      name,
      email: normalizedEmail,
      phone,
      timezone,
      demographics,
      presentingConcern,
      history,
      consentGiven,
      consentTimestamp,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    next(error);
  }
};

const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find({
      therapist: req.therapistId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      clients,
    });
  } catch (error) {
    next(error);
  }
};

const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      therapist: req.therapistId,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      therapist: req.therapistId,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const allowedFields = [
      "name",
      "email",
      "phone",
      "timezone",
      "demographics",
      "presentingConcern",
      "history",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        client[field] = req.body[field];
      }
    });

    if (req.body.email !== undefined) {
      client.email = req.body.email.toLowerCase().trim();
    }

    await client.save();

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    next(error);
  }
};

const getClientPortalProfile = async (req, res, next) => {
  try {
    const clientId = req.clientId;
    const therapistId = req.therapistId;

    const client = await Client.findOne({
      _id: clientId,
      therapist: therapistId,
      status: "active",
    }).select(
      "_id name email phone timezone demographics presentingConcern history consentGiven consentTimestamp"
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
    }

    return res.status(200).json({
  success: true,
  data: client,
  chat: {
    clientId: client._id,
    therapistId,
  },
});
  } catch (error) {
    next(error);
  }
};

const getClientSessions = async (req, res, next) => {
  try {
    const clientId = req.clientId;
    const therapistId = req.therapistId;

    // Verify that this client belongs to this therapist
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

    // Fetch only this client's sessions
    const sessions = await Session.find({
      client: clientId,
      therapist: therapistId,
    })
      .select(
        "_id startAt endAt durationMinutes timezone status bookingSource createdAt"
      )
      .sort({ startAt: -1 });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  getClientSessions,
  getClientPortalProfile,
};