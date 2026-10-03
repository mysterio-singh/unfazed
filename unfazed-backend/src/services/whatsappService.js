const WhatsAppLog = require("../models/WhatsAppLog");

const queueWhatsAppMessage = async ({
  therapistId,
  clientId,
  sessionId = null,
  eventType,
  phone = "",
  message,
}) => {
  try {
    const log = await WhatsAppLog.create({
      therapist: therapistId,
      client: clientId,
      session: sessionId,
      eventType,
      phone,
      message,
      status: "queued",
      provider: "stub",
    });

    console.log(
      `📱 WhatsApp stub queued: ${eventType} → client ${clientId}`
    );

    return log;
  } catch (error) {
    console.error("❌ WhatsApp queue failed:", error);
    throw error;
  }
};

const sendWhatsAppStub = async ({
  therapistId,
  clientId,
  sessionId = null,
  eventType,
  phone = "",
  message,
}) => {
  const log = await queueWhatsAppMessage({
    therapistId,
    clientId,
    sessionId,
    eventType,
    phone,
    message,
  });

  log.status = "stubbed";
  await log.save();

  console.log(`📱 WhatsApp stub processed: ${eventType}`);

  return log;
};

module.exports = {
  queueWhatsAppMessage,
  sendWhatsAppStub,
};