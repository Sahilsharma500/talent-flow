import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import axios from "axios";
import NotesWithMentions from "../components/NotesWithMentions";
import { toast } from "react-hot-toast";

const CandidatesByJob = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const jobFilter = id || ""; 

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [quickNote, setQuickNote] = useState("");

  const stages = [
    { id: "applied", name: "Applied", color: "bg-blue-100 text-blue-800" },
    { id: "screening", name: "Screening", color: "bg-yellow-100 text-yellow-800" },
    { id: "interview", name: "Interview", color: "bg-purple-100 text-purple-800" },
    { id: "offer", name: "Offer", color: "bg-green-100 text-green-800" },
    { id: "rejected", name: "Rejected", color: "bg-red-100 text-red-800" },
    { id: "hired", name: "Hired", color: "bg-indigo-100 text-indigo-800" }, 
  ];

  const fetchCandidates = async () => {
    try {
      setLoading(true);

      let url = "/candidates";
      const params = new URLSearchParams();

      if (jobFilter) params.append("jobId", jobFilter);
      if (search) params.append("search", search);
      if (stageFilter) params.append("stage", stageFilter);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await axios.get(url);
      setCandidates(response.data.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get("/jobs");
      setJobs(response.data.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      fetchCandidates();
    }
  }, [jobFilter, jobs, search, stageFilter]);

  const getCandidatesByStage = (stageId) => {
    return candidates.filter((candidate) => candidate.stage === stageId);
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    return job ? job.title : "Unknown Job";
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      await axios.delete(`/applications/${candidateId}`);
      toast.success("Candidate deleted successfully");
      fetchCandidates();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Error deleting candidate");
    }
  };

  const handleDragStart = (e, candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();

    if (!draggedCandidate || draggedCandidate.stage === targetStage) return;

    try {
      // Using the dedicated status update endpoint which logs timeline automatically
      await axios.patch(`/applications/${draggedCandidate.id}/status`, {
        status: targetStage,
      });

      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === draggedCandidate.id
            ? { ...candidate, stage: targetStage }
            : candidate
        )
      );
    } catch (error) {
      console.error("Error updating candidate status:", error);
    }

    setDraggedCandidate(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleAddNote = (candidate) => {
    setSelectedCandidate(candidate);
    setQuickNote("");
    setShowNotesModal(true);
  };

  const handleSaveNote = async () => {
    if (!selectedCandidate || !quickNote.trim()) return;

    const noteWithTimestamp = `[${new Date().toLocaleString()}] ${quickNote.trim()}`;
    
    // Fetch the latest candidate data to ensure we don't overwrite concurrent changes
    let currentNotes = []; 

    try {
        const freshCandidateResponse = await axios.get(`/candidates/${selectedCandidate.id}`);
        currentNotes = Array.isArray(freshCandidateResponse.data.notes) ? freshCandidateResponse.data.notes : [];
    } catch(e) {
        console.error("Could not fetch fresh notes, using local state or empty array.", e);
    }

    const updatedNotes = [...currentNotes, noteWithTimestamp];

    try {
      // Persist the updated array of notes via API
      await axios.patch(`/applications/${selectedCandidate.id}`, { 
        notes: updatedNotes, 
      });
      
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Error saving note");
    }

    // Update local state
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === selectedCandidate.id
          ? { ...candidate, notes: updatedNotes } 
          : candidate
      )
    );

    setShowNotesModal(false);
    setSelectedCandidate(null);
    setQuickNote("");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-indigo-600 font-bold mb-2">Candidates</h1>
            <p className="text-indigo-600/90">
              {jobFilter
                ? `Applications for ${getJobTitle(jobFilter)}`
                : "Manage candidate applications"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {jobFilter && (
              <button
                onClick={() => navigate("/candidates")}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium cursor-pointer"
              >
                View All Applications
              </button>
            )}
            <div className="text-sm text-indigo-600 font-bold">
              Total: {candidates.length} candidates
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-indigo-400 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Candidates
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Stage
              </label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Stages</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearch("");
                  setStageFilter("");
                }}
                className="px-4 py-2 cursor-pointer text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.id);
          return (
            <div
              key={stage.id}
              className="bg-gray-50 border border-indigo-400 rounded-lg p-3 min-h-[600px] flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {stage.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${stage.color}`}
                >
                  {stageCandidates.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {stageCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate)}
                    className="flex flex-col justify-between gap-1 bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move mb-3"
                  >
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {candidate.name}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">
                        {candidate.email}
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-gray-700 font-medium truncate">
                        {getJobTitle(candidate.jobId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Applied: {formatDate(candidate.appliedAt)}
                      </p>
                    </div>
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 2).map((skill, index) => (
                            <span
                              key={index}
                              className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded truncate max-w-[80px]"
                              title={skill}
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{candidate.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {candidate.experience && (
                      <div className="mb-3">
                        <p
                          className="text-xs text-gray-600 leading-tight overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            maxHeight: "2.4em",
                            lineHeight: "1.2em",
                          }}
                          title={candidate.experience}
                        >
                          {candidate.experience}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                        className="cursor-pointer border border-indigo-500 text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        View
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddNote(candidate)}
                          className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-700 p-1 rounded hover:bg-gray-100"
                          title="Add Notes"
                        >
                          {/* pencil icon */}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="cursor-pointer text-xs text-red-600 hover:text-red-700 p-1 rounded hover:bg-gray-100"
                          title="Delete"
                        >
                          {/* trash icon */}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {stageCandidates.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showNotesModal && selectedCandidate && (
        <div className="fixed inset-0 bg-indigo-50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-indigo-400 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Note for {selectedCandidate.name}
            </h3>
            <NotesWithMentions
              value={quickNote}
              onChange={setQuickNote}
              placeholder="Add a quick note... (use @ to mention team members)"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedCandidate(null);
                  setQuickNote("");
                }}
                className="px-4 py-2 cursor-pointer text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesByJob;