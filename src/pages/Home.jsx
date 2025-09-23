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
              Welcome to TalentFlow
            </h1>
            <p className="mb-6 text-lg sm:text-xl">
              Manage your jobs and candidates effortlessly. Streamline your
              recruitment and find the right talent faster.
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
                View Candidates
              </button>
            </div>
          </div>
          {/* optional hero image */}
          {/* <div className="md:w-1/2 mb-10 md:mb-0 flex justify-center">
            <img
              src={heroImage}
              alt="TalentFlow Hero"
              className="w-3/4 md:w-full"
            />
          </div> */}
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
            About TalentFlow
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            TalentFlow is designed to make HR management seamless. Post jobs,
            track candidate applications, collaborate with your team, and make
            data-driven hiring decisions with ease.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-indigo-50 p-6 rounded-lg text-center hover:shadow-lg transition">
            <div className="text-indigo-600 mb-4 text-4xl">📄</div>
            <h3 className="font-semibold text-xl mb-2">Job Management</h3>
            <p className="text-gray-600">
              Post and manage jobs effortlessly, keep track of openings and
              deadlines.
            </p>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg text-center hover:shadow-lg transition">
            <div className="text-indigo-600 mb-4 text-4xl">👥</div>
            <h3 className="font-semibold text-xl mb-2">Candidate Tracking</h3>
            <p className="text-gray-600">
              Track applications and candidate progress in a visual pipeline.
            </p>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg text-center hover:shadow-lg transition">
            <div className="text-indigo-600 mb-4 text-4xl">📊</div>
            <h3 className="font-semibold text-xl mb-2">Analytics</h3>
            <p className="text-gray-600">
              Make informed decisions with insights into applications and hiring
              trends.
            </p>
          </div>
        </div>
      </section>

      {/* Optional Call-to-Action Section */}
      <section className="bg-indigo-100 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
          Ready to streamline your recruitment?
        </h2>
        <p className="mb-6 text-gray-600">
          Join TalentFlow today and take your hiring process to the next level.
        </p>
        <button className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-indigo-700 transition">
          Get Started
        </button>
      </section>
    </div>
  );
};

export default HomePage;
