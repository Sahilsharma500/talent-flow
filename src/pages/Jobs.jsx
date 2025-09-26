import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JobModal from "../components/JobModal";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { toast } from "react-hot-toast";

const safelyFetchData = async (url, config = {}) => {
  try {
    const response = await axios.get(url, config);
    const contentType = response.headers['content-type'];
    
    if (response.status >= 200 && response.status < 300 && contentType && contentType.includes('application/json')) {
      return response.data;
    }

    if (response.status >= 200 && response.status < 300) {
      console.warn(`MSW worker might be asleep. Non-JSON response received from ${url}.`);
      return { data: [], total: 0 }; 
    }
    
    throw new Error(`HTTP error ${response.status} from ${url}`);

  } catch (error) {
    console.error(`Error during safe fetch of ${url}:`, error.message);
    return { data: [], total: 0 }; 
  }
};


const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [pageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [draggedJob, setDraggedJob] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [jobDropdown, setJobDropdown] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const responseData = await safelyFetchData("/jobs", {
        params: { search, status: statusFilter, page: currentPage, pageSize },
      });
      setJobs(responseData.data);
      setTotalJobs(responseData.total);
    } catch (error) {
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const responseData = await safelyFetchData("/candidates");
      setCandidates(responseData.data || []);
    } catch (error) {
      setCandidates([]);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, [search, statusFilter, currentPage, pageSize]);

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleArchive = async (job) => {
    try {
      await axios.patch(`/jobs/${job.id}`, {
        status: job.status === "active" ? "archived" : "active",
      });
      fetchJobs();
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status.");
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await axios.delete(`/jobs/${jobId}`);
      toast.success("Job deleted successfully");
      fetchJobs();
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Error deleting job");
    }
  };

  const getApplicationsForJob = (jobId) =>
    candidates.filter((candidate) => candidate.jobId === jobId);

  const handleReorder = async (fromIndex, toIndex) => {
    const originalJobs = [...jobs]; 
    const newJobs = [...jobs];
    const [movedJob] = newJobs.splice(fromIndex, 1);
    newJobs.splice(toIndex, 0, movedJob);
    setJobs(newJobs); 

    try {
      await axios.patch(`/jobs/${movedJob.id}/reorder`, {
        fromOrder: fromIndex, 
        toOrder: toIndex,
      });
    } catch (error) {
      console.error("Error reordering jobs:", error);
      toast.error("Reordering failed. Resetting job list.");
      setJobs(originalJobs); 
      fetchJobs(); 
    }
  };

  const handleDragStart = (e, job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = "move";
  };
  const listRef = useRef(null);
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedJob) return;
    const draggedIndex = jobs.findIndex((job) => job.id === draggedJob.id);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedJob(null);
      return;
    }
    handleReorder(draggedIndex, targetIndex);
    setDraggedJob(null);
  };

  useEffect(() => {
  const container = document.scrollingElement || document.documentElement; // or a specific ref

  const handleDragOver = (e) => {
    e.preventDefault();

    // pixels from edge before scrolling starts
    const threshold = 100;
    const scrollSpeed = 10;

    const rect = container.getBoundingClientRect();
    const y = e.clientY;

    if (y - rect.top < threshold) {
      // near top
      container.scrollTop -= scrollSpeed;
    } else if (rect.bottom - y < threshold) {
      // near bottom
      container.scrollTop += scrollSpeed;
    }
  };

  window.addEventListener("dragover", handleDragOver);
  return () => window.removeEventListener("dragover", handleDragOver);
}, []);

  const totalPages = Math.ceil(totalJobs / pageSize);

  if (loading && jobs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
      {/* Header */}
      <div className="mb-8 flex sm:flex-row flex-col sm:gap-0 gap-2 justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">Jobs</h1>
          <p className="text-indigo-600/100">Create and manage your job postings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="md:text-sm text-xs">Create</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search jobs by title or tags..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || statusFilter
                ? "Try adjusting your search criteria."
                : "Get started by creating your first job posting."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 mb-4" ref={listRef}>
            {jobs.map((job, index) => (
              <div
                key={job.id}
                draggable
                onClick={() => navigate(`/jobs/${job.id}`)}
                onDragStart={(e) => handleDragStart(e, job)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-6 mb-4 bg-white rounded-lg shadow-sm 
                  hover:bg-indigo-50 
                  hover:shadow-md 
                  hover:scale-[1.01] 
                  transition-all duration-200 ease-in-out cursor-pointer ${
                    draggedJob?.id === job.id ? "opacity-50" : ""
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400 cursor-move">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.status === "active"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="sm:text-sm text-xs font-semibold text-gray-600 mb-2">
                        {job.location}
                      </p>
                      <p className="sm:text-sm text-xs text-gray-500 mb-3">
                        {job.description.substring(0, 150)}...
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        <span>{getApplicationsForJob(job.id).length} applications</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings dropdown */}
                  <div className="relative ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setJobDropdown((prev) => (prev === job.id ? null : job.id));
                      }}
                      className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center"
                    >
                      Settings
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {jobDropdown === job.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${job.id}`);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingJob(job);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(job);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {job.status === "active" ? "Archive" : "Unarchive"}
                        </button>
                        <button
                          onClick={(e) => {
                            console.log('Clicked delete for', job);
                            e.stopPropagation();
                            setShowDeleteModal(true);
                            setJobToDelete(job);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex sm:flex-row sm:gap-0 gap-5 flex-col items-center justify-between">
            <div className="md:text-sm text-xs text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalJobs)} of {totalJobs} jobs
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
  <JobModal
    onClose={() => setShowCreateModal(false)}
    onSave={() => {
      fetchJobs();
      setShowCreateModal(false); // close modal after save
    }}
  />
)}

{editingJob && (
  <JobModal
    job={editingJob}
    onClose={() => setEditingJob(null)}
    onSave={() => {
      fetchJobs();
      setEditingJob(null); // close modal after save
    }}
  />
)}

      {jobToDelete && (
  <DeleteConfirmationModal
    isOpen={showDeleteModal}
    onClose={() => setShowDeleteModal(false)}
    onConfirm={() => handleDelete(jobToDelete.id)}
    jobTitle={jobToDelete.title}
  />
)}

    </div>
  );
};

export default Jobs;