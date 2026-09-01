export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
  },

  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-questions",
    GENERATE_EXPLANATION: "/api/ai/generate-explaination",
  },

  SESSION: {
    CREATE: "/api/sessions",
    GET_ALL: "/api/sessions",
    GET_ONE: (id) => `/api/sessions/${id}`, // ✅ IMPORTANT
    DELETE: (id) => `/api/sessions/${id}`,
  },

  QUESTION: {
    ADD_TO_SESSION: "/api/questions/add",
    PIN: (id) => `/api/questions/${id}/pin`,
    NOTE: (id) => `/api/questions/${id}/note`,
  },
};
