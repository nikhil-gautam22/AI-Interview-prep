import { useContext, useState } from "react";
import { LuSparkles } from "react-icons/lu";

import HERO_IMG from "../assets/hero_img.png";
import { APP_FEATURES } from "../utils/data";

import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import Modal from "../components/Modal";
import { UserContext } from "../Context/userContext";
import { useNavigate } from "react-router-dom";
import ProfileInfoCard from "../components/Cards/ProfileInfoCard";

const LandingPage = () => {
   
  const {user}=useContext(UserContext);
  const navigate=useNavigate();

  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const handleCTA=()=>{
    if(!user){
      setOpenAuthModal(true);
    }
    else{
      navigate('/dashboard');
    }
  }

  return (
    <>
      {/* HERO SECTION */}
      <div className="w-full min-h-screen bg-[#FFFCEF] relative overflow-hidden">
        <div className="w-[520px] h-[520px] bg-amber-200/30 blur-[80px] absolute -top-20 -left-20" />

        <div className="container mx-auto px-4 pt-6 pb-56 relative z-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-20">
            <h1 className="text-xl font-bold text-black">
              AI Interview Preparation
            </h1>

           {user ? (<ProfileInfoCard />
           ):( <button
              onClick={() => {
                setOpenAuthModal(true);
                setCurrentPage("login");
              }}
              className="bg-gradient-to-r from-[#FF9324] to-[#E9A24B]
              text-sm font-semibold text-white px-7 py-2.5 rounded-full
              hover:opacity-90 transition"
            >
              Login / Sign Up
            </button>
           )}
          </header>

          {/* Hero Content */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left */}
            <div className="w-full md:w-1/2">
              <div className="inline-flex items-center gap-2 text-[13px] text-amber-700 font-semibold bg-amber-100 px-3 py-1 rounded-full border border-amber-300 mb-4">
                <LuSparkles />
                AI Powered Learning
              </div>

              <h2 className="text-5xl font-semibold text-black leading-tight mb-6">
                Ace Interviews With <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                  AI-Powered
                </span>{" "}
                Preparation
              </h2>

              <p className="text-gray-700 text-lg mb-8 max-w-xl">
                Practice role-specific interview questions, understand concepts
                deeply, and stay confident with a smart, structured interview
                preparation experience.
              </p>

              <button
                onClick={() => {
                  setOpenAuthModal(true);
                  setCurrentPage("signup");
                }}
                className="bg-red-500 text-white font-semibold px-8 py-3 rounded-full
                hover:bg-red-600 transition"
              >
                Get Started Free
              </button>
            </div>

            {/* Right */}
            <div className="w-full md:w-1/2">
              <img
                src={HERO_IMG}
                alt="AI Interview Preparation"
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="w-full bg-[#FFFCEF]">
        <div className="container mx-auto px-4 py-20">
          <h3 className="text-2xl font-semibold text-center mb-14">
            Features That <span className="text-amber-600">Make You Shine</span>
          </h3>

          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {APP_FEATURES.slice(0, 3).map((feature) => (
                <div
                  key={feature.id}
                  className="bg-[#FFFEF8] p-6 rounded-xl border border-amber-100
                  shadow-sm hover:shadow-lg transition hover:-translate-y-1"
                >
                  <h4 className="font-semibold mb-3 text-gray-900">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {APP_FEATURES.slice(3).map((feature) => (
                <div
                  key={feature.id}
                  className="bg-[#FFFEF8] p-6 rounded-xl border border-amber-100
                  shadow-sm hover:shadow-lg transition hover:-translate-y-1"
                >
                  <h4 className="font-semibold mb-3 text-gray-900">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-50 text-center text-sm text-gray-600 py-6">
        Made with ❤️ by{" "}
        <span className="text-red-500 font-semibold">Nikhil Gautam</span>
      </footer>

      {/* AUTH MODAL */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        {currentPage === "login" && (
          <Login setCurrentPage={setCurrentPage} />
        )}
        {currentPage === "signup" && (
          <SignUp setCurrentPage={setCurrentPage} />
        )}
      </Modal>
    </>
  );
};

export default LandingPage;
