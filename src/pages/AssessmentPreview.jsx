import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Mocks for company and job data for the info page
const companyInfo = {
  name: "TalentFlow",
  description: "A leading platform for managing candidate assessments and hiring workflows.",
  logoUrl: "https://placehold.co/100x100/A0E7A2/064E3B?text=TF",
};

// Helper object to map question types to their time limits in seconds
const questionTimings = {
  "single-choice": 30,
  "multi-choice": 40,
  "short-text": 60,
  "long-text": 600,
  "numeric": 120,
  "file-upload": null, // No time limit
};

const AssessmentPreview = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [previewComplete, setPreviewComplete] = useState(false); // New state for preview complete
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(null);
  const intervalRef = useRef(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobResponse, assessmentResponse] = await Promise.all([
          axios.get(`/jobs/${jobId}`),
          axios.get(`/assessments?jobId=${jobId}`),
        ]);
        setJob(jobResponse.data);
        const assessments = assessmentResponse.data.data;
        if (assessments.length > 0) {
          setAssessment(assessments[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  // Handle timer logic
  useEffect(() => {
    if (!testStarted || previewComplete || !assessment) return;

    const currentQuestion = assessment.sections[currentSectionIndex]?.questions[currentQuestionIndex];
    if (!currentQuestion || questionTimings[currentQuestion.type] === null) {
      clearInterval(intervalRef.current);
      setTimer(null);
      return;
    }

    if (timer === null) {
      setTimer(questionTimings[currentQuestion.type]);
    }

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [testStarted, previewComplete, assessment, currentSectionIndex, currentQuestionIndex, timer]);

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (!assessment) return;

    const currentSection = assessment.sections[currentSectionIndex];
    const isLastQuestionInSection = currentQuestionIndex === currentSection.questions.length - 1;
    const isLastSection = currentSectionIndex === assessment.sections.length - 1;

    if (isLastQuestionInSection && isLastSection) {
      setPreviewComplete(true);
    } else if (isLastQuestionInSection) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
    setTimer(null);
  };

  // Render loading skeleton
  const renderLoading = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotFound = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Assessment not found
        </h1>
        <button
          onClick={() => navigate("/jobs")}
          className="bg-indigo-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Back
        </button>
      </div>
    </div>
  );

  const renderInfoPage = () => {
    const totalQuestions = assessment.sections.reduce(
      (acc, section) => acc + section.questions.length,
      0
    );

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Assessment for {job.title}
              </h1>
            </div>
            <p className="text-gray-600 mb-8">{job.jobType} • {job.location}</p>

            <div className="space-y-6">
              {/* Company Info */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="flex items-center mb-4">
                  <img src={companyInfo.logoUrl} alt="Company Logo" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{companyInfo.name}</h2>
                    <p className="text-sm text-gray-600">{companyInfo.description}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-medium text-gray-900">Role: {job.title}</p>
                </div>
              </div>

              {/* Test Info */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Info</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Total Sections:</p>
                    <p className="font-medium text-gray-900">{assessment.sections.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Questions:</p>
                    <p className="font-medium text-gray-900">{totalQuestions}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>This is a timed assessment. Once the timer starts, you cannot go back to previous questions.</li>
                  <li>Your responses will <strong>not</strong> be saved. This is a preview.</li>
                  <li>The preview will end upon completion or when the time for each question runs out.</li>
                  <li>Please ensure you have a stable internet connection.</li>
                </ul>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Timing per Question Type:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Single-Choice: <strong>30 seconds</strong></li>
                    <li>Multiple-Choice: <strong>40 seconds</strong></li>
                    <li>Short-Answer: <strong>1 minute</strong></li>
                    <li>Numerical: <strong>2 minutes</strong></li>
                    <li>Long-Answer: <strong>10 minutes</strong></li>
                    <li>File-Upload: <strong>No time limit</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setTestStarted(true)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-lg transition-colors"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTestPage = () => {
    const currentSection = assessment.sections[currentSectionIndex];
    const currentQuestion = currentSection.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === currentSection.questions.length - 1 && currentSectionIndex === assessment.sections.length - 1;

    const hasTimer = questionTimings[currentQuestion.type] !== null;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{currentSection.title}</h1>
          {hasTimer && (
            <div className="text-xl font-bold text-gray-800 bg-gray-200 px-4 py-2 rounded-lg">
              Time Left: {timer !== null ? timer : "..."}s
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <div className="space-y-6">
            <div key={currentQuestion.id} className="space-y-4">
              <label className="block text-lg font-medium text-gray-800">
                {currentQuestionIndex + 1}. {currentQuestion.question}
                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Input fields */}
              {currentQuestion.type === "single-choice" && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={responses[currentQuestion.id] === option}
                        onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === "multi-choice" && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={responses[currentQuestion.id]?.includes(option) || false}
                        onChange={(e) => {
                          const currentValues = responses[currentQuestion.id] || [];
                          const newValues = e.target.checked
                            ? [...currentValues, option]
                            : currentValues.filter((v) => v !== option);
                          handleResponseChange(currentQuestion.id, newValues);
                        }}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === "short-text" && (
                <input
                  type="text"
                  value={responses[currentQuestion.id] || ""}
                  onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your answer..."
                />
              )}

              {currentQuestion.type === "long-text" && (
                <textarea
                  value={responses[currentQuestion.id] || ""}
                  onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your detailed answer..."
                />
              )}

              {currentQuestion.type === "numeric" && (
                <input
                  type="number"
                  value={responses[currentQuestion.id] || ""}
                  onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter a number..."
                />
              )}

              {currentQuestion.type === "file-upload" && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  <input
                    type="file"
                    className="hidden"
                    id={`file-${currentQuestion.id}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleResponseChange(currentQuestion.id, file.name);
                    }}
                  />
                  <label
                    htmlFor={`file-${currentQuestion.id}`}
                    className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    Choose File
                  </label>
                  {responses[currentQuestion.id] && (
                    <p className="mt-2 text-sm text-gray-600">Selected: {responses[currentQuestion.id]}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleNextQuestion}
            className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-colors ${
              isLastQuestion ? "bg-indigo-800 hover:bg-indigo-900" : ""
            }`}
          >
            {isLastQuestion ? "Finish Preview" : "Next Question"}
          </button>
        </div>
      </div>
    );
  };

  const renderPreviewComplete = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
          <svg
            className="h-6 w-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Preview Complete!</h1>
        <p className="text-gray-600 mb-6">
          You have reached the end of the assessment preview for {job.title}. No responses have been saved.
        </p>
        <button
          onClick={() => navigate("/assessments")}
          className="bg-indigo-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Back to Assessments
        </button>
      </div>
    </div>
  );

  if (loading) return renderLoading();
  if (!job || !assessment) return renderNotFound();
  if (previewComplete) return renderPreviewComplete();
  if (testStarted) return renderTestPage();
  return renderInfoPage();
};

export default AssessmentPreview;
