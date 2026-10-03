const mongoose = require("mongoose");

const {
  createLead,
  getTherapistLeads,
  updateLeadStatus,
} = require("../services/leadDistributionService");

const createLeadController = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;

    const {
      name,
      email = "",
      phone = "",
      source = "branded_link",
      notes = "",
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Lead name is required",
      });
    }

    const lead = await createLead({
      therapistId,
      name: name.trim(),
      email,
      phone,
      source,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const getLeadsController = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;

    const leads = await getTherapistLeads(therapistId);

    return res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

const updateLeadStatusController = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;
    const { leadId } = req.params;
    const { status, convertedClient } = req.body;

    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead ID",
      });
    }

    const lead = await updateLeadStatus({
      therapistId,
      leadId,
      status,
      convertedClient,
    });

    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeadController,
  getLeadsController,
  updateLeadStatusController,
};