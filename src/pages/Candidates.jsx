import React, { useState, useEffect } from 'react';
import { FixedSizeList } from 'react-window';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
} from 'react-icons/fa';

// A helper component to render a single row for the virtualized list.
const Row = ({ index, style, data }) => {
  const navigate = useNavigate();
  const { candidates } = data;
  const candidate = candidates[index];

  if (!candidate) return null;

  const stageColors = {
    applied: 'bg-gray-200 text-gray-800',
    screening: 'bg-blue-100 text-blue-800',
    interview: 'bg-blue-300 text-blue-900',
    offer: 'bg-indigo-300 text-indigo-900',
    hired: 'bg-green-300 text-green-900',
    rejected: 'bg-red-300 text-red-900',
  };

  const handleClick = () => {
    navigate(`/candidates/${candidate.id}`);
  }

  return (
    <div
    onClick={handleClick}
      style={style}
      // Use flex-row for mobile to align Name/Status side-by-side
      className="w-full flex items-center px-6 py-4 text-sm hover:bg-blue-50 transition-colors duration-150 ease-in-out border-b border-gray-100"
    >
      {/* Name and Profile Picture (Primary Mobile Column) */}
      {/* Takes 65% width on mobile, shrinks on desktop */}
      <div className="w-[65%] md:w-[25%] flex items-center">
        <img
          src={candidate.profilePicture}
          alt={candidate.name}
          className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
        />
        <div className="flex flex-col min-w-0 flex-grow">
          <p className="font-semibold text-blue-900 truncate">{candidate.name}</p>
          {/* Hide email on mobile to save space */}
          <p className="text-xs text-gray-500 hidden md:block truncate">{candidate.email}</p>
        </div>
      </div>

      {/* Experience (Hidden on mobile) */}
      <div className="hidden md:w-[20%] md:flex text-gray-700">
        <p className="font-medium text-sm">{candidate.yearsOfExperience} years</p>
      </div>

      {/* Role/Company (Hidden on mobile) */}
      <div className="hidden md:flex flex-col md:w-[35%] text-gray-700">
        <p className="font-semibold truncate">{candidate.previousRole}</p>
        <p className="text-xs text-gray-500 truncate">{candidate.previousCompany}</p>
      </div>

      {/* Status (Secondary Mobile Column) */}
      {/* Takes 35% width on mobile, shrinks on desktop */}
      <div className="w-[35%] md:w-[20%] flex justify-end md:justify-start flex-shrink-0">
        <span
          className={`
            inline-block px-3 py-1 text-xs font-semibold rounded-full
            ${stageColors[candidate.stage]}
          `}
        >
          {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
        </span>
      </div>
    </div>
  );
};

// Main Candidates Page component
const CandidatesPage = () => {
  const [allCandidates, setAllCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStage, setActiveStage] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const stages = ['all', 'applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('/candidates');
        const data = await response.json();
        setAllCandidates(data.data);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
      }
    };
    fetchCandidates();
  }, []);

  useEffect(() => {
    let result = allCandidates;

    if (activeStage !== 'all') {
      result = result.filter((c) => c.stage === activeStage);
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(lowercasedQuery) ||
          c.email.toLowerCase().includes(lowercasedQuery) ||
          c.previousRole?.toLowerCase().includes(lowercasedQuery) ||
          c.previousCompany?.toLowerCase().includes(lowercasedQuery)
      );
    }

    result.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCandidates(result);
  }, [allCandidates, searchQuery, activeStage, sortKey, sortDirection]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortIcon = (key) => {
    if (sortKey !== key) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const listData = {
    candidates: filteredCandidates,
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl font-bold text-gray-800">All Candidates</h1>
            <div className="flex flex-col md:flex-row items-stretch md:items-center w-full md:w-auto space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative w-full md:w-auto">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-12 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-300 focus:border-blue-300 transition-colors duration-150 ease-in-out"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
                <FaFilter className="mr-2" />
                Filter
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-0 md:space-x-2 border-b border-gray-200 -mx-6 px-6">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-t-lg
                  ${activeStage === stage
                    ? 'bg-blue-300 text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:text-blue-500'
                  }
                  transition-colors
                `}
              >
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table Header (Hidden on mobile, uses custom widths for alignment) */}
        <div className="hidden md:flex bg-blue-100 text-blue-900 font-bold text-sm uppercase tracking-wider px-6 py-4">
          <button onClick={() => handleSort('name')} className="w-[25%] flex items-center justify-between">
            Name
            {SortIcon('name')}
          </button>
          <button onClick={() => handleSort('yearsOfExperience')} className="w-[20%] flex items-center justify-between">
            Experience
            {SortIcon('yearsOfExperience')}
          </button>
          <button onClick={() => handleSort('previousRole')} className="w-[35%] flex items-center justify-between">
            Role
            {SortIcon('previousRole')}
          </button>
          <button onClick={() => handleSort('stage')} className="w-[20%] flex items-center justify-between">
            Status
            {SortIcon('stage')}
          </button>
        </div>
        
        {/* Mobile Header (New: Shows Name and Status for small screens) */}
        <div className="md:hidden flex bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-wider px-6 py-2 border-b border-gray-200">
          <button onClick={() => handleSort('name')} className="w-[65%] flex items-center">
            Name
          </button>
          <button onClick={() => handleSort('stage')} className="w-[35%] flex justify-end items-center">
            Status
          </button>
        </div>


        {/* Virtualized List Container */}
        <div className="p-4 md:p-6">
          <FixedSizeList
            height={600}
            itemCount={filteredCandidates.length}
            itemSize={80} // Reduced height for more compact rows
            width="100%"
            itemData={listData}
          >
            {Row}
          </FixedSizeList>
          {filteredCandidates.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No candidates found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;