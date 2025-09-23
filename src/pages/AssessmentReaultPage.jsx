import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const AssessmentResultsPage = () => {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const assessmentRes = await axios.get(`/assessments/${jobId}`);
        const fetchedAssessment = assessmentRes.data;

        if (!fetchedAssessment) {
            setLoading(false);
            return;
        }

        setAssessment(fetchedAssessment);

        const [candidatesRes, responsesRes] = await Promise.all([
          axios.get('/candidates?pageSize=1000'),
          axios.get(`/assessments/${fetchedAssessment.id}/responses`)
        ]);

        const allCandidates = candidatesRes.data.data;
        const fetchedResponses = responsesRes.data.data;

        const combinedData = fetchedResponses.map(response => {
          const candidate = allCandidates.find(c => c.id === response.candidateId);
          return {
            ...response,
            candidate
          };
        });
        setResponses(combinedData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleSortByScore = () => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    const sortedResponses = [...responses].sort((a, b) => {
      if (newSortOrder === 'asc') {
        return a.score - b.score;
      }
      return b.score - a.score;
    });
    setResponses(sortedResponses);
    setSortOrder(newSortOrder);
  };

  const getSortIcon = () => {
    if (sortOrder === 'desc') return <FaSortDown className="ml-2" />;
    return <FaSortUp className="ml-2" />;
  };

  const calculateAnalytics = () => {
    if (responses.length === 0) {
      return { total: 0, average: 0, above70: 0, above60: 0 };
    }
    const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
    const average = totalScore / responses.length;
    const above70 = responses.filter(r => r.score >= 70).length;
    const above60 = responses.filter(r => r.score >= 60).length;
    return {
      total: responses.length,
      average: average.toFixed(1),
      above70: ((above70 / responses.length) * 100).toFixed(0),
      above60: ((above60 / responses.length) * 100).toFixed(0),
    };
  };

  const prepareChartData = () => {
    const scoreRanges = {
      '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '50-59': 0, '<50': 0
    };
    let passed = 0;
    let failed = 0;

    responses.forEach(r => {
      if (r.score >= 90) scoreRanges['90-100']++;
      else if (r.score >= 80) scoreRanges['80-89']++;
      else if (r.score >= 70) scoreRanges['70-79']++;
      else if (r.score >= 60) scoreRanges['60-69']++;
      else if (r.score >= 50) scoreRanges['50-59']++;
      else scoreRanges['<50']++;

      if (r.score >= 60) passed++;
      else failed++;
    });

    const barChartData = Object.keys(scoreRanges).map(key => ({
      name: key,
      candidates: scoreRanges[key],
    }));

    const pieChartData = [
      { name: 'Passed', value: passed },
      { name: 'Failed', value: failed },
    ];
    
    return { barChartData, pieChartData };
  };

  const analytics = calculateAnalytics();
  const { barChartData, pieChartData } = prepareChartData();
  const PIE_COLORS = ['#34D399', '#F87171'];

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!assessment || responses.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Assessment Results
        </h1>
        <p className="text-gray-600">
          No responses found for this assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="md:text-3xl sm:text-2xl text-xl font-bold text-gray-900 mb-2">
            Results for "{assessment.title}"
          </h1>
          <p className="sm:text-sm text-xs text-gray-600">
            Analytics and candidate responses for this assessment.
          </p>
        </div>
      </div>

      {/* Analytics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Responses</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Average Score</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.average}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Above 70%</p>
          <p className="text-3xl font-bold text-emerald-600">{analytics.above70}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Above 60%</p>
          <p className="text-3xl font-bold text-blue-600">{analytics.above60}%</p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="candidates" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pass Rate (Above 60%)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Candidate List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Candidate Scores ({responses.length})
          </h2>
          <button
            onClick={handleSortByScore}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-emerald-600"
          >
            Sort by Score {getSortIcon()}
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {responses.map(response => (
            <div
              key={response.id}
              className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={response.candidate?.profilePicture || 'https://placehold.co/40x40'}
                  alt={response.candidate?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {response.candidate?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {response.candidate?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                <span
                  className={`
                    ${response.score >= 70 ? 'text-emerald-600' : 
                      response.score >= 60 ? 'text-blue-600' : 'text-red-600'}
                  `}
                >
                  {response.score}
                </span>
                <span className="text-gray-500 text-sm ml-1">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentResultsPage;