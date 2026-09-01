const Question = require("../models/Question");
const Session = require("../models/Session");

exports.addQuestionToSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        let rawQuestions = req.body.questions || req.body.question;

        if (!sessionId) {
            return res.status(400).json({ success: false, message: "sessionId is required" });
        }

        if (!rawQuestions) {
            return res.status(400).json({ success: false, message: "questions data is required" });
        }

        if (!Array.isArray(rawQuestions)) {
            rawQuestions = [rawQuestions];
        }

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        const createdQuestions = await Question.insertMany(
            rawQuestions.map((q) => ({
                session: sessionId,
                question: q.question,
                answer: q.answer,
            }))
        );

        if (!Array.isArray(session.question)) {
            session.question = [];
        }

        session.question.push(...createdQuestions.map((q) => q._id));
        await session.save();

        res.status(201).json({
            success: true,
            questions: createdQuestions,
        });

    } catch (error) {
        console.error("Add question error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

exports.togglePinQuestion = async (req, res) => {
    try {
        const questionId = req.params.id || req.params.questionId;
        const question = await Question.findById(questionId);

        if (!question) {
            return res
                .status(404)
                .json({ success: false, message: "Question not found" });
        }

        question.isPinned = !question.isPinned;
        await question.save();

        res.status(200).json({ success: true, question });

    } catch (error) {
        console.error("Toggle pin error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

exports.updateQuestionNote = async (req, res) => {
    try {
        const questionId = req.params.id || req.params.questionId;
        const { note } = req.body;
        const question = await Question.findById(questionId);

        if (!question) {
            return res
                .status(404)
                .json({ success: false, message: "Question not found" });
        }

        question.note = note || "";
        await question.save();

        res.status(200).json({ success: true, question });

    } catch (error) {
        console.error("Update note error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
