import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEllipsisV, FaExternalLinkAlt, FaEye } from "react-icons/fa";

const Assessments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [assessments, setAssessments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // --- START FIX: Resilient fetching for multiple endpoints ---

      const fetchJson = async (url) => {
        const response = await axios.get(url);
        
        // Check if the response is valid JSON (MSW should set Content-Type: application/json)
        const contentType = response.headers['content-type'];

        if (response.status >= 200 && response.status < 300 && contentType && contentType.includes('application/json')) {
          return response.data;
        } else if (response.status >= 200 && response.status < 300) {
            // Handle success but non-JSON (e.g., HTML fallback due to dead worker)
            console.warn(`MSW worker might be asleep. Failed to parse JSON from ${url}.`);
            // This error will be caught by the outer try/catch
            throw new Error(`Non-JSON response received from ${url}`); 
        } else {
            // Handle actual HTTP error statuses
            throw new Error(`HTTP error ${response.status} from ${url}`);
        }
      };


      const [assessmentsData, jobsData] = await Promise.all([
        fetchJson("/assessments"),
        fetchJson("/jobs?pageSize=100"),
      ]);
      
      setAssessments(assessmentsData.data || []);
      setJobs(jobsData.data || []);

      // --- END FIX: Resilient fetching for multiple endpoints ---

    } catch (error) {
      // The catch block handles both network errors and the explicit throw from fetchJson
      toast.error('Error fetching data. Try refreshing the page.');
      console.error("Error fetching data:", error.message);
      setAssessments([]); // Ensure UI gracefully shows empty state
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.pathname === "/assessments") {
      fetchData();
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleDeleteAssessment = async (assessmentId) => {
    try {
      await axios.delete(`/assessments/${assessmentId}`);
      toast.success("Assessment deleted successfully");
      fetchData();
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Error deleting assessment");
    }
  };

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex gap-2 justify-between items-center">
          <div>
            <h1 className="md:text-3xl sm:text-2xl text-xl font-bold text-indigo-600 mb-2">
              Assessments
            </h1>
            <p className="text-indigo-600/90 sm:text-sm text-xs">
              Create and manage candidate assessments
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                if (selectedJob && showBuilder) {
                  navigate(`/assessments/builder/${selectedJob}`);
                } else {
                  setShowBuilder(true);
                }
              }}
              className="bg-indigo-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="md:text-sm text-xs">Create</span>
            </button>
            {showBuilder && (
              <button
                onClick={() => {
                  setShowBuilder(false);
                  setSelectedJob("");
                }}
                className="bg-gray-200 cursor-pointer text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showBuilder && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Select Job for Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedJob === job.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedJob(job.id)}
              >
                <h3 className="font-medium text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.jobType}</p>
                <p className="text-xs text-gray-500 mt-1">{job.location}</p>
              </div>
            ))}
          </div>
          {selectedJob && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => navigate(`/assessments/builder/${selectedJob}`)}
                className="px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Proceed to Builder
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {!assessments || assessments.length === 0 ? (
          <div className="text-center py-6">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No assessments created yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first assessment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            { assessments && assessments.map((assessment) => {
              const job = jobs.find((j) => j.id === assessment.jobId);
              return (
                <div
                  key={assessment.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between relative"
                >
                  <div className="absolute top-4 right-0.5 z-10" ref={openDropdownId === assessment.id ? dropdownRef : null}>
                    <button
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === assessment.id ? null : assessment.id);
                      }}
                    >
                      <FaEllipsisV className="w-5 h-5" />
                    </button>
                    {openDropdownId === assessment.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assessments/builder/${assessment.jobId}`);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Edit Assessment
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssessment(assessment.id);
                          }}
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          Delete Assessment
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                      Assessment for {job?.title || "Unknown Job"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {job?.jobType} • {job?.location}
                    </p>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                      {assessment.sections.length} sections
                    </span>
                    <p className="text-sm text-gray-600 font-semibold mt-3">
                      Total Questions:{" "}
                      {assessment.sections.reduce(
                        (total, section) => total + section.questions.length,
                        0
                      )}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-200 flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assessments/preview/${assessment.jobId}`);
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-800 rounded-md hover:bg-indigo-100 transition-colors duration-200 text-sm font-medium"
                    >
                      <FaEye className="mr-2" />
                      Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assessments/results/${assessment.jobId}`);
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-800 rounded-md hover:bg-indigo-100 transition-colors duration-200 text-sm font-medium"
                    >
                      <FaExternalLinkAlt className="mr-2" />
                      View Responses
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessments;