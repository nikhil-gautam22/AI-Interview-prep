import React from "react";
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
        <div className="container mx-auto h-16 px-4 md:px-0 flex items-center justify-between">
          
          {/* Logo / Title */}
          <Link
            to="/dashboard"
            className="group"
          >
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight group-hover:text-orange-500 transition-colors">
              AI Interview Preparation
            </h2>
          </Link>

          {/* Profile */}
          <ProfileInfoCard />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
