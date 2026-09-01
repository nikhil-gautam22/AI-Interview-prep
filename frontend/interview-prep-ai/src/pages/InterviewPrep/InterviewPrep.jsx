import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import {toast} from "react-hot-toast";
import RoleInfoheader from "./Component/RoleInfoheader";
import QuestionCard from "../../components/Cards/QuestionCard";
import AIResponsePreview from "./Component/AIResponsePreview";
import DashboardLayout from '../../components/layouts/DashboardLayout'
import Drawer from "../../components/Loader/Drawer";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPath";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";


const InterviewPrep = () => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

  const fetchSessionDetailsById = async () => {
    try {
      setIsPageLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if (response.data?.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      toast.error(error.response?.data?.message || "Failed to load session");
    } finally {
      setIsPageLoading(false);
    }
  };

  const generateConceptExplaination = async (question) => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      setExplanation(null);
      setOpenLearnMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question }
      );

      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    try {
      // Optimistic UI update
      setSessionData((prev) => {
        if (!prev || !prev.question) return prev;
        return {
          ...prev,
          question: prev.question.map((q) =>
            q._id === questionId ? { ...q, isPinned: !q.isPinned } : q
          ),
        };
      });

      await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
    } catch (error) {
      console.error("Error toggling pin:", error);
      fetchSessionDetailsById();
    }
  };

  const uploadMoreQuestion = async () => {
    try {
      setIsUpdateLoader(true);

      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
      );
      if (response.data) {
        toast.success("Added More Q&A !");
        fetchSessionDetailsById();
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };
   useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
  }, [sessionId]);

  return (
    <DashboardLayout>
      {isPageLoading ? (
        <div className="container mx-auto pt-6 pb-6 px-4 md:px-0">
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-24"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-32"></div>
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </div>
        </div>
      ) : !sessionData ? (
        <div className="container mx-auto pt-16 pb-16 px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Session Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The requested interview preparation session could not be found or you may not be authorized to view it.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      ) : (
        <>
          <RoleInfoheader
            role={sessionData?.role || ""}
            topicsToFocus={sessionData?.topicsToFocus || ""}
            experience={sessionData?.experience || ""}
            question={sessionData?.question || []}
            description={sessionData?.description || ""}
            lastUpdated={
              sessionData?.updatedAt
                ? moment(sessionData.updatedAt).format("Do MMM YYYY")
                : ""
            }
          />

          <div className="container mx-auto pt-4 pb-4 px-4 md:px-0">
            <h2 className="text-lg font-semibold text-black">Interview Q & A</h2>

            <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
              <div
                className={`col-span-12 ${
                  openLearnMoreDrawer ? "md:col-span-7" : "md:col-span-8"
                }`}
              >
                <AnimatePresence>
                  {sessionData?.question?.map((data, index) => (
                    <motion.div
                      key={data._id || index}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.4,
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        delay: index * 0.1,
                      }}
                      layout
                    >
                      <QuestionCard
                        question={data.question}
                        answer={data.answer}
                        isPinned={data.isPinned}
                        onLearnMore={() =>
                          generateConceptExplaination(data.question)
                        }
                        onTogglePin={() => toggleQuestionPinStatus(data._id)}
                      />

                      {!isLoading &&
                        sessionData?.question?.length === index + 1 && (
                          <div className="flex items-center justify-center mt-5">
                            <button
                              className="flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer"
                              disabled={isLoading || isUpdateLoader}
                              onClick={uploadMoreQuestion}
                            >
                              {isUpdateLoader ? (
                                <SpinnerLoader />
                              ) : (
                                <LuListCollapse className="text-lg" />
                              )}{" "}
                              Load More
                            </button>
                          </div>
                        )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <Drawer
              isOpen={openLearnMoreDrawer}
              onClose={() => setOpenLearnMoreDrawer(false)}
              title={!isLoading && explanation?.title}
            >
              {errorMsg && (
                <p className="flex gap-2 text-sm text-amber-600 font-medium">
                  <LuCircleAlert className="mt-1" />
                  {errorMsg}
                </p>
              )}

              {isLoading && <SkeletonLoader />}

              {!isLoading && explanation && (
                <AIResponsePreview
                  content={explanation.explanation || explanation.explaination}
                />
              )}
            </Drawer>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default InterviewPrep;
