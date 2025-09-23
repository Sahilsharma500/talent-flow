import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [candidatesPerJob, setCandidatesPerJob] = useState([]);
  const [dailyApplicants, setDailyApplicants] = useState({});
  const [jobsForComparison, setJobsForComparison] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedMonth1, setSelectedMonth1] = useState('');
  const [selectedMonth2, setSelectedMonth2] = useState('');
  const [loading, setLoading] = useState(true);

  // Use a more reliable way to get the latest and previous month keys
  const getMonthKey = (offset = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() - offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const currentMonthKey = getMonthKey(0);
  const prevMonthFormatted = getMonthKey(1);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [monthlyRes, jobRes] = await Promise.all([
          axios.get('/analytics/monthly'),
          axios.get('/analytics/candidates-per-job'),
        ]);

        const monthlyData = monthlyRes.data;
        const currentMonthDailyData = monthlyData.find(d => d.key === currentMonthKey)?.dailyApplicants || {};

        setAnalyticsData(monthlyData);
        setCandidatesPerJob(jobRes.data);
        setDailyApplicants(currentMonthDailyData);
        setJobsForComparison(monthlyData.map(d => d.key));
        setSelectedMonth1(currentMonthKey);
        setSelectedMonth2(prevMonthFormatted);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, [currentMonthKey, prevMonthFormatted]);

  useEffect(() => {
    if (selectedMonth1 && selectedMonth2) {
      const fetchComparisonData = async () => {
        try {
          const response = await axios.get(`/analytics/job-comparison/${selectedMonth1}/${selectedMonth2}`);
          setComparisonData(response.data);
        } catch (error) {
          console.error("Error fetching comparison data:", error);
        }
      };
      fetchComparisonData();
    }
  }, [selectedMonth1, selectedMonth2]);

  const getComparisonData = (key) => {
    const currentMonthData = analyticsData.find(d => d.key === currentMonthKey) || { [key]: 0 };
    const prevMonthData = analyticsData.find(d => d.key === prevMonthFormatted) || { [key]: 0 };

    const currentValue = currentMonthData[key] || 0;
    const prevValue = prevMonthData[key] || 0;
    
    const change = prevValue === 0 ? (currentValue > 0 ? 100 : 0) : ((currentValue - prevValue) / prevValue) * 100;
    
    return {
      value: currentValue,
      change: Math.abs(change).toFixed(1),
      isIncrease: change >= 0
    };
  };

  const applicantData = getComparisonData('totalApplicants');
  const hiredData = getComparisonData('hiredCandidates');
  const rejectedData = getComparisonData('rejectedCandidates');
  const jobsData = getComparisonData('totalJobs');

  const dailyApplicantsChartData = Object.keys(dailyApplicants).map(date => ({
    date: date.slice(-2),
    applicants: dailyApplicants[date]
  }));
  
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-96"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-96"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-700/100 mb-2">HR Analytics Dashboard</h1>
        <p className="text-sm md:text-base text-indigo-600/100">Track key metrics and make data-driven decisions</p>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Applicants", data: applicantData, color: "blue" },
          { title: "Candidates Hired", data: hiredData, color: "green" },
          { title: "Rejected Candidates", data: rejectedData, color: "red" },
          { title: "Total Jobs", data: jobsData, color: "purple" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <p className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">{card.data.value}</p>
            <div className="mt-2 flex items-center text-xs md:text-sm">
              <span className={`flex items-center font-semibold ${card.data.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                {card.data.isIncrease ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                {card.data.change}%
              </span>
              <span className="ml-2 text-gray-500">vs. last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Applicants Line Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base md:text-lg font-medium text-gray-900 mb-4">Daily Applicants ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyApplicantsChartData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applicants" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Candidates per Job Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base md:text-lg font-medium text-gray-900 mb-4">Candidates Per Job</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={candidatesPerJob}
                dataKey="candidates"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {candidatesPerJob.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Job Comparison Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base md:text-lg font-medium text-gray-900 mb-4">Job-wise Applicant Comparison</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            className="border rounded-lg px-3 py-1"
            value={selectedMonth1}
            onChange={(e) => setSelectedMonth1(e.target.value)}
          >
            {jobsForComparison.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select
            className="border rounded-lg px-3 py-1"
            value={selectedMonth2}
            onChange={(e) => setSelectedMonth2(e.target.value)}
          >
            {jobsForComparison.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={selectedMonth1} fill="#8884d8" />
            <Bar dataKey={selectedMonth2} fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;