import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-400 to-indigo-600 text-white">
        <div className="container mx-auto px-6 py-20 flex flex-col-reverse md:flex-row items-center md:justify-between">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Welcome to Talent Flow Careers
            </h1>
            <p className="mb-6 text-lg sm:text-xl">
              Our HR team is dedicated to finding and nurturing the best talent.
              Explore open positions and track your application status easily.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <button
                onClick={() => navigate("/jobs")}
                className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                View Jobs
              </button>
              <button
                onClick={() => navigate("/candidates")}
                className="bg-indigo-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-900 transition"
              >
                Candidate Portal
              </button>
            </div>
          </div>
          
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
            About Talent Flow
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            At Talent Flow, we’re committed to attracting and nurturing top talent.
            This HR portal allows us to post jobs, track applications, and make
            the hiring process seamless for both candidates and our teams.
          </p>
        </div>

        {/* Features */}
        <div onClick={() => navigate('/jobs')} className="grid grid-cols-1 md:grid-cols-3 gap-8 cursor-pointer">
          <div className="bg-indigo-50 p-6 rounded-lg text-center hover:shadow-lg transition">
            <div className="text-indigo-600 mb-4 text-4xl">📄</div>
            <h3 className="font-semibold text-xl mb-2">Open Positions</h3>
            <p className="text-gray-600">
              View and manage all current openings at Talent Flow in one place.
            </p>
          </div>

          <div onClick={() => navigate('/candidates')} className="bg-indigo-50 p-6 rounded-lg text-center hover:shadow-lg transition cursor-pointer">
            <div className="text-indigo-600 mb-4 text-4xl">👥</div>
            <h3 className="font-semibold text-xl mb-2">Candidate Pipeline</h3>
            <p className="text-gray-600">
              Track every applicant’s journey — from application to offer — with ease.
            </p>
          </div>

          <div onClick={() => navigate('/dashboard')} className="bg-indigo-50 p-6 rounded-lg text-center hover:shadow-lg transition cursor-pointer">
            <div className="text-indigo-600 mb-4 text-4xl">📊</div>
            <h3 className="font-semibold text-xl mb-2">HR Insights</h3>
            <p className="text-gray-600">
              Get insights into your hiring trends and make data-driven decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-indigo-100 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
          Ready to join our team?
        </h2>
        <p className="mb-6 text-gray-600">
          Explore current opportunities and start your journey with Talent Flow today.
        </p>
        <button
          onClick={() => navigate("/jobs")}
          className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Browse Jobs
        </button>
      </section>
    </div>
  );
};

export default HomePage;
