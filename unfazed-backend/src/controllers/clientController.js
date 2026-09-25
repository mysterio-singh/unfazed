const Client = require("../models/Client");

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

    if (consentGiven === true && !req.body.consentTimestamp) {
      req.body.consentTimestamp = new Date();
    }

    const existingClient = await Client.findOne({
      therapist: req.therapistId,
      email: email.toLowerCase(),
    });

    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: "Client already exists",
      });
    }

    const client = await Client.create({
      therapist: req.therapistId,
      name,
      email,
      phone,
      timezone,
      demographics,
      presentingConcern,
      history,
      consentGiven,
      consentTimestamp:
        consentGiven === true
          ? req.body.consentTimestamp || new Date()
          : null,
    });

    res.status(201).json({
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

    res.status(200).json({
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

    res.status(200).json({
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

    await client.save();

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client,
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
};