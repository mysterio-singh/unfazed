const Notification = require("../models/Notification");

const createNotification = async ({
  therapistId,
  clientId,
  sessionId = null,
  type,
  title,
  message,
  channel = "in_app",
}) => {
  try {
    const notification = await Notification.create({
      therapist: therapistId,
      client: clientId,
      session: sessionId,
      type,
      channel,
      title,
      message,
      sentAt: new Date(),
    });

    console.log(
      `🔔 Notification created: ${type} → client ${clientId}`
    );

    return notification;
  } catch (error) {
    console.error("❌ Notification creation failed:", error);
    throw error;
  }
};

const notifyBookingConfirmed = async ({
  therapistId,
  clientId,
  sessionId,
  startAt,
}) => {
  return createNotification({
    therapistId,
    clientId,
    sessionId,
    type: "booking_confirmed",
    title: "Session Confirmed",
    message: `Your therapy session has been confirmed for ${new Date(
      startAt
    ).toLocaleString("en-IN")}.`,
    channel: "in_app",
  });
};

const notifyPostSession = async ({
  therapistId,
  clientId,
  sessionId,
}) => {
  return createNotification({
    therapistId,
    clientId,
    sessionId,
    type: "post_session",
    title: "Session Completed",
    message:
      "Your therapy session has been completed. Thank you for taking the time today.",
    channel: "in_app",
  });
};

module.exports = {
  createNotification,
  notifyBookingConfirmed,
  notifyPostSession,
};