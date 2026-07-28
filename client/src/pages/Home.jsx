import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, Briefcase, Users, Building, ChevronRight, Star, ChevronDown, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import InternshipCard from '../components/InternshipCard';

const API_BASE_URL = 'https://internbro.onrender.com/api';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [faqOpen, setFaqOpen] = useState({});

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    //checks
    // Fetch featured jobs
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`https://internbro.onrender.com/internships/?status=Approved`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(j => ({
            ...j,
            skillsRequired: j.skills ? j.skills.split(',').map(s => s.trim()) : [],
            isFeatured: true
          }));
          setFeaturedJobs(mapped.slice(0, 3));
        }
      } catch (err) {
        console.warn("Backend server not started yet. Loading standalone landing page mock jobs.");
        setFeaturedJobs([
          {
            id: "job-1",
            title: "Software Engineering Intern (Frontend)",
            company: "Google",
            logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200&auto=format&fit=crop&q=60",
            location: "Bangalore, India",
            type: "Hybrid",
            duration: "6 Months",
            stipend: "₹85,000 / month",
            skillsRequired: ["React.js", "JavaScript", "TypeScript"],
            deadline: "2026-06-30",
            isFeatured: true
          },
          {
            id: "job-2",
            title: "UI/UX Design Intern",
            company: "Figma",
            logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=60",
            location: "Remote",
            type: "Remote",
            duration: "3 Months",
            stipend: "$3,000 / month",
            skillsRequired: ["Figma", "User Research", "Wireframing"],
            deadline: "2026-06-25",
            isFeatured: true
          },
          {
            id: "job-3",
            title: "Backend Engineering Intern",
            company: "Stripe",
            logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&auto=format&fit=crop&q=60",
            location: "San Francisco, USA",
            type: "Hybrid",
            duration: "6 Months",
            stipend: "$5,500 / month",
            skillsRequired: ["Node.js", "Express", "SQL"],
            deadline: "2026-07-15",
            isFeatured: true
          }
        ]);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const testimonials = [
    {
      name: "Rohit Deshmukh",
      role: "Software Intern at Google",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rohit",
      text: "InternBRO's AI Resume Analyzer helped me tailor my projects to match exactly what Google recruiters were looking for. The career assistant felt like having a personal coach in my pocket!",
      rating: 5
    },
    {
      name: "Neha Mehta",
      role: "UI/UX Intern at Figma",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Neha",
      text: "As a design student, finding high-quality remote internships is tough. With InternBRO, I applied with a single click and received a response the very next day. Seamless interface!",
      rating: 5
    },
    {
      name: "Marcus Vance",
      role: "Engineering Director at Stripe",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus",
      text: "The candidate matching quotient on InternBRO is phenomenal. The profiles are detailed, resumes are vetted, and shortlisting took our recruiting team half the usual time.",
      rating: 5
    }
  ];

  const faqs = [
    {
      q: "How does the AI Resume Analyzer work?",
      a: "Our AI Resume Analyzer reads your uploaded resume text and matches it against specific internship requirements. It scores your fit, outlines critical areas of improvement (like missing skills or generic descriptions), and guides you on tailoring it to get shortlisted."
    },
    {
      q: "Is InternBRO free for students?",
      a: "Yes! InternBRO is 100% free for students to build profiles, analyze resumes, chat with the AI career advisor, and apply to unlimited internship opportunities."
    },
    {
      q: "How can recruiters post listings and filter candidates?",
      a: "Recruiters can sign up, create a company profile, and post listings instantly. In the recruiter dashboard, you'll receive candidate lists with detailed match indicators, showing who has the exact skills needed, allowing one-click shortlisting."
    },
    {
      q: "What is the role of the AI Career Coach?",
      a: "The AI Career Coach uses Google's Gemini models to look at your skills, education, and target goals to give you personalized learning roadmaps, mock interview practice, and direct answers to career questions."
    }
  ];

  return (
    <div className="page-transition min-h-screen relative overflow-hidden bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300">

      {/* Background blobs for premium glow */}
      <div className="glow-blob w-[400px] h-[400px] bg-brand-500 top-[-100px] left-[-100px]"></div>
      <div className="glow-blob w-[500px] h-[500px] bg-violetAccent-500 bottom-[-100px] right-[-100px]"></div>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 px-4 py-1.5 rounded-full border border-brand-100 dark:border-brand-900/30 text-xs font-semibold shadow-sm shadow-brand-500/5 animate-pulse-slow">
            <Zap className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
            <span>AI-Driven Career Platform for Next-Gen Builders</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-gray-900 dark:text-white">
            Launch Your Career,<br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-violetAccent-500 bg-clip-text text-transparent">
              One Internship at a Time.
            </span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 font-normal max-w-2xl mx-auto leading-relaxed">
            The intelligent ecosystem that connects talented students with top-tier recruiters. Build resumes, ace interviews, and land dream roles with personalized AI guidance.
          </p>

          {/* Search bar inside Hero */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 p-2 bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder/40 rounded-2xl shadow-xl shadow-gray-200/40 dark:shadow-black/20">
            <div className="relative flex-grow w-full">
              <Briefcase className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search internships (e.g. React Developer, UI Designer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent text-sm border-0 focus:ring-0 focus:outline-none dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-violetAccent-500 text-white font-semibold text-sm hover:from-brand-700 hover:to-violetAccent-600 transition-all shadow-md shadow-brand-500/20"
            >
              Search Opportunities
            </button>
          </form>

          {/* Core Feature Quick Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-gray-100/80 border border-gray-200/50 dark:bg-darkCard dark:border-darkBorder/40 text-gray-600 dark:text-gray-300">⚡ AI Resume Analysis</span>
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-gray-100/80 border border-gray-200/50 dark:bg-darkCard dark:border-darkBorder/40 text-gray-600 dark:text-gray-300">💡 1-Click Applying</span>
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-gray-100/80 border border-gray-200/50 dark:bg-darkCard dark:border-darkBorder/40 text-gray-600 dark:text-gray-300">🤖 Interactive Career Coach</span>
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-gray-100/80 border border-gray-200/50 dark:bg-darkCard dark:border-darkBorder/40 text-gray-600 dark:text-gray-300">🛡️ Vetted Listings</span>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Active Opportunities" value="450+" icon={Briefcase} color="brand" />
          <StatCard label="Vetted Student Builders" value="12,500+" icon={Users} color="violet" />
          <StatCard label="Partnering Recruiters" value="120+" icon={Building} color="emerald" />
        </div>
      </section>

      {/* FEATURED INTERNSHIPS LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200/50 dark:border-darkBorder/30">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="font-display font-extrabold text-3xl dark:text-white">Featured Internships</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Verified postings with direct communication and attractive stipends.</p>
          </div>
          <Link
            to="/listings"
            className="inline-flex items-center space-x-1 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 mt-4 md:mt-0 transition-colors"
          >
            <span>Browse All Listings</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job, idx) => (
            <InternshipCard key={job.id || job._id || idx} job={job} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200/50 dark:border-darkBorder/30 bg-gray-50/50 dark:bg-darkCard/10 rounded-3xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-extrabold text-3xl dark:text-white">Success Stories</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Listen to students and talent acquirers talk about their journeys with InternBRO.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <div key={index} className="bg-white dark:bg-darkCard border border-gray-200/40 dark:border-darkBorder/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover-card">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-amber-500">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm italic text-gray-600 dark:text-gray-300 leading-relaxed">"{test.text}"</p>
              </div>
              <div className="flex items-center space-x-4 mt-6 pt-4 border-t border-gray-100 dark:border-darkBorder/40">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="w-10 h-10 rounded-full border bg-brand-50"
                />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{test.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECRUITER & STUDENT CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200/50 dark:border-darkBorder/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Student CTA */}
          <div className="bg-gradient-to-tr from-brand-600/90 to-brand-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between h-[300px]">
            <div className="relative z-10 space-y-4">
              <h3 className="font-display font-extrabold text-2xl">Looking for an Internship?</h3>
              <p className="text-brand-100 text-sm max-w-sm">Build your profile, analyze your resume, and let our AI recommendations guide you to top tech, design, and product internships.</p>
            </div>
            <button
              onClick={() => {
                if (user && user.role?.toUpperCase() === 'RECRUITER') {
                  navigate('/recruiter-dashboard');
                } else {
                  navigate('/student-dashboard');
                }
              }}
              className="w-max px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl text-sm shadow-md hover:bg-brand-50 transition-all z-10 flex items-center space-x-1"
            >
              <span>Student Profile Portal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <Rocket className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 text-white transform -rotate-12" />
          </div>

          {/* Recruiter CTA */}
          <div className="bg-gradient-to-tr from-violetAccent-600/90 to-violetAccent-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between h-[300px]">
            <div className="relative z-10 space-y-4">
              <h3 className="font-display font-extrabold text-2xl">Hiring Student Builders?</h3>
              <p className="text-violetAccent-100 text-sm max-w-sm">Post your internship listings, view applicants with high-quality AI match scores, and shortlist talent in clicks.</p>
            </div>
            <button
              onClick={() => {
                if (user && user.role?.toUpperCase() === 'STUDENT') {
                  navigate('/student-dashboard');
                } else {
                  navigate('/recruiter-dashboard');
                }
              }}
              className="w-max px-6 py-3 bg-white text-violetAccent-600 font-semibold rounded-xl text-sm shadow-md hover:bg-violetAccent-50 transition-all z-10 flex items-center space-x-1"
            >
              <span>Recruiter Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <Briefcase className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 text-white transform rotate-12" />
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200/50 dark:border-darkBorder/30">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl dark:text-white">Frequently Asked Questions</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Answers to generic platform queries.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = faqOpen[index] || false;
            return (
              <div
                key={index}
                className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between px-6 py-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-darkBorder/20 text-left"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-brand-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-darkBorder/20 leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
