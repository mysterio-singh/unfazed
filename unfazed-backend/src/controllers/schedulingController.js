const Availability = require("../models/Availability");
const Session = require("../models/Session");
const mongoose = require("mongoose");

const {
  getActiveClientPackage,
  consumeSession,
} = require("../services/packageEntitlementService");
const {
  notifyBookingConfirmed,
  notifyPostSession,
} = require("../services/notificationService");
const { sendWhatsAppStub } = require("../services/whatsappService");
const getAvailability = async (req, res, next) => {
  try {
    console.log("🔥 PUBLIC AVAILABILITY API HIT");
    const availability = await Availability.find({
      therapist: req.therapistId,
      isActive: true,
    }).sort({
      dayOfWeek: 1,
      startTime: 1,
    });

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

const createAvailability = async (req, res, next) => {
  try {
    const {
      type,
      dayOfWeek,
      date,
      startTime,
      endTime,
      sessionDuration,
      bufferMinutes,
      timezone,
    } = req.body;

    if (!type || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Type, start time and end time are required",
      });
    }

    if (type === "weekly" && dayOfWeek === undefined) {
      return res.status(400).json({
        success: false,
        message: "dayOfWeek is required for weekly availability",
      });
    }

    if (type === "override" || type === "blocked") {
      if (!date) {
        return res.status(400).json({
          success: false,
          message:
            "Date is required for override or blocked availability",
        });
      }
    }

    const availability = await Availability.create({
      therapist: req.therapistId,
      type,
      dayOfWeek,
      date,
      startTime,
      endTime,
      sessionDuration,
      bufferMinutes,
      timezone,
    });

    res.status(201).json({
      success: true,
      message: "Availability created successfully",
      availability,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const availability = await Availability.findOne({
      _id: id,
      therapist: req.therapistId,
      isActive: true,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    const allowedFields = [
      "type",
      "dayOfWeek",
      "date",
      "startTime",
      "endTime",
      "sessionDuration",
      "bufferMinutes",
      "timezone",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        availability[field] = req.body[field];
      }
    });

    await availability.save();

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const availability = await Availability.findOne({
      _id: id,
      therapist: req.therapistId,
      isActive: true,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    availability.isActive = false;

    await availability.save();

    res.status(200).json({
      success: true,
      message: "Availability removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
  Helper:
  Converts "HH:mm" into minutes from midnight.
*/
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

/*
  Helper:
  Combines a date and "HH:mm" time into a JavaScript Date.
*/
const combineDateAndTime = (date, time) => {
  const result = new Date(date);

  const [hours, minutes] = time.split(":").map(Number);

  result.setHours(hours, minutes, 0, 0);

  return result;
};

const getTherapistSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      therapist: req.therapistId,
    })
      .populate("client", "name email")
      .sort({ startAt: -1 });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};


/*
  Create a booking/session.
*/
/*
  Create a booking/session.
*/
const createBooking = async (req, res, next) => {
  try {
    const {
      clientId,
      startAt,
      durationMinutes,
      timezone,
      bookingSource,
    } = req.body;

    if (!clientId || !startAt || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: "Client, start time and duration are required",
      });
    }

    if (![30, 45, 60, 90].includes(Number(durationMinutes))) {
      return res.status(400).json({
        success: false,
        message: "Duration must be 30, 45, 60 or 90 minutes",
      });
    }

    const start = new Date(startAt);

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time",
      });
    }

    const duration = Number(durationMinutes);

    const end = new Date(
      start.getTime() + duration * 60 * 1000
    );

    /*
      Verify that the client belongs to this therapist.
    */
    const Client = require("../models/Client");

    const client = await Client.findOne({
      _id: clientId,
      therapist: req.therapistId,
      status: "active",
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    /*
      Check for an active client package.
    */
    const clientPackage = await getActiveClientPackage({
      therapistId: req.therapistId,
      clientId,
    });

    if (!clientPackage) {
      return res.status(403).json({
        success: false,
        message: "Client has no active package with remaining sessions",
      });
    }

    /*
      Determine the weekday.

      JavaScript:
      0 = Sunday
      1 = Monday
      ...
      6 = Saturday
    */
    const dayOfWeek = start.getDay();

    const requestedStartMinutes =
      start.getHours() * 60 + start.getMinutes();

    const requestedEndMinutes =
      requestedStartMinutes + duration;

    /*
      Find active weekly availability for this therapist/day.
    */
    const weeklyAvailability = await Availability.find({
      therapist: req.therapistId,
      type: "weekly",
      dayOfWeek,
      isActive: true,
    });

    /*
      Find date-specific overrides/blocked slots.
    */
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dateSpecificAvailability =
      await Availability.find({
        therapist: req.therapistId,
        type: { $in: ["override", "blocked"] },
        date: {
          $gte: dayStart,
          $lt: dayEnd,
        },
        isActive: true,
      });

    /*
      Blocked slot check.
    */
    const blockedSlot = dateSpecificAvailability.find(
      (slot) => {
        if (slot.type !== "blocked") {
          return false;
        }

        const blockedStart = timeToMinutes(
          slot.startTime
        );

        const blockedEnd = timeToMinutes(
          slot.endTime
        );

        return (
          requestedStartMinutes < blockedEnd &&
          requestedEndMinutes > blockedStart
        );
      }
    );

    if (blockedSlot) {
      return res.status(409).json({
        success: false,
        message: "This time slot is blocked and unavailable",
      });
    }

    /*
      Use override availability when available.
      Otherwise use weekly availability.
    */
    const overrideSlots =
      dateSpecificAvailability.filter(
        (slot) => slot.type === "override"
      );

    const availableSlots =
      overrideSlots.length > 0
        ? overrideSlots
        : weeklyAvailability;

    const fitsAvailability = availableSlots.some(
      (slot) => {
        const slotStart = timeToMinutes(
          slot.startTime
        );

        const slotEnd = timeToMinutes(
          slot.endTime
        );

        const requiredBuffer =
          Number(slot.bufferMinutes) || 0;

        return (
          requestedStartMinutes >= slotStart &&
          requestedEndMinutes <=
            slotEnd - requiredBuffer
        );
      }
    );

    if (!fitsAvailability) {
      return res.status(409).json({
        success: false,
        message:
          "Selected time is outside therapist availability",
      });
    }

    /*
      Double-booking prevention.

      Any existing session overlapping the requested
      interval will reject the booking.
    */
    const overlappingSession = await Session.findOne({
      therapist: req.therapistId,
      status: {
        $in: ["scheduled", "confirmed"],
      },
      startAt: {
        $lt: end,
      },
      endAt: {
        $gt: start,
      },
    });

    if (overlappingSession) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    /*
      Create the booking and consume the package
      inside one MongoDB transaction.
    */
    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      const [session] = await Session.create(
        [
          {
            therapist: req.therapistId,
            client: clientId,
            clientPackage: clientPackage._id,
            startAt: start,
            endAt: end,
            durationMinutes: duration,
            timezone:
              timezone ||
              client.timezone ||
              "Asia/Kolkata",
            status: "confirmed",
            bookingSource:
              bookingSource === "therapist"
                ? "therapist"
                : "client",
          },
        ],
        {
          session: dbSession,
        }
      );

      await consumeSession({
        therapistId: req.therapistId,
        clientId,
        session: dbSession,
      });

      await dbSession.commitTransaction();

      await notifyBookingConfirmed({
        therapistId: req.therapistId,
        clientId,
        sessionId: session._id,
        startAt: session.startAt,
      });

      await sendWhatsAppStub({
        therapistId: req.therapistId,
        clientId,
        sessionId: session._id,
        eventType: "booking_confirmed",
        message: `Your therapy session has been confirmed for ${new Date(
          session.startAt
        ).toLocaleString("en-IN")}.`,
      });

      return res.status(201).json({
        success: true,
        message: "Session booked successfully",
        session,
      });
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      await dbSession.endSession();
    }
  } catch (error) {
    next(error);
  }
};



const getPublicAvailability = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const Therapist = require("../models/Therapist");

    const therapist = await Therapist.findOne({
      slug: slug.toLowerCase(),
    }).select("_id name slug");

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    console.log(
      "PUBLIC THERAPIST ID:",
      therapist._id.toString()
    );

    const availability = await Availability.find({
      therapist: therapist._id,
      isActive: true,
      type: {
        $in: ["weekly", "override"],
      },
    })
      .select(
        "type dayOfWeek date startTime endTime sessionDuration bufferMinutes timezone"
      )
      .sort({
        dayOfWeek: 1,
        startTime: 1,
      });

    console.log(
      "PUBLIC AVAILABILITY:",
      availability
    );

    res.status(200).json({
      success: true,
      therapist: {
        name: therapist.name,
        slug: therapist.slug,
      },
      availability,
    });
  } catch (error) {
    next(error);
  }
};

const completeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      therapist: req.therapistId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Session is already completed",
      });
    }

    if (["cancelled", "no_show"].includes(session.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a ${session.status} session`,
      });
    }

    session.status = "completed";

    await session.save();
await notifyPostSession({
  therapistId: session.therapist,
  clientId: session.client,
  sessionId: session._id,
});

    res.status(200).json({
      success: true,
      message: "Session completed successfully",
      session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  createBooking,
  getTherapistSessions,
  getPublicAvailability,
  completeSession,
};