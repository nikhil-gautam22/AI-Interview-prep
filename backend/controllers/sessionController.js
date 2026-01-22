const Session = require("../models/Session");
const Question = require("../models/Question");

/* ================= CREATE SESSION ================= */
exports.createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description, question } = req.body;
    const userId = req.user._id;

    // create session
    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description,
    });

    // create questions
    const questionDocs = await Promise.all(
      question.map(async (q) => {
        const ques = await Question.create({
          session: session._id,
          question: q.question,
          answer: q.answer,
        });
        return ques._id;
      })
    );

    // attach questions to session
    session.question = questionDocs;
    await session.save();

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
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
      sessions, // ✅ IMPORTANT for dashboard
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ================= GET SESSION BY ID ================= */
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId)
      .populate({
        path: "question",
        options: { sort: { isPinned: -1, createdAt: 1 } },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // optional security check (recommended)
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
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
    });
  }
};

/* ================= DELETE SESSION ================= */
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
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
    });
  }
};
