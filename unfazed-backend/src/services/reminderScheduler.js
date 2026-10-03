const cron = require("node-cron");
const Session = require("../models/Session");
const {
  createNotification,
} = require("./notificationService");

const startReminderScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const reminderStart = new Date(
        now.getTime() + 23 * 60 * 60 * 1000
      );

      const reminderEnd = new Date(
        now.getTime() + 25 * 60 * 60 * 1000
      );

      const sessions = await Session.find({
        status: {
          $in: ["scheduled", "confirmed"],
        },
        startAt: {
          $gte: reminderStart,
          $lt: reminderEnd,
        },
      });

      for (const session of sessions) {
  try {
    await createNotification({
      therapistId: session.therapist,
      clientId: session.client,
      sessionId: session._id,
      type: "session_reminder",
      title: "Session Reminder",
      message: `You have a therapy session scheduled for ${session.startAt.toLocaleString(
        "en-IN"
      )}.`,
      channel: "in_app",
    });
  } catch (error) {
    if (error.code === 11000) {
      console.log(
        `🔔 Reminder already exists for session ${session._id}`
      );
      continue;
    }

    throw error;
  }
}

      if (sessions.length > 0) {
        console.log(
          `🔔 ${sessions.length} session reminder(s) processed`
        );
      }
    } catch (error) {
      console.error("❌ Reminder scheduler error:", error);
    }
  });

  console.log("⏰ Session reminder scheduler started");
};

module.exports = startReminderScheduler;