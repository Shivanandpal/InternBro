import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, ArrowLeft, Send, Sparkles, ShieldAlert } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AddInternship() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Guard access to Admin role
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || profile?.role?.toUpperCase() === 'ADMIN';

  // Form fields
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('Google');
  const [location, setLocation] = useState('Bangalore, India');
  const [type, setType] = useState('Remote');
  const [duration, setDuration] = useState('3 Months');
  const [stipend, setStipend] = useState('₹45,000 / month');
  const [skills, setSkills] = useState('React, Tailwind CSS, JavaScript');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('Prior React experience\nStrong analytical skills');
  const [responsibilities, setResponsibilities] = useState('Develop interactive dashboard modules\nCollaborate on visual design systems');
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Error: Only administrators can execute this action.");
      return;
    }

    setLoading(true);
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const reqsArray = requirements.split('\n').map(s => s.trim()).filter(Boolean);
    const respsArray = responsibilities.split('\n').map(s => s.trim()).filter(Boolean);

    const payload = {
      title,
      company,
      logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200&auto=format&fit=crop&q=60",
      location,
      type,
      duration,
      stipend,
      skillsRequired: skillsArray,
      description,
      requirements: reqsArray,
      responsibilities: respsArray,
      deadline: deadline || '2026-07-31',
      postedBy: profile?.uid || user?.uid || 'admin-uid',
      status: 'Approved', // Auto-approved because created by admin!
      isFeatured
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://internbro.onrender.com/internships/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          company,
          location,
          type,
          stipend,
          duration,
          description,
          skills: skills
        })
      });
      if (res.ok) {
        alert("Internship listing posted successfully and is now active!");
        navigate('/listings');
      } else {
        throw new Error("Failed to post on backend API");
      }
    } catch (err) {
      console.warn("Backend down. Saving internship listing to localStorage.");

      // Save locally
      const localJobs = JSON.parse(localStorage.getItem('internbro_jobs') || '[]');
      const newJob = {
        ...payload,
        id: 'job-' + Date.now(),
        _id: 'job-' + Date.now()
      };
      localJobs.push(newJob);
      localStorage.setItem('internbro_jobs', JSON.stringify(localJobs));

      // Also register this action in the simulated Admin Activity log
      const localActivities = JSON.parse(localStorage.getItem('internbro_activities') || '[]');
      localActivities.unshift({
        id: 'act-' + Date.now(),
        user: profile?.name || user?.name || 'Alexander Bro',
        role: 'admin',
        action: `Added new internship listing: "${title}" at ${company}`,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('internbro_activities', JSON.stringify(localActivities));

      alert("Simulated backend offline: Listing successfully registered locally and marked active!");
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 flex items-center justify-center py-10 px-4">
        <div className="max-w-md w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl p-8 text-center shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white leading-tight">Access Restricted</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The "Add Internship" portal is reserved exclusively for System Administrators.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-darkBg rounded-2xl text-xs text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-darkBorder">
            Please use the <strong>Role Simulator</strong> dropdown in the top navbar and switch to <strong>Admin</strong> to test this route.
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Home Page</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 py-10">
      <div className="max-w-3xl mx-auto px-4">

        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-semibold text-gray-500 hover:text-brand-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Form Container */}
        <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-36 h-36 bg-gradient-to-br from-brand-500/10 to-violetAccent-500/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center space-x-3 pb-6 border-b border-gray-100 dark:border-darkBorder/30">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/30 flex items-center justify-center shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white leading-tight flex items-center gap-1.5">
                <span>Post New Internship</span>
                <Sparkles className="w-4 h-4 text-violetAccent-500" />
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Global platforms administrator console. Published placements will go active instantly.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Job Title</label>
                <input
                  type="text"
                  placeholder="Software Engineer Intern (AI Systems)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Company Name</label>
                <input
                  type="text"
                  placeholder="Google, Microsoft, Stripe..."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Workplace Mode</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white transition-colors"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Duration</label>
                <input
                  type="text"
                  placeholder="3 Months, 6 Months"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Monthly Stipend</label>
                <input
                  type="text"
                  placeholder="₹85,000 or $3,500 / month"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Location</label>
                <input
                  type="text"
                  placeholder="Bangalore, India or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Application Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Skills Required (comma separated)</label>
              <input
                type="text"
                placeholder="Python, PyTorch, React, SQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Description</label>
              <textarea
                rows="4"
                placeholder="Briefly describe the role, product teams involved, and project scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white resize-none transition-colors"
              ></textarea>
            </div>

            {/* Requirements & Responsibilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Candidate Requirements (One per line)</label>
                <textarea
                  rows="4"
                  placeholder="Student of Computer Science or related engineering field&#10;Basic knowledge of software engineering design patterns..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white resize-none transition-colors"
                ></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Job Responsibilities (One per line)</label>
                <textarea
                  rows="4"
                  placeholder="Design responsive dashboard user interfaces&#10;Optimize backend RESTful queries for responsiveness..."
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white resize-none transition-colors"
                ></textarea>
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center space-x-3 p-3.5 bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-darkBorder/40 rounded-2xl">
              <input
                id="is-featured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-offset-2"
              />
              <label htmlFor="is-featured" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                Promote to Featured Placements (pinned to dashboard highlights)
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-violetAccent-600 hover:from-brand-700 hover:to-violetAccent-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish & Go Live</span>
                </>
              )}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}
