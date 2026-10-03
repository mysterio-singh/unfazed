const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const Client = require("../models/Client");
const Session = require("../models/Session");
const Package = require("../models/Package");
const Therapist = require("../models/Therapist");
const ClientPackage = require("../models/ClientPackage");
const { generateInvoicePDF } = require("../services/invoiceService");
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
      package: selectedPackage._id,
      gateway_order_id: order.id,
      amount: paymentAmount,
platform_fee: 0,
net_amount: paymentAmount,
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
      package: {
  id: selectedPackage._id,
  name: selectedPackage.name,
  sessionCount: selectedPackage.sessionCount,
  totalAmount: selectedPackage.totalAmount,
  validityDays: selectedPackage.validityDays,
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

const createPublicPaymentOrder = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      presentingConcern,
      startAt,
      durationMinutes,
      timezone,
      consentGiven,
      packageId,
    } = req.body;

    if (
      !name ||
      !email ||
      !startAt ||
      !durationMinutes ||
      !packageId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, start time, duration and package are required",
      });
    }

    if (!dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Date of birth is required",
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

    // Calculate age from date of birth
    const dob = new Date(dateOfBirth);

    if (Number.isNaN(dob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      });
    }

    if (dob > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Date of birth cannot be in the future",
      });
    }

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const monthDifference =
      today.getMonth() - dob.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < dob.getDate())
    ) {
      age--;
    }

    if (age < 0 || age > 120) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date of birth",
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

    const selectedPackage = await Package.findOne({
      _id: packageId,
      therapist: therapist._id,
      isActive: true,
    });

    if (!selectedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found or inactive",
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

        demographics: {
          age,
          gender: gender || "",
        },

        presentingConcern:
          presentingConcern?.trim() || "",

        consentGiven: true,
        consentTimestamp: new Date(),
        status: "active",
      });
    } else {
      client.name = name.trim();

      if (phone !== undefined) {
        client.phone = phone.trim();
      }

      client.timezone =
        timezone || client.timezone || "Asia/Kolkata";

      client.demographics = {
        ...(client.demographics?.toObject?.() ||
          client.demographics ||
          {}),
        age,
        gender:
          gender !== undefined
            ? gender
            : client.demographics?.gender || "",
      };

      if (presentingConcern !== undefined) {
        client.presentingConcern =
          presentingConcern.trim();
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

    const paymentAmount = Number(
      selectedPackage.totalAmount
    );

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      await Session.findByIdAndUpdate(session._id, {
        status: "cancelled",
      });

      return res.status(400).json({
        success: false,
        message: "Invalid package amount",
      });
    }

    const amountInPaise = Math.round(
      paymentAmount * 100
    );

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
      package: selectedPackage._id,
      gateway_order_id: order.id,
      amount: paymentAmount,
      platform_fee: 0,
      net_amount: paymentAmount,
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
const cancelPublicPayment = async (req, res, next) => {
  try {
    const { paymentId, sessionId } = req.body;

    if (!paymentId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and session ID are required",
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Paid payment cannot be cancelled",
      });
    }

    payment.status = "failed";
    await payment.save();

    const session = await Session.findById(sessionId);

    if (session && session.status === "pending_payment") {
      session.status = "cancelled";
      await session.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment cancelled and slot released",
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
    const jwt = require("jsonwebtoken");

    // Verify Razorpay signature
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

    // Find payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Verify Razorpay order belongs to this payment
    if (payment.gateway_order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment order mismatch",
      });
    }

    // Verify payment is linked to the requested session
    if (
      !payment.session ||
      payment.session.toString() !== sessionId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment and session mismatch",
      });
    }

    // Find session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify payment and session belong to the same client
    if (
      !payment.client ||
      !session.client ||
      payment.client.toString() !== session.client.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment and session client mismatch",
      });
    }

    // Mark payment as paid
    payment.gateway_transaction_id = razorpay_payment_id;
    payment.status = "paid";
    await payment.save();

    // Confirm session
    session.status = "confirmed";
    await session.save();

    // Create secure Client Portal token
    const clientToken = jwt.sign(
      {
        clientId: payment.client.toString(),
        therapistId: payment.therapist.toString(),
        role: "client",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

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

      clientPortal: {
        token: clientToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const crypto = require("crypto");

    console.log("🔔 Razorpay webhook received");

    const webhookSignature =
      req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      console.log("❌ Webhook signature missing");

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
      console.log("❌ Invalid webhook signature");

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    console.log("✅ Webhook signature verified");

    const event = JSON.parse(req.body.toString());

    console.log("📩 Razorpay event:", event.event);

    if (event.event === "payment.captured") {
  const paymentEntity = event.payload.payment.entity;

  const razorpayOrderId = paymentEntity.order_id;
  const razorpayPaymentId = paymentEntity.id;

  console.log("💰 Payment captured");
  console.log("Order ID:", razorpayOrderId);
  console.log("Payment ID:", razorpayPaymentId);

  const payment = await Payment.findOne({
    gateway_order_id: razorpayOrderId,
  });

  if (!payment) {
    console.log("❌ Payment record not found");

    return res.status(404).json({
      success: false,
      message: "Payment record not found",
    });
  }

  // Mark payment as PAID
  if (payment.status !== "paid") {
    payment.gateway_transaction_id = razorpayPaymentId;
    payment.status = "paid";

    await payment.save();

    console.log("✅ Payment marked as PAID");
  } else {
    console.log("ℹ️ Payment already marked as PAID");
  }

  // Confirm session
  if (payment.session) {
    await Session.findByIdAndUpdate(
      payment.session,
      {
        status: "confirmed",
      }
    );

    console.log("✅ Session marked as CONFIRMED");
  }

  // Create ClientPackage only once
  const existingClientPackage = await ClientPackage.findOne({
  payment: payment._id,
});

if (!existingClientPackage) {
  const selectedPackage = await Package.findById(payment.package);

  if (!selectedPackage) {
    console.log("❌ Package not found for payment");
  } else {
    const purchasedAt = new Date();

    const expiresAt = new Date(purchasedAt);
    expiresAt.setDate(
      expiresAt.getDate() + selectedPackage.validityDays
    );

    try {
      await ClientPackage.create({
        therapist: payment.therapist,
        client: payment.client,
        package: selectedPackage._id,
        payment: payment._id,
        sessionsTotal: selectedPackage.sessionCount,
        sessionsRemaining: selectedPackage.sessionCount,
        purchasedAt,
        expiresAt,
        status: "active",
      });

      console.log("✅ Client package created");
      console.log("📦 Package:", selectedPackage.name);
      console.log("🎟️ Sessions:", selectedPackage.sessionCount);
      console.log("📅 Expires:", expiresAt.toISOString());
    } catch (error) {
      if (error.code === 11000) {
        console.log("ℹ️ Client package already exists");
      } else {
        throw error;
      }
    }
  }
} else {
  console.log("ℹ️ Client package already exists");
}
}

    if (event.event === "payment.failed") {
      const paymentEntity =
        event.payload.payment.entity;

      const razorpayOrderId =
        paymentEntity.order_id;

      console.log("❌ Payment failed");
      console.log("Order ID:", razorpayOrderId);

      const payment = await Payment.findOne({
        gateway_order_id: razorpayOrderId,
      });

      if (payment) {
        payment.status = "failed";

        await payment.save();

        console.log("⚠️ Payment marked as FAILED");

        if (payment.session) {
          await Session.findByIdAndUpdate(
            payment.session,
            {
              status: "cancelled",
            }
          );

          console.log("⚠️ Session marked as CANCELLED");
        }
      }
    }

    console.log("✅ Webhook processed successfully");

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.log("❌ Webhook processing error:", error);
    next(error);
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const payment = await Payment.findById(paymentId)
      .populate("therapist")
      .populate("client")
      .populate("package");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Therapist can only access their own invoice
    if (
      !req.therapistId ||
      payment.therapist._id.toString() !== req.therapistId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this invoice",
      });
    }

    if (payment.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Invoice is available only after successful payment",
      });
    }

    const pdfBuffer = await generateInvoicePDF({
      payment,
      therapist: payment.therapist,
      client: payment.client,
      packageData: payment.package,
    });

    const invoiceNumber = `UNF-${payment._id
      .toString()
      .slice(-8)
      .toUpperCase()}`;

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoiceNumber}.pdf"`
    );

    res.setHeader("Content-Length", pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  createPublicPaymentOrder,
  cancelPublicPayment,
  verifyPayment,
  handleRazorpayWebhook,
  downloadInvoice,
};