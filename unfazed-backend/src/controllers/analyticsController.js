const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const Session = require("../models/Session");
const Client = require("../models/Client");


const getAnalytics = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;

    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid therapist ID",
      });
    }

    const therapistObjectId = new mongoose.Types.ObjectId(therapistId);

    const revenueTrend = await Payment.aggregate([
      {
        $match: {
          therapist: therapistObjectId,
          status: "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          transactions: 1,
        },
      },
    ]);

    const activeClients = await Client.countDocuments({
      therapist: therapistObjectId,
      status: "active",
    });

    const sessionStats = await Session.aggregate([
      { $match: { therapist: therapistObjectId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          noShowSessions: {
            $sum: {
              $cond: [{ $eq: ["$status", "no_show"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const stats = sessionStats[0] || {
      totalSessions: 0,
      completedSessions: 0,
      noShowSessions: 0,
    };

    const noShowRate =
      stats.totalSessions > 0
        ? Number(
            ((stats.noShowSessions / stats.totalSessions) * 100).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        revenueTrend,
        activeClients,
        sessions: {
          total: stats.totalSessions,
          completed: stats.completedSessions,
          noShow: stats.noShowSessions,
        },
        noShowRate,
      },
    });
  } catch (error) {
    next(error);
  }
};


const getDashboardStats = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;

    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid therapist ID",
      });
    }

    const therapistObjectId = new mongoose.Types.ObjectId(therapistId);
    const now = new Date();

    // Today's date in India timezone
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);

    const date = Object.fromEntries(
      dateParts.map(({ type, value }) => [type, value])
    );

    const dayStart = new Date(
      `${date.year}-${date.month}-${date.day}T00:00:00+05:30`
    );

    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const [activeClients, todaysSessions, upcomingSessions, payments] =
      await Promise.all([
        Client.countDocuments({
          therapist: therapistObjectId,
          status: "active",
        }),

        Session.countDocuments({
          therapist: therapistObjectId,
          startAt: { $gte: dayStart, $lt: dayEnd },
          status: { $in: ["scheduled", "confirmed", "completed"] },
        }),

        Session.countDocuments({
          therapist: therapistObjectId,
          startAt: { $gt: now },
          status: { $in: ["scheduled", "confirmed"] },
        }),

        Payment.find({
          therapist: therapistObjectId,
          status: "created",
        })
          .select("amount session")
          .populate("session", "status")
          .lean(),
      ]);

    const pendingPayments = payments.reduce((total, payment) => {
      if (payment.session?.status === "pending_payment") {
        return total + payment.amount;
      }

      return total;
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        activeClients,
        todaysSessions,
        pendingPayments,
        upcomingSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAnalytics,
  getDashboardStats,
};