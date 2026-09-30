const { canAccess } = require("../services/entitlementService");

const entitlementMiddleware = (featureKey) => {
  return async (req, res, next) => {
    try {
      if (!req.therapistId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const allowed = await canAccess(
        req.therapistId,
        featureKey
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "This feature is not available on your current plan",
          feature: featureKey,
          upgradeRequired: true,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = entitlementMiddleware;