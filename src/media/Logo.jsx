import React from "react";

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 10a2 2 0 114 0 2 2 0 01-4 0zm6-6a2 2 0 114 0 2 2 0 01-4 0zm6 12a2 2 0 114 0 2 2 0 01-4 0z" />
            <path d="M6 10h8M8 4h4M10 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <span className="font-bold text-gray-900 text-base sm:text-lg md:text-xl">
        TalentFlow
      </span>
    </div>
  );
};

export default Logo;
