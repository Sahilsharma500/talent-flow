import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaCalendarAlt,
  FaEnvelope,
  FaLink,
  FaMobileAlt,
  FaBriefcase,
  FaGraduationCap,
} from "react-icons/fa";
import NotesWithMentions from "../components/NotesWithMentions";
import { toast } from 'react-hot-toast'; // Import toast for user feedback

const CandidateById = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [newNote, setNewNote] = useState("");

  // stages themed to indigo
  const stages = [
    { id: "applied", name: "Applied", color: "bg-indigo-100 text-indigo-800" },
    {
      id: "screening",
      name: "Screening",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "interview",
      name: "Interview",
      color: "bg-indigo-200 text-indigo-900",
    },
    { id: "offer", name: "Offer", color: "bg-green-100 text-green-800" },
    { id: "rejected", name: "Rejected", color: "bg-red-100 text-red-800" },
    { id: "hired", name: "Hired", color: "bg-emerald-100 text-emerald-800" },
  ];

  // NEW: Define the sequential order of stages
  const sequentialStageOrder = [
    "applied", 
    "screening", 
    "interview", 
    "offer", 
    "hired"
  ];
  const getStageOrder = (stageId) => sequentialStageOrder.indexOf(stageId);


  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidateResponse, timelineResponse] = await Promise.all([
        axios.get(`/candidates/${id}`),
        axios.get(`/candidates/${id}/timeline`),
      ]);

      setCandidate(candidateResponse.data);
      setTimeline(timelineResponse.data || []);

      if (candidateResponse.data.notes && Array.isArray(candidateResponse.data.notes)) {
        setNotes(candidateResponse.data.notes.join("\n\n"));
      } else {
        setNotes("");
      }

      if (candidateResponse.data.jobId) {
        const jobResponse = await axios.get(
          `/jobs/${candidateResponse.data.jobId}`
        );
        setJob(jobResponse.data);
      }
    } catch (error) {
      console.error("Error fetching candidate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage) => {
    if (!candidate) return;

    const currentStage = candidate.stage;

    // --- NEW VALIDATION LOGIC ---
    if (newStage !== "rejected") {
        const currentOrder = getStageOrder(currentStage);
        const targetOrder = getStageOrder(newStage);

        // If trying to move backward or to an invalid stage
        if (targetOrder === -1 || targetOrder < currentOrder) {
            // Prevent the update and show an error message
            toast.error("Cannot move candidate backward in the hiring process.");
            return; 
        }
    }
    // ----------------------------
    
    try {
      await axios.patch(`/applications/${candidate.id}/status`, {
        status: newStage,
      });

      // Optimistically update local state
      setCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));

      // Refresh timeline to show new event
      const timelineResponse = await axios.get(`/candidates/${id}/timeline`);
      setTimeline(timelineResponse.data || []);
      
      // Show success toast for allowed changes
      toast.success(`Candidate moved to ${newStage.charAt(0).toUpperCase() + newStage.slice(1)}.`);

    } catch (error) {
      console.error("Error updating candidate stage:", error);
      toast.error("Failed to update candidate status.");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const noteWithTimestamp = `[${new Date().toLocaleString()}] ${newNote.trim()}`;
    
    const existingNotesArray = notes.split('\n\n').filter(n => n.trim() !== '');
    const updatedNotesArray = [...existingNotesArray, noteWithTimestamp];
    const updatedNotesString = updatedNotesArray.join("\n\n");

    setNotes(updatedNotesString);
    setNewNote("");

    try {
      await axios.patch(`/candidates/${candidate.id}`, {
        notes: updatedNotesArray,
      });
      toast.success("Note added successfully.");
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note.");
    }
  };

  const getStageInfo = (stageId) => {
    return (
      stages.find((s) => s.id === stageId) || {
        name: stageId,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Candidate not found
          </h1>
        </div>
      </div>
    );
  }

  const currentStageInfo = getStageInfo(candidate.stage);
  const appliedDate = new Date(candidate.appliedAt).toLocaleDateString();
  const dobDate = new Date(candidate.dateOfBirth).toLocaleDateString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <img
          src={candidate.profilePicture || "https://placehold.co/120x120"}
          alt={candidate.name}
          className="w-24 h-24 rounded-full border-2 border-gray-300"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {candidate.name}
          </h1>
          <p className="text-gray-600 mb-1 flex items-center justify-center sm:justify-start">
            <FaEnvelope className="text-indigo-500 mr-2" />
            {candidate.email}
          </p>
          {job && (
            <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start">
              <FaBriefcase className="text-indigo-500 mr-2" />
              Applied for:{" "}
              <span className="font-medium ml-1">{job.title}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Candidate Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaBriefcase className="text-gray-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Previous Role
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.previousRole} at {candidate.previousCompany}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaGraduationCap className="text-gray-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Education</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.education}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-gray-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Years of Experience
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.yearsOfExperience} years
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaMobileAlt className="text-gray-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-gray-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {dobDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaLink className="text-gray-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Resume</p>
                  <a
                    href={candidate.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Application Status
            </h2>
            <div className="flex items-center justify-between mb-4">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${currentStageInfo.color}`}
              >
                {currentStageInfo.name}
              </span>
              <select
                value={candidate.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Applied on:{" "}
              <span className="font-semibold text-gray-700">{appliedDate}</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Timeline</h2>
            
            {/* MODIFIED TIMELINE STRUCTURE */}
            <div className="relative border-l-2 border-gray-200 pl-4 space-y-8">
              {timeline.length === 0 ? (
                <p className="text-sm text-gray-500">No timeline events yet.</p>
              ) : (
                timeline.map((event, index) => {
                  const stageInfo = getStageInfo(event.stage);
                  
                  // Extract the color class for the circle
                  const circleColorClass = stageInfo.color.split(' ').find(c => c.startsWith('bg-'));
                  
                  return (
                    <div key={index} className="relative">
                      {/* Timeline Circle/Dot */}
                      <div
                        className={`absolute -left-5 top-0 w-4 h-4 rounded-full border-4 border-white ${circleColorClass}`}
                      ></div>
                      
                      <div className="flex flex-col space-y-1 pb-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${stageInfo.color}`}
                          >
                            {stageInfo.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {event.note}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
        <div className="space-y-4">
          <NotesWithMentions
            value={newNote}
            onChange={setNewNote}
            placeholder="Add a note about this candidate... (use @ to mention team members)"
            rows={3}
          />
          <button
            onClick={handleAddNote}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Add Note
          </button>
          {notes && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Previous Notes:
              </h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                  {notes}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateById;