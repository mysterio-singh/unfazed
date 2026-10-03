const jwt = require("jsonwebtoken");

const clientAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Client authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      decoded.role !== "client" ||
      !decoded.clientId ||
      !decoded.therapistId
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid client authentication token",
      });
    }

    req.clientId = decoded.clientId;
    req.therapistId = decoded.therapistId;
    req.clientRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired client token",
    });
  }
};

module.exports = clientAuthMiddleware;