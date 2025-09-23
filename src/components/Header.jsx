import React, { useState, useEffect, useRef } from "react";
import Logo from "../media/Logo";
import { useNavigate } from "react-router-dom";

const Header = () => {
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Candidates", path: "/candidates" },
    { name: "Assessments", path: "/assessments" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div onClick={() => navigate("/")} className="cursor-pointer">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Hamburger Menu for Mobile */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-indigo-600 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isMobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>

            {/* HR Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="cursor-pointer flex items-center space-x-3 text-gray-700 hover:text-indigo-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">Sahil</p>
                  <p className="text-xs text-gray-500">hr@company.com</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 py-6 flex justify-between items-center border-b border-gray-200">
          <Logo />
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 hover:text-indigo-600"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col mt-6 space-y-4 px-6">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className="text-gray-700 hover:text-indigo-600 font-medium text-lg text-left transition-colors duration-200"
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Blurred Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={toggleMobileMenu}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity"
        ></div>
      )}
    </header>
  );
};

export default Header;
