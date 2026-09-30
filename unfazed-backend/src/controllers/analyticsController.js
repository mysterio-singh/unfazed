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

    // 1. Revenue trend
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
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
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

    // 2. Active clients
    const activeClients = await Client.countDocuments({
      therapist: therapistObjectId,
      isActive: { $ne: false },
    });

    // 3. Session statistics
    const sessionStats = await Session.aggregate([
      {
        $match: {
          therapist: therapistObjectId,
        },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [
                { $eq: ["$status", "completed"] },
                1,
                0,
              ],
            },
          },
          noShowSessions: {
            $sum: {
              $cond: [
                { $eq: ["$status", "no_show"] },
                1,
                0,
              ],
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
            (
              (stats.noShowSessions / stats.totalSessions) *
              100
            ).toFixed(2)
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

module.exports = {
  getAnalytics,
};