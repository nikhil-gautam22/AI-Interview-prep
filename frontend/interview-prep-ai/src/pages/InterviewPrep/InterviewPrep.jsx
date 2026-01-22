import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert } from "react-icons/lu";
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
  const [errorMsg, setErrorMsg] = useState("");
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if (response.data?.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  const generateConceptExplaination = async (question) => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      setExplanation(null)
      setOpenLearnMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question }
      );

      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation(null)
      setErrorMsg("Failed to generate explanation. Please try again.");
       console.error("Error:",error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    try {
      await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
      fetchSessionDetailsById();
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const uploadMoreQuestion = async () =>{
    try{
      setIsUpdateLoader(true);

      const aiResponse =await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role : sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestion:10,
        }
      )

      const response =await axiosInstance.post (
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          question:generateQuestion,

        }
      );
      if (response.data) {
        toast.success("Added More Q&A !!");
        fetchSessionDetailsById();
      }
    }
     catch (error){
      if (error.response && error.response.data.message){
        setError(error.response.data.message);
      }else{
        serError("Something went wrong. Please try again.")
      }
     } 
     finally {
      setIsUpdateLoader(false);
     }

  }
   useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
  }, [sessionId]);

  return (
    <DashboardLayout>
      <RoleInfoheader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || ""}
        question={sessionData?.question || ""}
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
                  key={data._id}
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
                sessionData?.question?.length == index +1 && (
                  <div className="flex items-center justify-center mt-5">
                    <button 
                    className="flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer"
                    disabled={isLoading || isUpdateLoader}
                    onClick={uploadMoreQuestion}
                    >
                      {isUpdateLoader ? (
                        <SpinnerLoader />
                      ):(
                        <LuListCollapse clasName="text-lg" />

                      )} {" "}
                      Load More
                    </button>
                  </div>
                )
                }

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
            <AIResponsePreview content={explanation.explaination} />
          )}
        </Drawer>
      </div>
    </DashboardLayout>
  );
};

export default InterviewPrep;
