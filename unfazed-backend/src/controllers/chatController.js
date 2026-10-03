const ChatMessage = require("../models/ChatMessage");

const getChatHistory = async (req, res, next) => {
  try {
    const clientId = req.clientId;
    const therapistId = req.therapistId;

    const messages = await ChatMessage.find({
      client: clientId,
      therapist: therapistId,
    })
      .sort({ createdAt: 1 })
      .select("_id senderId senderRole message createdAt");

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

const getTherapistChatHistory = async (req, res, next) => {
  try {
    const therapistId = req.therapistId;
    const { clientId } = req.params;

    if (!therapistId || !clientId) {
      return res.status(400).json({
        success: false,
        message: "Therapist ID and client ID are required",
      });
    }

    const messages = await ChatMessage.find({
      therapist: therapistId,
      client: clientId,
    })
      .sort({ createdAt: 1 })
      .select("_id senderId senderRole message createdAt");

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getChatHistory,
  getTherapistChatHistory,
};