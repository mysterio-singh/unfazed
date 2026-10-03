const Lead = require("../models/Lead");

const createLead = async ({
  therapistId,
  name,
  email = "",
  phone = "",
  source = "branded_link",
  notes = "",
}) => {
  if (!therapistId) {
    throw new Error("Therapist ID is required");
  }

  if (!name) {
    throw new Error("Lead name is required");
  }

  const lead = await Lead.create({
    therapist: therapistId,
    name,
    email,
    phone,
    source,
    notes,
    status: "new",
  });

  return lead;
};

const getTherapistLeads = async (therapistId) => {
  if (!therapistId) {
    throw new Error("Therapist ID is required");
  }

  return Lead.find({
    therapist: therapistId,
  }).sort({
    createdAt: -1,
  });
};

const updateLeadStatus = async ({
  therapistId,
  leadId,
  status,
  convertedClient = null,
}) => {
  const allowedStatuses = [
    "new",
    "contacted",
    "converted",
    "lost",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid lead status");
  }

  const lead = await Lead.findOne({
    _id: leadId,
    therapist: therapistId,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  lead.status = status;

  if (status === "converted" && convertedClient) {
    lead.convertedClient = convertedClient;
  }

  await lead.save();

  return lead;
};

module.exports = {
  createLead,
  getTherapistLeads,
  updateLeadStatus,
};