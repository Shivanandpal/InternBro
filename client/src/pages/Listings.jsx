import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InternshipCard from '../components/InternshipCard';
import { Search, Filter, RefreshCw, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Listings() {
  const { profile, updateProfile } = useAuth();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Extract initial search query from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [location.search]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/internships/?status=Approved`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(j => ({
          ...j,
          skillsRequired: j.skills ? j.skills.split(',').map(s => s.trim()) : [],
        }));
        setJobs(mapped);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.warn("Could not reach Express backend for internships.", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveToggle = async (jobId) => {
    if (!profile) {
      alert("Please login as a student to save internships.");
      return;
    }
    const currentSaved = profile.profile?.savedJobs || [];
    let updatedSaved;
    if (currentSaved.includes(jobId)) {
      updatedSaved = currentSaved.filter(id => id !== jobId);
    } else {
      updatedSaved = [...currentSaved, jobId];
    }
    await updateProfile({
      profile: {
        ...profile.profile,
        savedJobs: updatedSaved
      }
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setLocationFilter('');
  };

  // Filter jobs locally
  const filteredJobs = jobs.filter(job => {
    const sTerm = search.toLowerCase();
    const titleMatch = job.title?.toLowerCase().includes(sTerm) || false;
    const companyMatch = job.company?.toLowerCase().includes(sTerm) || false;
    const skillMatch = job.skillsRequired?.some(s => s.toLowerCase().includes(sTerm)) || false;
    
    const matchesSearch = !search || titleMatch || companyMatch || skillMatch;
    const matchesType = !typeFilter || job.type === typeFilter;
    const matchesLocation = !locationFilter || (
      locationFilter === 'Remote' ? job.type === 'Remote' : job.type !== 'Remote'
    );

    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="page-transition min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-3xl dark:text-white">Explore Internships</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover, save, and apply to vetted student placements.</p>
        </div>

        {/* Filter Toolbar / Top Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT COLUMN: FILTERS PANEL */}
          <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-darkBorder/40 pb-4">
              <span className="font-display font-bold text-base flex items-center space-x-2">
                <Filter className="w-4 h-4 text-brand-500" />
                <span>Filters</span>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Workplace type filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Workplace Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Geography category filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Geography</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              >
                <option value="">Any Location</option>
                <option value="Remote">Only Remote</option>
                <option value="In-Office">In-Office / Hybrid</option>
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN: SEARCH + CARDS GRID */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Input Bar */}
            <div className="flex items-center p-1 bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl shadow-sm">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by role, company name, or programming skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-transparent text-sm border-none focus:ring-0 focus:outline-none dark:text-white"
                />
              </div>
              <button
                onClick={fetchJobs}
                className="p-2 text-gray-400 hover:text-brand-500 rounded-xl hover:bg-gray-50 dark:hover:bg-darkBg transition-colors"
                title="Refresh jobs feed"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Job Cards Output */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
                <span className="text-sm font-semibold text-gray-400">Loading opportunities...</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-20 bg-white dark:bg-darkCard border border-gray-200/30 dark:border-darkBorder/40 rounded-2xl text-center space-y-4">
                <X className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                <h3 className="font-display font-semibold text-lg dark:text-white">
                  {search || typeFilter || locationFilter ? 'No matching internships found' : 'No internships posted yet'}
                </h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  {search || typeFilter || locationFilter
                    ? 'Try broadening your search or resetting filters to see all available listings.'
                    : 'Recruiters haven\'t posted any internships yet. Check back soon, or sign in as a recruiter to post one!'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <InternshipCard
                    key={job.id || job._id}
                    job={job}
                    isSaved={profile?.profile?.savedJobs?.includes(job.id || job._id) || false}
                    onSaveToggle={handleSaveToggle}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
