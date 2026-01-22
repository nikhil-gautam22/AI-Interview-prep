import React from "react";
import { LuTrash2 } from "react-icons/lu";
import { getInitials } from "../../utils/helper";

const SummaryCard = ({
  colors = { bgcolor: "#F9FAFB" },
  role = "Role",
  topicsToFocus = "Topics not available",
  experience = 0,
  question = 0,
  description = "No description available",
  lastUpdated = "N/A",
  onSelect = () => {},
  onDelete = () => {},
}) => {
  return (
    <div
      onClick={onSelect}
      className="bg-white border border-gray-300/40 rounded-xl p-2 overflow-hidden cursor-pointer hover:shadow-xl shadow-gray-100 relative group"
    >
      <div
        className="rounded-lg p-4 relative"
        style={{
          background: colors?.bgcolor || "#F9FAFB",
        }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-md flex items-center justify-center mr-4">
            <span className="text-lg font-semibold text-black">
              {getInitials(role)}
            </span>
          </div>

          <div className="flex-grow">
            <h2 className="text-[17px] font-medium text-gray-900">
              {role}
            </h2>
            <p className="text-xs font-medium text-gray-900">
              {topicsToFocus}
            </p>
          </div>
        </div>

        <button
          className="hidden group-hover:flex items-center gap-2 text-xs text-rose-500 font-medium bg-rose-50 px-3 py-1 rounded border border-rose-100 hover:border-rose-200 absolute top-0 right-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <LuTrash2 />
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-[10px] font-medium text-black px-3 py-1 border border-gray-900 rounded-full">
            Experience: {experience}{" "}
            {Number(experience) === 1 ? "Year" : "Years"}
          </span>

          <span className="text-[10px] font-medium text-black px-3 py-1 border border-gray-900 rounded-full">
            {question} Q&A
          </span>

          <span className="text-[10px] font-medium text-black px-3 py-1 border border-gray-900 rounded-full">
            Last Update: {lastUpdated}
          </span>
        </div>

        <p className="text-[12px] text-gray-500 font-medium line-clamp-2 mt-3">
          {description}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;
