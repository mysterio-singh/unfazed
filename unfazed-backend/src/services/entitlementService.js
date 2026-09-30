const Therapist = require("../models/Therapist");
const SubscriptionTierConfig = require("../models/SubscriptionTierConfig");

const getEntitlement = async (therapistId) => {
  const therapist = await Therapist.findById(therapistId).select(
    "subscriptionTier"
  );

  if (!therapist) {
    throw new Error("Therapist not found");
  }

  if (!therapist.subscriptionTier) {
    return null;
  }

  const tier = await SubscriptionTierConfig.findById(
    therapist.subscriptionTier
  ).select("name caps featureFlags isActive");

  if (!tier || !tier.isActive) {
    return null;
  }

  return tier;
};

const canAccess = async (therapistId, featureKey) => {
  const entitlement = await getEntitlement(therapistId);

  if (!entitlement) {
    return false;
  }

  return entitlement.featureFlags?.[featureKey] === true;
};

module.exports = {
  getEntitlement,
  canAccess,
};