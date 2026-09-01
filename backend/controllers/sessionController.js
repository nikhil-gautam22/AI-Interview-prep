const Session = require("../models/Session");
const Question = require("../models/Question");

/* ================= CREATE SESSION ================= */
exports.createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description } = req.body;
    const rawQuestions = Array.isArray(req.body.question)
      ? req.body.question
      : Array.isArray(req.body.questions)
      ? req.body.questions
      : [];

    const userId = req.user._id;

    if (!role || !experience || !topicsToFocus) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: role, experience, and topicsToFocus are required",
      });
    }

    // create session
    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description: description || "",
      question: [],
    });

    // create questions if provided
    if (rawQuestions.length > 0) {
      const createdQuestions = await Question.insertMany(
        rawQuestions.map((q) => ({
          session: session._id,
          question: q.question,
          answer: q.answer,
        }))
      );

      session.question = createdQuestions.map((q) => q._id);
      await session.save();
    }

    const populatedSession = await Session.findById(session._id).populate({
      path: "question",
      options: { sort: { isPinned: -1, createdAt: 1 } },
    });

    res.status(201).json({
      success: true,
      session: populatedSession,
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/* ================= GET MY SESSIONS (DASHBOARD) ================= */
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("question");

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/* ================= GET SESSION BY ID ================= */
exports.getSessionById = async (req, res) => {
  try {
    const sessionId = req.params.id || req.params.sessionId;

    const session = await Session.findById(sessionId).populate({
      path: "question",
      options: { sort: { isPinned: -1, createdAt: 1 } },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check authorization
    if (session.user && session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this session",
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Get session by id error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/* ================= DELETE SESSION ================= */
exports.deleteSession = async (req, res) => {
  try {
    const sessionId = req.params.id || req.params.sessionId;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.user && session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this session",
      });
    }

    await Question.deleteMany({ session: session._id });
    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Delete session error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

