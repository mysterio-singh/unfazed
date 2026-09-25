const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const Client = require("../models/Client");
const Session = require("../models/Session");

const createPaymentOrder = async (req, res, next) => {
  try {
    const {
      clientId,
      sessionId,
      amount,
    } = req.body;

    if (!clientId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Client and amount are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

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

    let session = null;

    if (sessionId) {
      session = await Session.findOne({
        _id: sessionId,
        therapist: req.therapistId,
        client: clientId,
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `unfazed_${Date.now()}`,
    });

    const payment = await Payment.create({
      therapist: req.therapistId,
      client: clientId,
      session: sessionId || null,
      gateway_order_id: order.id,
      amount: Number(amount),
      platform_fee: 0,
      net_amount: Number(amount),
      currency: "INR",
      status: "created",
    });

    res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      payment: {
        id: payment._id,
        status: payment.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createPublicPaymentOrder = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const {
      name,
      email,
      phone,
      startAt,
      durationMinutes,
      timezone,
      consentGiven,
      amount,
    } = req.body;

    if (
      !name ||
      !email ||
      !startAt ||
      !durationMinutes ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, start time, duration and amount are required",
      });
    }

    if (consentGiven !== true) {
      return res.status(400).json({
        success: false,
        message: "Client consent is required before payment",
      });
    }

    if (![30, 45, 60, 90].includes(Number(durationMinutes))) {
      return res.status(400).json({
        success: false,
        message: "Invalid session duration",
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

    const Therapist = require("../models/Therapist");

    const therapist = await Therapist.findOne({
      slug: slug.toLowerCase(),
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    const overlappingSession = await Session.findOne({
      therapist: therapist._id,
      status: {
        $in: [
          "pending_payment",
          "scheduled",
          "confirmed",
        ],
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

    let client = await Client.findOne({
      therapist: therapist._id,
      email: email.toLowerCase().trim(),
    });

    if (!client) {
      client = await Client.create({
        therapist: therapist._id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || "",
        timezone: timezone || "Asia/Kolkata",
        consentGiven: true,
        consentTimestamp: new Date(),
        status: "active",
      });
    } else {
      client.name = name.trim();

      if (phone !== undefined) {
        client.phone = phone.trim();
      }

      if (!client.consentGiven) {
        client.consentGiven = true;
        client.consentTimestamp = new Date();
      }

      await client.save();
    }

    const session = await Session.create({
      therapist: therapist._id,
      client: client._id,
      startAt: start,
      endAt: end,
      durationMinutes: duration,
      timezone: timezone || "Asia/Kolkata",
      status: "pending_payment",
      bookingSource: "client",
    });

    const amountInPaise = Math.round(
      Number(amount) * 100
    );

    if (amountInPaise <= 0) {
      await Session.findByIdAndUpdate(session._id, {
        status: "cancelled",
      });

      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `unfazed_${Date.now()}`,
      notes: {
        therapistId: therapist._id.toString(),
        clientId: client._id.toString(),
        sessionId: session._id.toString(),
      },
    });

    const payment = await Payment.create({
      therapist: therapist._id,
      client: client._id,
      session: session._id,
      gateway_order_id: order.id,
      amount: Number(amount),
      platform_fee: 0,
      net_amount: Number(amount),
      currency: "INR",
      status: "created",
    });

    res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      payment: {
        id: payment._id,
        status: payment.status,
      },
      session: {
        id: session._id,
        startAt: session.startAt,
        endAt: session.endAt,
        durationMinutes: session.durationMinutes,
        status: session.status,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
      sessionId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !paymentId ||
      !sessionId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    const crypto = require("crypto");

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (payment.gateway_order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment order mismatch",
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    payment.gateway_transaction_id =
      razorpay_payment_id;

    payment.status = "paid";

    await payment.save();

    session.status = "confirmed";

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment._id,
        status: payment.status,
      },
      session: {
        id: session._id,
        status: session.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const crypto = require("crypto");

    const webhookSignature =
      req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Webhook signature missing",
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(req.body)
      .digest("hex");

    if (generatedSignature !== webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const paymentEntity =
        event.payload.payment.entity;

      const razorpayOrderId =
        paymentEntity.order_id;

      const razorpayPaymentId =
        paymentEntity.id;

      const payment = await Payment.findOne({
        gateway_order_id: razorpayOrderId,
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found",
        });
      }

      if (payment.status !== "paid") {
        payment.gateway_transaction_id =
          razorpayPaymentId;

        payment.status = "paid";

        await payment.save();
      }

      if (payment.session) {
        await Session.findByIdAndUpdate(
          payment.session,
          {
            status: "confirmed",
          }
        );
      }
    }

    if (event.event === "payment.failed") {
      const paymentEntity =
        event.payload.payment.entity;

      const razorpayOrderId =
        paymentEntity.order_id;

      const payment = await Payment.findOne({
        gateway_order_id: razorpayOrderId,
      });

      if (payment) {
        payment.status = "failed";
        await payment.save();

        if (payment.session) {
          await Session.findByIdAndUpdate(
            payment.session,
            {
              status: "cancelled",
            }
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  createPaymentOrder,
  createPublicPaymentOrder,
  verifyPayment,
  handleRazorpayWebhook,
};