const { GoogleGenAI } = require("@google/genai");
const { conceptExplainPrompt, questionAnswerPrompt } = require("../utils/prompts");

// Helper function to extract and parse JSON from AI responses
function parseAiJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from AI model");
  }

  let text = rawText.trim();
  // Strip markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // Attempt to locate outermost JSON array or object
    const firstBracket = text.indexOf("[");
    const firstBrace = text.indexOf("{");
    let startIdx = -1;
    let endIdx = -1;

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket;
      endIdx = text.lastIndexOf("]");
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
      endIdx = text.lastIndexOf("}");
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonCandidate = text.substring(startIdx, endIdx + 1);
      return JSON.parse(jsonCandidate);
    }

    throw new Error("Unable to parse valid JSON from AI response: " + text.slice(0, 100));
  }
}

// Fallback questions generator if API key is invalid, leaked, or rate-limited
function generateFallbackQuestions(role, experience, topicsToFocus, count = 10) {
  const topics = topicsToFocus
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const primaryTopic = topics[0] || role;

  const templates = [
    {
      question: `What are the fundamental core concepts of ${primaryTopic}?`,
      answer: `The fundamental concepts of ${primaryTopic} include architecture, lifecycle management, state handling, and component modularity. Understanding these ensures high performance, clean separation of concerns, and maintainable code.`,
    },
    {
      question: `How does memory management and performance optimization work in ${primaryTopic}?`,
      answer: `Performance optimization in ${primaryTopic} involves minimizing unnecessary re-renders, managing garbage collection, utilizing caching/memoization, and profiling bottlenecks using standard debugging tools.`,
    },
    {
      question: `Can you explain asynchronous handling and error boundaries in ${primaryTopic}?`,
      answer: `Asynchronous operations are managed using promises, async/await, and event loops. Error boundaries or try-catch wrappers catch runtime exceptions to prevent application crashes and provide fallback UI.`,
    },
    {
      question: `What are best practices for state management and data flow in ${primaryTopic}?`,
      answer: `Best practices include keeping state immutable, lifting state up when shared across components, using centralized stores for global state, and maintaining unidirectional data flow.`,
    },
    {
      question: `How do you secure applications built with ${primaryTopic} against common vulnerabilities?`,
      answer: `Security practices include sanitizing user inputs to prevent XSS and SQL injection, enforcing HTTPS, implementing CORS policies, securing JWT/session storage, and managing role-based access control.`,
    },
    {
      question: `Explain the difference between synchronous and asynchronous execution in ${primaryTopic}.`,
      answer: `Synchronous execution blocks subsequent tasks until the current one finishes, while asynchronous execution schedules tasks in an event loop or background worker, allowing the main thread to continue execution without blocking.`,
    },
    {
      question: `How do you write unit and integration tests for ${primaryTopic}?`,
      answer: `Testing involves writing unit tests for isolated functions/components using frameworks (like Jest, Mocha, or Vitest) and integration tests with mocks to verify interactions between services and APIs.`,
    },
    {
      question: `What is the difference between client-side rendering and server-side rendering in ${primaryTopic}?`,
      answer: `Client-Side Rendering (CSR) downloads a minimal HTML bundle and renders UI in the browser, while Server-Side Rendering (SSR) compiles the initial HTML on the server for faster First Contentful Paint (FCP) and better SEO.`,
    },
    {
      question: `How do you handle pagination, caching, and rate limiting in ${primaryTopic}?`,
      answer: `Pagination can be offset-based or cursor-based to limit payload sizes. Caching is implemented via Redis or HTTP cache headers, and rate limiting prevents abuse using sliding window counters or token buckets.`,
    },
    {
      question: `Explain how you would design a scalable architecture for a high-traffic ${role} application.`,
      answer: `A scalable architecture uses load balancing, horizontal scaling, database indexing and replication, asynchronous background queues, microservices or modular monoliths, and CDN distribution for static assets.`,
    },
  ];

  return templates.slice(0, count);
}

// Fallback concept explanation
function generateFallbackExplanation(question) {
  return {
    title: `Understanding: ${question.slice(0, 50)}...`,
    explanation: `### Overview\nThis question assesses your foundational understanding of software development principles and practical problem-solving.\n\n### Key Concepts\n- **Core Principle:** How the underlying mechanism operates under real-world conditions.\n- **Best Practices:** Writing maintainable, modular, and testable code.\n- **Trade-offs:** Balancing performance, simplicity, and development velocity.\n\n### Practical Example\n\`\`\`javascript\n// Example demonstrating clean handling\nasync function handleOperation() {\n  try {\n    const data = await executeTask();\n    return data;\n  } catch (error) {\n    console.error("Operation failed:", error);\n    throw error;\n  }\n}\n\`\`\`\n\n### Summary\nEnsure you clearly articulate both the high-level architecture and edge-case considerations during the interview.`,
    explaination: `### Overview\nThis question assesses your foundational understanding of software development principles and practical problem-solving.\n\n### Key Concepts\n- **Core Principle:** How the underlying mechanism operates under real-world conditions.\n- **Best Practices:** Writing maintainable, modular, and testable code.\n- **Trade-offs:** Balancing performance, simplicity, and development velocity.\n\n### Practical Example\n\`\`\`javascript\n// Example demonstrating clean handling\nasync function handleOperation() {\n  try {\n    const data = await executeTask();\n    return data;\n  } catch (error) {\n    console.error("Operation failed:", error);\n    throw error;\n  }\n}\n\`\`\`\n\n### Summary\nEnsure you clearly articulate both the high-level architecture and edge-case considerations during the interview.`,
  };
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelCandidates = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ].filter(Boolean);

  let lastError = null;
  for (const model of modelCandidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const rawText =
        response.text ||
        response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        return rawText;
      }
    } catch (err) {
      lastError = err;
      // If error is 403 (leaked key) or 401, trying other models won't help
      if (err.message && (err.message.includes("leaked") || err.message.includes("API key not valid"))) {
        throw err;
      }
    }
  }

  throw lastError || new Error("Failed to get response from Gemini AI");
}

const generateInterViewQuestions = async (req, res) => {
  const { role, experience, topicsToFocus } = req.body;
  const numberOfQuestions =
    Number(req.body.numberOfQuestions || req.body.numberOfQuestion) || 10;

  if (!role || !experience || !topicsToFocus) {
    return res.status(400).json({
      message: "Missing required fields: role, experience, and topicsToFocus are required",
    });
  }

  const prompt = questionAnswerPrompt(
    role,
    experience,
    topicsToFocus,
    numberOfQuestions
  );

  try {
    const rawText = await callGemini(prompt);
    const data = parseAiJson(rawText);

    if (!Array.isArray(data)) {
      throw new Error("AI did not return an array of questions");
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Gemini AI generation error:", error.message);

    // If API key is leaked or missing, we log the issue and provide fallback questions so users can continue testing
    console.warn("Using fallback questions generator due to AI error:", error.message);
    const fallback = generateFallbackQuestions(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );
    return res.status(200).json(fallback);
  }
};

const generateConceptExplanation = async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: "Missing required field: question" });
  }

  const prompt = conceptExplainPrompt(question);

  try {
    const rawText = await callGemini(prompt);
    const data = parseAiJson(rawText);

    const result = {
      title: data.title || "Concept Explanation",
      explanation: data.explanation || data.explaination || rawText,
      explaination: data.explanation || data.explaination || rawText,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Gemini AI explanation error:", error.message);
    const fallback = generateFallbackExplanation(question);
    return res.status(200).json(fallback);
  }
};

module.exports = { generateInterViewQuestions, generateConceptExplanation };
