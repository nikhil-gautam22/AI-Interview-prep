import React from "react";

const RoleInfoheader = ({
  role,
  topicsToFocus,
  experience,
  question,
  lastUpdated,
}) => {
  return (
    <div className="w-full bg-white rounded-xl p-6">
      {/* Role */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        {role || "Role"}
      </h1>

      {/* Topics */}
      <p className="text-sm text-gray-500 mb-4">
        {topicsToFocus || "Topics to focus"}
      </p>

      {/* Pills / Badges */}
      <div className="flex flex-wrap gap-2">
        {/* Experience */}
        <span className="px-3 py-1 text-xs font-medium text-white bg-black rounded-full">
          Experience · {experience || 0}{" "}
          {experience === 1 ? "Year" : "Years"}
        </span>

        {/* Q&A */}
        <span className="px-3 py-1 text-xs font-medium text-white bg-black rounded-full">
          Q&A · {question || 0}
        </span>

        {/* Last Updated */}
        <span className="px-3 py-1 text-xs font-medium text-white bg-black rounded-full">
          Last Updated · {lastUpdated || "N/A"}
        </span>
      </div>
    </div>
  );
};

export default RoleInfoheader;
