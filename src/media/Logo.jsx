import React from "react";

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        {/* Indigo gradient background */}
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
          {/* New SVG icon – two people silhouettes */}
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 11a4 4 0 100-8 4 4 0 000 8zM15 13c-1.306 0-2.418.835-2.83 2H8.83c-.412-1.165-1.524-2-2.83-2C3.347 13 2 14.343 2 16v2h12v-2c0-1.657-1.343-3-3-3zM17 11a3 3 0 100-6 3 3 0 000 6zm-1 2c-1.104 0-2 .896-2 2v3h6v-3c0-1.104-.896-2-2-2h-2z" />
          </svg>
        </div>
      </div>
      {/* Text part */}
      <span className="font-bold text-gray-900 text-base sm:text-lg md:text-xl">
        TalentFlow
      </span>
    </div>
  );
};

export default Logo;
