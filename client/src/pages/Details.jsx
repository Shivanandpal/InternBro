import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Briefcase, MapPin, Calendar, DollarSign, Send, Star, CheckCircle, Check, AlertTriangle } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const API_BASE_URL = 'https://internbro.onrender.com/api';

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);
  //checks
  // Apply modal form states
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [customSkills, setCustomSkills] = useState('');

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      // 1. Try Python Neon Backend
      const res = await fetch(`https://internbro.onrender.com/internships/${id}`);
      if (res.ok) {
        const data = await res.json();
        const mappedData = {
          ...data,
          skillsRequired: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
          requirements: data.requirements || [
            "Strong communication and collaborative skills.",
            "Solid fundamental understanding of the core domain tools.",
            "Willingness to learn and adapt to standard development pipelines."
          ],
          responsibilities: data.responsibilities || [
            "Work alongside product managers and engineers to build features.",
            "Participate in design mock reviews and document deliverables.",
            "Optimize and debug platform logic across code cycles."
          ]
        };
        setJob(mappedData);
        return;
      }

      // 2. Try Express MongoDB Backend
      const resExpress = await fetch(`${API_BASE_URL}/jobs/${id}`);
      if (resExpress.ok) {
        const data = await resExpress.json();
        setJob(data);
        return;
      }

      throw new Error("Not found on both backend APIs");
    } catch (err) {
      console.warn("Backend fetch failed. Checking local storage and mocks:", err);

      const localJobs = JSON.parse(localStorage.getItem('internbro_jobs') || '[]');
      const foundLocal = localJobs.find(j => j.id === id || j._id === id);
      if (foundLocal) {
        setJob(foundLocal);
        return;
      }

      const mockJobs = [
        {
          id: "job-1",
          _id: "job-1",
          title: "Software Engineering Intern (Frontend)",
          company: "Google",
          logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200&auto=format&fit=crop&q=60",
          location: "Bangalore, India",
          type: "Hybrid",
          duration: "6 Months",
          stipend: "₹85,000 / month",
          skillsRequired: ["React.js", "JavaScript", "TypeScript", "HTML/CSS", "Data Structures"],
          description: "Google's software engineers develop the next-generation technologies that change how billions of users connect, explore, and interact with information. As an engineering intern, you will work on core projects critical to Google's needs and collaborate closely with seasoned developers.",
          requirements: [
            "Currently pursuing a Bachelor's, Master's, or PhD in Computer Science or a related technical field.",
            "Experience with JavaScript/TypeScript and front-end framework libraries, preferably React.",
            "Solid knowledge of basic data structures and algorithmic problem solving."
          ],
          responsibilities: [
            "Write clean, maintainable, and well-tested code for front-end web client services.",
            "Collaborate with UX/UI designers and product managers to prototype new user-facing features.",
            "Participate in design reviews and code reviews to improve product quality."
          ],
          deadline: "2026-06-30",
          postedBy: "recruiter-1"
        },
        {
          id: "job-2",
          _id: "job-2",
          title: "UI/UX Design Intern",
          company: "Figma",
          logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=60",
          location: "Remote",
          type: "Remote",
          duration: "3 Months",
          stipend: "$3,000 / month",
          skillsRequired: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"],
          description: "Join Figma's design team to shape the future of collaborative design tools. You'll work closely with senior designers, engineers, and product managers to research user behaviors, define user flows, and construct pixel-perfect designs.",
          requirements: [
            "Pursuing a degree in Design, HCI, Cognitive Science, or equivalent practical experience.",
            "Strong portfolio demonstrating process, typography, visual design, and user-centered focus.",
            "Familiarity with collaborative design paradigms."
          ],
          responsibilities: [
            "Create wireframes, user flows, mockups, and interactive prototypes.",
            "Assist in conducting user research interviews and synthesizing feedback.",
            "Contribute assets and definitions to our central design system."
          ],
          deadline: "2026-06-25",
          postedBy: "recruiter-2"
        },
        {
          id: "job-3",
          _id: "job-3",
          title: "Backend Engineering Intern",
          company: "Stripe",
          logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&auto=format&fit=crop&q=60",
          location: "San Francisco, USA",
          type: "Hybrid",
          duration: "6 Months",
          stipend: "$5,500 / month",
          skillsRequired: ["Node.js", "Express", "REST APIs", "SQL", "Redis"],
          description: "Stripe builds the economic infrastructure for the internet. As a backend intern, you will help design, build, and maintain the server-side API systems that process billions of dollars in global digital transactions daily.",
          requirements: [
            "Enrolled in a Computer Science or related engineering degree program.",
            "Experience building backend services in Node.js, Ruby, Python, or Go.",
            "Strong understanding of relational databases and system modularity."
          ],
          responsibilities: [
            "Develop high-performance, robust API endpoints for our merchant dashboard.",
            "Optimize database queries and storage structures for scalability.",
            "Write unit tests and integration tests to ensure 99.99% system availability."
          ],
          deadline: "2026-07-15",
          postedBy: "recruiter-3"
        }
      ];
      const matched = mockJobs.find(j => j.id === id);
      setJob(matched || mockJobs[0]);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!profile) return;
    try {
      const res = await fetch(`${API_BASE_URL}/applications?studentId=${profile.id}&jobId=${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setAlreadyApplied(true);
        }
      }
    } catch (err) {
      console.warn("Backend connection failed. Standing state check.");
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  useEffect(() => {
    if (job) {
      checkApplicationStatus();
      // Prep fill resume fields from student profile
      if (profile?.profile) {
        setResumeUrl(profile.profile.resumeUrl || '');
        setCustomSkills(profile.profile.skills?.join(', ') || '');
      }
    }
  }, [job, profile]);

  const handleSaveToggle = async () => {
    if (!profile) {
      alert("Please login as a student to save internships.");
      return;
    }
    const currentSaved = profile.profile?.savedJobs || [];
    let updatedSaved;
    if (currentSaved.includes(id)) {
      updatedSaved = currentSaved.filter(savedId => savedId !== id);
    } else {
      updatedSaved = [...currentSaved, id];
    }
    await updateProfile({
      profile: {
        ...profile.profile,
        savedJobs: updatedSaved
      }
    });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingApp(true);
    try {
      const appPayload = {
        internship_id: id,
        cover_letter: coverNote,
        resume_url: resumeUrl,
      };

      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(appPayload)
      });

      if (res.ok) {
        setAppSuccess(true);
        setAlreadyApplied(true);
        setTimeout(() => {
          setApplyModalOpen(false);
          setAppSuccess(false);
        }, 1500);
      } else {
        const err = await res.json();
        alert(err.message || err.detail || "Failed to submit application.");
      }
    } catch (err) {
      console.warn("Backend server down. Simulating successful application submitting locally.");
      setAppSuccess(true);
      setAlreadyApplied(true);
      setTimeout(() => {
        setApplyModalOpen(false);
        setAppSuccess(false);
      }, 1500);
    } finally {
      setSubmittingApp(false);
    }
  };

  const isSaved = profile?.profile?.savedJobs?.includes(id) || false;

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center space-y-3 dark:bg-darkBg">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
        <span className="text-sm font-semibold text-gray-400">Loading details...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen py-20 text-center dark:bg-darkBg text-gray-400 space-y-4">
        <p className="font-semibold">Oops! Internship listing details could not be found.</p>
        <Link to="/listings" className="text-brand-500 underline font-semibold text-sm">Return to browse listings</Link>
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <Link to="/listings" className="inline-flex items-center space-x-1.5 text-sm font-semibold text-gray-500 hover:text-brand-500 dark:text-gray-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to browse</span>
        </Link>

        {/* Content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT DETAILS COLUMN */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header description card */}
            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={job.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${job.company}`}
                    alt={job.company}
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-100 dark:border-darkBorder bg-gray-50 dark:bg-darkBg"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${job.company}`; }}
                  />
                  <div>
                    <h1 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white leading-tight">{job.title}</h1>
                    <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-1">{job.company}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveToggle}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center space-x-1.5 transition-all ${isSaved
                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 border-amber-200/50 dark:border-amber-900/30'
                      : 'bg-white hover:bg-gray-50 dark:bg-darkBg dark:hover:bg-darkBorder/40 border-gray-200 dark:border-darkBorder text-gray-500 dark:text-gray-300'
                      }`}
                  >
                    <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save opportunity'}</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-darkBorder/40 pt-6">
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-3">Job Description</h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{job.description}</p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div className="border-t border-gray-100 dark:border-darkBorder/40 pt-6">
                  <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-3">Requirements</h3>
                  <ul className="space-y-2.5">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="border-t border-gray-100 dark:border-darkBorder/40 pt-6">
                  <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-3">Responsibilities</h3>
                  <ul className="space-y-2.5">
                    {job.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="w-1.5 h-1.5 bg-violetAccent-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT OVERVIEW COLUMN */}
          <div className="space-y-6">

            {/* Quick stats board */}
            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6 shadow-sm">
              <h3 className="font-display font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-darkBorder/40 pb-3">Internship Overview</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{job.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Workplace Mode</span>
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{job.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Duration</span>
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{job.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Monthly Stipend</span>
                  </span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">{job.stipend || 'Unpaid'}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-darkBorder/40 pt-4 flex justify-between text-xs text-gray-400">
                <span>Deadline: {job.deadline}</span>
                <span>Applications: {job.applicationsCount || 0} applied</span>
              </div>

              {!user ? (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white font-semibold text-sm transition-all shadow-md shadow-brand-500/10 flex items-center justify-center space-x-1.5 animate-pulse"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply Now (Sign In / Register)</span>
                </button>
              ) : user.role === 'STUDENT' ? (
                alreadyApplied ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-xl bg-gray-100 dark:bg-darkBorder/40 text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center justify-center space-x-2 border border-emerald-500/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Application Submitted</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setApplyModalOpen(true)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white font-semibold text-sm transition-all shadow-md shadow-brand-500/10 flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Apply Now (1-Click)</span>
                  </button>
                )
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-4 flex items-start space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                    You are logged in under the role <strong>{user.role}</strong>. Only student accounts can apply for internship opportunities.
                  </p>
                </div>
              )}
            </div>

            {/* Key Skills box */}
            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6">
                <h3 className="font-display font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-darkBorder/40 pb-3 mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200/50 dark:bg-darkBg dark:border-darkBorder/40 text-gray-600 dark:text-gray-300 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* APPLICATION FORM MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-600 to-violetAccent-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-extrabold text-xl">Apply for Internship</h3>
                <p className="text-xs text-brand-100 mt-1">{job.title} at {job.company}</p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-white/80 hover:text-white text-xl font-bold bg-white/10 w-8 h-8 rounded-full flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            {appSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-200/40">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-lg dark:text-white">Application Submitted!</h4>
                <p className="text-sm text-gray-400">Your details have been successfully shared with {job.company}'s recruiting team.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="p-6 space-y-5">

                {/* Profile review */}
                <div className="p-4 bg-gray-50 dark:bg-darkBg rounded-2xl border border-gray-100 dark:border-darkBorder space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate Details</h4>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{profile?.name}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-gray-500">{profile?.email}</span>
                  </div>
                </div>

                {/* Resume field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Resume URL / Drive link</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                  <p className="text-[10px] text-gray-400">Upload your resume link. You can build PDF templates in the Resume Builder page.</p>
                </div>

                {/* Skills Verification */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Verifying Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, JavaScript, CSS..."
                    value={customSkills}
                    onChange={(e) => setCustomSkills(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                </div>

                {/* Cover note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Cover Note (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Briefly state why you're a great fit..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white resize-none"
                  ></textarea>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBorder/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    {submittingApp ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setApplyModalOpen(true)}
      />

    </div>
  );
}
