const ClientPackage = require("../models/ClientPackage");

const getActiveClientPackage = async ({
  therapistId,
  clientId,
}) => {
  const clientPackage = await ClientPackage.findOne({
    therapist: therapistId,
    client: clientId,
    status: "active",
    sessionsRemaining: { $gt: 0 },
    expiresAt: { $gt: new Date() },
  }).sort({ expiresAt: 1 });

  if (!clientPackage) {
    return null;
  }

  return clientPackage;
};

const consumeSession = async ({
  therapistId,
  clientId,
  session,
}) => {
  const clientPackage = await ClientPackage.findOne({
    therapist: therapistId,
    client: clientId,
    status: "active",
    sessionsRemaining: { $gt: 0 },
    expiresAt: { $gt: new Date() },
  }).session(session);

  if (!clientPackage) {
    throw new Error(
      "Client has no active package with remaining sessions"
    );
  }

  clientPackage.sessionsRemaining -= 1;

  if (clientPackage.sessionsRemaining === 0) {
    clientPackage.status = "exhausted";
  }

  await clientPackage.save({ session });

  return clientPackage;
};

module.exports = {
  getActiveClientPackage,
  consumeSession,
};