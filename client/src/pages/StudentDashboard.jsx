import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Briefcase, Star, ClipboardList, Clock, Plus, Trash2, CheckCircle2, Award, Zap,
  AlertCircle, MessageSquare, BookOpen, ChevronRight, FileCode, FileText, Send, X, ExternalLink, Upload, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const API_BASE_URL = 'https://internbro.onrender.com/api';

export default function StudentDashboard() {
  const { user, profile, updateProfile } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  //checks
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('applications');

  // Applications, Saved Jobs state
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Profile Editor States
  const [skillsText, setSkillsText] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [dob, setDob] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [avatar, setAvatar] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [currentYear, setCurrentYear] = useState('');

  // Custom states for assignment deliverables
  const [allAssignments, setAllAssignments] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [codeFileProps, setCodeFileProps] = useState({ name: '', size: '', content: '' });
  const [wordFileProps, setWordFileProps] = useState({ name: '', size: '', content: '' });
  const [studentPreviewFile, setStudentPreviewFile] = useState(null);

  const fetchAssignmentsData = () => {
    const storedAssign = localStorage.getItem('internbro_assignments');
    if (storedAssign) setAllAssignments(JSON.parse(storedAssign));
    else {
      const defaultAssign = [
        { id: "assign-1", title: "React Forms and Hooks Assessment", description: "Implement a multi-step job application form using controlled React inputs, state hooks, and validation regex.", deadline: "2026-07-10", points: 100, createdAt: new Date(Date.now() - 3600000 * 30).toISOString() },
        { id: "assign-2", title: "Database Schema Design for InternBRO", description: "Design a relational schema (SQL DDL) for users, listings, applications, and verified skill badges.", deadline: "2026-07-20", points: 100, createdAt: new Date(Date.now() - 3600000 * 5).toISOString() }
      ];
      localStorage.setItem('internbro_assignments', JSON.stringify(defaultAssign));
      setAllAssignments(defaultAssign);
    }

    const storedSubs = localStorage.getItem('internbro_submissions');
    if (storedSubs) setAllSubmissions(JSON.parse(storedSubs));
    else {
      const defaultSubs = [
        {
          id: "sub-1",
          assignmentId: "assign-1",
          studentId: profile?.id || user?.id || 'student-uid-123',
          studentName: profile?.name || user?.name || 'Raj Sharma',
          studentEmail: user?.email || 'raj.student@internbro.com',
          codeFileName: "AppForm.jsx",
          codeFileSize: "4.2 KB",
          codeFileContent: "import React, { useState } from 'react';\n\nexport default function AppForm() {\n  const [email, setEmail] = useState('');\n  const [error, setError] = useState('');\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (!email.includes('@')) {\n      setError('Invalid email address');\n    } else {\n      setError('');\n      alert('Submitted successfully!');\n    }\n  };\n\n  return (\n    <form onSubmit={handleSubmit} className=\"p-4 bg-white rounded-lg\">\n      <label className=\"block text-xs font-bold\">Email</label>\n      <input type=\"email\" value={email} onChange={e => setEmail(e.target.value)} className=\"border rounded p-2 text-sm\" />\n      {error && <p className=\"text-red-500 text-xs\">{error}</p>}\n      <button type=\"submit\" className=\"bg-indigo-600 text-white px-4 py-2 rounded mt-2\">Submit</button>\n    </form>\n  );\n}",
          wordFileName: "ReactFormDocumentation.docx",
          wordFileSize: "24 KB",
          wordFileContent: "DOCUMENT SUMMARY:\nThis report documents the design and code implementation of the controlled application form component in React.\n- Section 1: Form Validation Logic. Describes the regular expressions used for phone and email fields.\n- Section 2: UX Guidelines. Outlines the interactive helper tooltips and real-time state feedback alerts.",
          submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          status: "Pending Review",
          grade: "",
          feedback: ""
        }
      ];
      localStorage.setItem('internbro_submissions', JSON.stringify(defaultSubs));
      setAllSubmissions(defaultSubs);
    }
  };

  const handleCodeFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sizeKB = (file.size / 1024).toFixed(1) + ' KB';
    const reader = new FileReader();
    reader.onload = (event) => {
      setCodeFileProps({
        name: file.name,
        size: sizeKB,
        content: event.target.result || '// Code file uploaded successfully.'
      });
    };
    reader.readAsText(file);
  };

  const handleWordFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sizeKB = (file.size / 1024).toFixed(1) + ' KB';
    const reader = new FileReader();
    reader.onload = (event) => {
      const isTxt = file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json');
      setWordFileProps({
        name: file.name,
        size: sizeKB,
        content: isTxt ? event.target.result : `DOCUMENT SUMMARY:\nThis report documents the design specifications and structural implementation for deliverables under assignment "${file.name}".\n\nFile Name: ${file.name}\nFile Size: ${sizeKB}\nUpload Time: ${new Date().toLocaleString()}\n\n[Relational Database Schema & System Architecture diagram has been compiled into the doc package.]`
      });
    };
    reader.readAsText(file);
  };

  const handleAssignmentSubmit = (e, assignId) => {
    e.preventDefault();
    if (!codeFileProps.name && !wordFileProps.name) {
      alert("Please upload at least one Code file or Word document file to submit.");
      return;
    }

    const newSub = {
      id: 'sub-' + Date.now(),
      assignmentId: assignId,
      studentId: profile?.id || user?.id || 'student-uid-123',
      studentName: profile?.name || user?.name || 'Raj Sharma',
      studentEmail: user?.email || 'raj.student@internbro.com',
      codeFileName: codeFileProps.name,
      codeFileSize: codeFileProps.size,
      codeFileContent: codeFileProps.content,
      wordFileName: wordFileProps.name,
      wordFileSize: wordFileProps.size,
      wordFileContent: wordFileProps.content,
      submittedAt: new Date().toISOString(),
      status: 'Pending Review',
      grade: '',
      feedback: ''
    };

    const storedSubs = JSON.parse(localStorage.getItem('internbro_submissions') || '[]');
    // Filter out any previous submissions for this assignment by this student
    const updatedSubs = [newSub, ...storedSubs.filter(s => !(s.assignmentId === assignId && s.studentId === newSub.studentId))];
    localStorage.setItem('internbro_submissions', JSON.stringify(updatedSubs));
    setAllSubmissions(updatedSubs);

    // Reset upload forms state
    setCodeFileProps({ name: '', size: '', content: '' });
    setWordFileProps({ name: '', size: '', content: '' });

    // Document activity log
    const storedActs = JSON.parse(localStorage.getItem('internbro_activities') || '[]');
    const targetAssign = allAssignments.find(a => a.id === assignId);
    storedActs.unshift({
      id: 'act-' + Date.now(),
      user: newSub.studentName,
      role: 'student',
      action: `Submitted deliverables for assignment "${targetAssign?.title || 'Practical Assessment'}"`,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('internbro_activities', JSON.stringify(storedActs));

    alert("Your assignment files have been uploaded and submitted for admin grading!");
  };

  // Skill Assessment State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Community Forum & Blogs state
  const [discussions, setDiscussions] = useState([]);
  const [selectedDisc, setSelectedDisc] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newChannel, setNewChannel] = useState('Engineering');
  const [replyText, setReplyText] = useState('');
  const [blogs, setBlogs] = useState([]);

  const quizQuestions = [
    {
      q: "Which hook is used to perform side effects in React?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      ans: 1
    },
    {
      q: "What is the correct way to pass a ref to a child element?",
      options: ["ref={myRef}", "customRef={myRef}", "forwardRef wrapper", "pass as standard prop"],
      ans: 2
    },
    {
      q: "Which CSS display utility enables Tailwind's grid positioning?",
      options: ["flex", "block", "grid", "inline"],
      ans: 2
    }
  ];

  const fetchDashboardData = async () => {
    if (!profile) return;
    setLoadingApps(true);
    try {
      // 1. Fetch applied internships
      const appRes = await fetch(`${API_BASE_URL}/applications?studentId=${profile.uid}`);
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData);
      }

      // 2. Fetch saved jobs
      const savedIds = profile.profile?.savedJobs || [];
      if (savedIds.length > 0) {
        const jobsRes = await fetch(`https://internbro.onrender.com/internships/?status=Approved`);
        if (jobsRes.ok) {
          const allJobs = await jobsRes.json();
          const mapped = allJobs.map(j => ({
            ...j,
            skillsRequired: j.skills ? j.skills.split(',').map(s => s.trim()) : [],
          }));
          const filteredSaved = mapped.filter(j => savedIds.includes(j.id || j._id));
          setSavedJobs(filteredSaved);
        }
      } else {
        setSavedJobs([]);
      }


      // 3.0. Fetch discussions
      const discRes = await fetch(`${API_BASE_URL}/discussions`);
      if (discRes.ok) {
        const discData = await discRes.json();
        setDiscussions(discData);
      }

      // 4. Fetch blogs
      const blogsRes = await fetch(`${API_BASE_URL}/blogs`);
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData);
      }
    } catch (err) {
      console.warn("Backend unavailable. Loading student mockup dashboard metrics.");
      setApplications([
        {
          id: "app-1",
          jobDetails: { title: "Software Engineering Intern (Frontend)", company: "Google", location: "Bangalore", stipend: "₹85,000", deadline: "2026-06-30" },
          status: "Shortlisted",
          appliedAt: new Date().toISOString()
        },
        {
          id: "app-2",
          jobDetails: { title: "UI/UX Design Intern", company: "Figma", location: "Remote", stipend: "$3,000", deadline: "2026-06-25" },
          status: "Applied",
          appliedAt: new Date().toISOString()
        }
      ]);
      setSavedJobs([
        {
          id: "job-3",
          title: "Backend Engineering Intern",
          company: "Stripe",
          location: "San Francisco",
          type: "Hybrid",
          duration: "6 Months",
          stipend: "$5,500",
          deadline: "2026-07-15"
        }
      ]);
      setDiscussions([
        {
          id: "disc-1",
          channel: "Engineering",
          title: "How to prepare for Frontend React internships?",
          content: "Hi all! I am looking for tips on what topics recruiters ask in frontend developer internships. Should I focus on Redux or custom React hooks?",
          author: "Raj Sharma",
          replies: [
            { author: "Amit Verma", content: "Focus heavily on JavaScript fundamentals (closures, event loop) and React hooks like useEffect and custom hooks!", date: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: "disc-2",
          channel: "General",
          title: "Tell me about InternBRO referral program",
          content: "Does InternBRO have a referral system? How does it benefit us?",
          author: "Sneha Patel",
          replies: [
            { author: "Admin", content: "Yes! You can invite your college mates using your referral code in the student dashboard and earn premium career resources!", date: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString()
        }
      ]);
      setBlogs([
        {
          id: "blog-1",
          title: "10 Resume Tips to Ace Your First Tech Internship",
          category: "Resume Tips",
          content: "Your resume is your ticket to the first round of interviews. Here are 10 core checklist tips including listing projects with direct links, using action words, and tailoring skills to the job description...",
          author: "Meera Nair",
          readTime: "5 min read",
          image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=60",
          createdAt: new Date().toISOString()
        },
        {
          id: "blog-2",
          title: "Mastering the Technical Interview: A Complete Prep Guide",
          category: "Interview Prep",
          content: "Technical interviews can be daunting. Start by brushing up on core DSA concepts (Arrays, Strings, HashMaps, Trees). Practice mock interview talking points, and always explain your code out loud...",
          author: "Karan Johar",
          readTime: "7 min read",
          image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent || !profile) return;
    try {
      const res = await fetch(`${API_BASE_URL}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: newChannel,
          title: newTitle,
          content: newContent,
          author: profile.name
        })
      });
      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        alert("Discussion thread posted successfully!");
        fetchDashboardData();
      }
    } catch (err) {
      console.warn("Backend server down. Simulating forum posting locally.");
      const mockPost = {
        id: 'disc-' + Date.now(),
        channel: newChannel,
        title: newTitle,
        content: newContent,
        author: profile?.name || 'Student Builder',
        replies: [],
        createdAt: new Date().toISOString()
      };
      setDiscussions(prev => [mockPost, ...prev]);
      setNewTitle('');
      setNewContent('');
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText || !selectedDisc || !profile) return;
    const discId = selectedDisc.id || selectedDisc._id;
    try {
      const res = await fetch(`${API_BASE_URL}/discussions/${discId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: profile.name,
          content: replyText
        })
      });
      if (res.ok) {
        setReplyText('');
        fetchDashboardData();
        // Refresh selected thread
        const updatedDisc = await res.json();
        setSelectedDisc(updatedDisc);
      }
    } catch (err) {
      console.warn("Backend down. Simulating reply post locally.");
      const mockReply = {
        author: profile?.name || 'Student Builder',
        content: replyText,
        date: new Date().toISOString()
      };
      const updatedDisc = {
        ...selectedDisc,
        replies: [...(selectedDisc.replies || []), mockReply]
      };
      setSelectedDisc(updatedDisc);
      setDiscussions(prev => prev.map(d => (d.id === discId || d._id === discId) ? updatedDisc : d));
      setReplyText('');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAssignmentsData();
    // Set edit variables
    if (profile?.profile) {
      setSkillsText(profile.profile.skills?.join(', ') || '');
      setBio(profile.profile.bio || '');
      setPhone(profile.profile.phone || '');
      setResumeUrl(profile.profile.resumeUrl || '');
      setTitle(profile.profile.title || '');
      setDob(profile.profile.dob || '');
      setCollegeId(profile.profile.collegeId || '');
      setBranch(profile.profile.branch || '');
      setGraduationYear(profile.profile.graduationYear || '');
      setExperienceText(profile.profile.experienceText || '');
      setAvatar(profile.profile.avatar || '');
      setCollegeName(profile.profile.collegeName || '');
      setCurrentYear(profile.profile.currentYear || '');
    }
  }, [profile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    const updatedPayload = {
      profile: {
        ...profile?.profile,
        skills: skillsArray,
        bio,
        phone,
        resumeUrl,
        title,
        dob,
        collegeId,
        branch,
        graduationYear,
        experienceText,
        avatar,
        collegeName,
        currentYear,
        mobile_no: phone
      }
    };
    const ok = await updateProfile(updatedPayload);
    if (ok) {
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile.");
    }
  };

  const handleAnswerClick = (idx) => {
    setSelectedAnswer(idx);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === quizQuestions[currentQuestion].ans) {
      setScore(prev => prev + 1);
    }

    setSelectedAnswer(null);

    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleSaveCertificate = async () => {
    const totalScore = selectedAnswer === quizQuestions[currentQuestion].ans ? score + 1 : score;
    const finalScore = Math.round((totalScore / quizQuestions.length) * 100);

    if (finalScore >= 66) {
      const currentCerts = profile?.profile?.certificates || [];
      const newCert = {
        testName: "Frontend React Verified Assessment",
        score: `${finalScore}%`,
        date: new Date().toLocaleDateString()
      };

      const updatedPayload = {
        profile: {
          ...profile?.profile,
          certificates: [...currentCerts, newCert]
        }
      };

      await updateProfile(updatedPayload);
      alert("Verified skill credential added to your profile! Show it off to recruiters.");
    }

    // Reset quiz
    setQuizStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setQuizFinished(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBg py-16 px-4 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl p-8 text-center shadow-xl space-y-6 relative overflow-hidden page-transition">
          {/* Background subtle gradients */}
          <div className="absolute -right-16 -top-16 w-36 h-36 bg-brand-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-violetAccent-500/10 rounded-full blur-3xl"></div>

          <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-violetAccent-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <Zap className="w-8 h-8 animate-pulse-slow text-amber-300 fill-amber-300" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white leading-tight">
              Unlock Your Career Journey
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your profile or sign in to explore premium internship tools.
            </p>
          </div>

          <div className="text-left space-y-3.5 bg-gray-50 dark:bg-darkBg/50 border border-gray-100 dark:border-darkBorder p-5 rounded-2xl">
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>One-Click Applications & Tracking</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>AI Resume Analyzer & Match Scoring</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>Interactive Skill Assessments & Badging</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>AI Career Advisor & Live Prep Forum</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Get Started Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={() => { }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* PROFILE CARD & NAVIGATION PANEL */}
          <div className="space-y-6">

            {/* Student visual portfolio card */}
            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 shadow-sm text-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-full border-2 border-brand-500 mx-auto overflow-hidden bg-brand-50 mb-4">
                <img
                  src={profile?.profile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display font-extrabold text-lg text-gray-900 dark:text-white leading-tight">{profile?.name || user?.name}</h3>
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">{profile?.profile?.title || 'Aspiring Professional'}</p>

              {profile?.profile?.education?.[0] && (
                <p className="text-xs text-gray-400 mt-2 italic truncate">{profile.profile.education[0].school}</p>
              )}

              {/* Verified certificates count banner */}
              {profile?.profile?.certificates && profile.profile.certificates.length > 0 && (
                <div className="mt-4 inline-flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>{profile.profile.certificates.length} Verified Credentials</span>
                </div>
              )}
            </div>

            {/* Sidebar Dash Navigation Tabs */}
            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-3 space-y-1 shadow-sm">
              <button
                onClick={() => setActiveTab('applications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'applications'
                  ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>My Applications</span>
                {applications.length > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-brand-100 dark:bg-brand-900/40 rounded-full font-bold">{applications.length}</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'saved'
                  ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Star className="w-4 h-4" />
                <span>Saved Jobs</span>
              </button>

              <button
                onClick={() => setActiveTab('assessments')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'assessments'
                  ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Award className="w-4 h-4" />
                <span>Skill Assessments</span>
              </button>

              <button
                onClick={() => setActiveTab('view-profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'view-profile'
                  ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Eye className="w-4 h-4" />
                <span>View Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'profile'
                  ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <User className="w-4 h-4" />
                <span>Edit Profile Info</span>
              </button>

              <button
                onClick={() => { setActiveTab('community'); setSelectedDisc(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'community'
                  ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Community & Blogs</span>
              </button>

              <button
                onClick={() => setActiveTab('assignments')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'assignments'
                  ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>My Assignments</span>
              </button>
            </div>

            {/* AI Shortcut Box */}
            <div className="bg-gradient-to-tr from-brand-600 to-violetAccent-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <h4 className="font-display font-extrabold text-base flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>AI Workspace</span>
                </h4>
                <p className="text-xs text-brand-100 leading-relaxed">Tailor your PDF resume on-the-fly and chat directly with our AI coaching advisor to double your shortlist rates.</p>
                <Link
                  to="/ai-assistant"
                  className="inline-block bg-white text-brand-600 hover:bg-brand-50 text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors pt-2.5"
                >
                  Launch Career Workspace
                </Link>
              </div>
            </div>

          </div>

          {/* MAIN DYNAMIC CONTENT COLUMN */}
          <div className="lg:col-span-3 space-y-8">

            {/* TAB CONTENT: APPLICATIONS */}
            {activeTab === 'applications' && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6">
                <div>
                  <h2 className="font-display font-extrabold text-xl dark:text-white">Active Applications</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time status updates of your applications pipeline.</p>
                </div>

                {loadingApps ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-400 font-semibold">Retrieving submissions...</span>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm space-y-2">
                    <ClipboardList className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="font-medium">You haven't submitted any internship applications yet.</p>
                    <Link to="/listings" className="text-brand-500 underline font-semibold text-xs inline-block">Browse internships list</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app, idx) => {
                      const job = app.jobDetails || {};

                      // Status colors & indicators
                      const statusMap = {
                        Applied: { bg: 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border-brand-200', desc: 'Applied successfully. Recruiter is reviewing details.' },
                        Shortlisted: { bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200', desc: 'Congratulations! Your profile has been shortlisted.' },
                        Rejected: { bg: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200', desc: 'Recruiter did not short-list your resume this time.' }
                      };

                      const currentStatus = statusMap[app.status] || statusMap.Applied;

                      return (
                        <div
                          key={app.id || app._id || idx}
                          className="border border-gray-100 dark:border-darkBorder/40 rounded-2xl p-5 hover:bg-gray-50/50 dark:hover:bg-darkCard/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white hover:text-brand-500 transition-colors">
                                <Link to={`/listings/${app.jobId}`}>{job.title || 'Internship Opportunity'}</Link>
                              </h4>
                              <p className="text-xs text-gray-500">{job.company || 'Vetted Partner'} &bull; {job.location || 'Remote'}</p>
                            </div>

                            <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${currentStatus.bg} w-max`}>
                              {app.status}
                            </span>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-darkBorder/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-400">
                            <span className="flex items-center space-x-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                            </span>
                            <span className="font-semibold text-gray-500 dark:text-gray-300 italic">{currentStatus.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SAVED JOBS */}
            {activeTab === 'saved' && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6">
                <div>
                  <h2 className="font-display font-extrabold text-xl dark:text-white">Saved Internships</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Shortlist of roles you've highlighted for later review.</p>
                </div>

                {loadingApps ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : savedJobs.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm space-y-2">
                    <Star className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="font-medium">You haven't highlighted any jobs yet.</p>
                    <Link to="/listings" className="text-brand-500 underline font-semibold text-xs inline-block">Explore listings feed</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedJobs.map((job) => (
                      <div
                        key={job.id || job._id}
                        className="p-4 border border-gray-100 dark:border-darkBorder/40 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-darkCard/40 transition-colors flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white hover:text-brand-500 transition-colors truncate max-w-[180px]">
                            <Link to={`/listings/${job.id || job._id}`}>{job.title}</Link>
                          </h4>
                          <p className="text-xs text-gray-400">{job.company} &bull; {job.type}</p>
                        </div>
                        <Link
                          to={`/listings/${job.id || job._id}`}
                          className="px-3.5 py-1.5 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 text-xs font-semibold rounded-lg hover:bg-brand-100"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SKILL ASSESSMENTS */}
            {activeTab === 'assessments' && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6">
                <div>
                  <h2 className="font-display font-extrabold text-xl dark:text-white">Verify Your Skills</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Take short assessment tests to verify your competency and earn verified badges for recruiters.</p>
                </div>

                {!quizStarted ? (
                  <div className="border border-brand-100 dark:border-brand-900/30 bg-brand-50/20 dark:bg-darkCard rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-2 text-center sm:text-left">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center justify-center sm:justify-start space-x-1.5">
                        <Award className="w-4 h-4 text-brand-500" />
                        <span>Frontend React Assessment</span>
                      </h3>
                      <p className="text-xs text-gray-400 max-w-sm">3 standard questions covering React Hooks, Tailwind configurations, and data passing protocols. Score 100% to earn a credential.</p>
                    </div>
                    <button
                      onClick={() => { setQuizStarted(true); setQuizFinished(false); }}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md"
                    >
                      Start Assessment
                    </button>
                  </div>
                ) : quizFinished ? (
                  <div className="text-center p-6 space-y-4 max-w-sm mx-auto animate-fade-in border border-gray-100 dark:border-darkBorder rounded-2xl">
                    <Award className="w-12 h-12 text-brand-500 fill-brand-500/10 mx-auto" />
                    <h3 className="font-display font-extrabold text-lg dark:text-white">Assessment Complete!</h3>

                    {score >= 2 ? (
                      <div className="space-y-3">
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-2 rounded-xl inline-block border border-emerald-200/40">
                          PASSED: Score {Math.round((score / quizQuestions.length) * 100)}%
                        </div>
                        <p className="text-xs text-gray-400">Excellent job! You successfully proved your frontend skills. Add your credential below.</p>
                        <button
                          onClick={handleSaveCertificate}
                          className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-violetAccent-500 text-white font-semibold rounded-xl text-xs"
                        >
                          Generate Credential Badge
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold px-3 py-2 rounded-xl inline-block border border-red-200/40">
                          FAILED: Score {Math.round((score / quizQuestions.length) * 100)}%
                        </div>
                        <p className="text-xs text-gray-400">Requirements: Minimum 66% (2/3 correct) score required to earn a badge. Study up and try again!</p>
                        <button
                          onClick={() => { setQuizStarted(false); }}
                          className="w-full py-2.5 bg-gray-100 dark:bg-darkBorder hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-xs"
                        >
                          Back to dashboard
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-100 dark:border-darkBorder rounded-2xl p-6 space-y-6 max-w-lg mx-auto">
                    <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <span>React Assessment</span>
                      <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    </div>

                    <h4 className="font-semibold text-base text-gray-900 dark:text-white leading-tight">{quizQuestions[currentQuestion].q}</h4>

                    <div className="space-y-2">
                      {quizQuestions[currentQuestion].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswerClick(i)}
                          className={`w-full text-left p-3.5 text-sm rounded-xl border transition-all ${selectedAnswer === i
                            ? 'bg-brand-50 dark:bg-brand-950/20 border-brand-500 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                            : 'bg-gray-50 border-gray-200/60 dark:bg-darkBg dark:border-darkBorder/40 hover:bg-gray-100 hover:border-gray-300 dark:text-gray-300'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswer === null}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      {currentQuestion + 1 === quizQuestions.length ? 'Submit Assessment' : 'Next Question'}
                    </button>
                  </div>
                )}

                {/* Certificates display list */}
                {profile?.profile?.certificates && profile.profile.certificates.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-darkBorder/40 pt-6">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4">My Credentials Portfolio</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.profile.certificates.map((cert, idx) => (
                        <div key={idx} className="p-4 bg-emerald-50/10 border border-emerald-200/40 rounded-2xl flex items-center space-x-3.5">
                          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-200/40 rounded-xl flex items-center justify-center">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">{cert.testName}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">Score: {cert.score} &bull; Earned: {cert.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: VIEW PROFILE */}
            {activeTab === 'view-profile' && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6">

                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-100 dark:border-darkBorder/40">
                  <img
                    src={avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.name || 'user'}`}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-brand-500/20 shadow-md"
                  />
                  <div className="text-center sm:text-left space-y-1.5 flex-grow">
                    <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">{profile?.name || 'Student Name'}</h2>
                    <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{title || 'Aspiring Professional'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">{bio || 'No bio written yet. Edit your profile to write a bio!'}</p>
                  </div>
                  {resumeUrl && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow h-fit self-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Resume</span>
                    </a>
                  )}
                </div>

                {/* Contact & Education Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Left Column: Personal info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Details</h3>
                    <div className="bg-gray-50 dark:bg-darkBg p-4 rounded-2xl border border-gray-100 dark:border-darkBorder/40 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Email:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{profile?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Mobile No:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Date of Birth:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{dob || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">College Name:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{collegeName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Current Year:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{currentYear || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Academic Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Academic & College Info</h3>
                    <div className="bg-gray-50 dark:bg-darkBg p-4 rounded-2xl border border-gray-100 dark:border-darkBorder/40 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">College Roll ID:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{collegeId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Branch:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{branch || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Graduation Year:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{graduationYear || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Skills Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skills Checklist</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsText ? (
                      skillsText.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-brand-50/60 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 text-xs rounded-xl font-medium border border-brand-200/50"
                        >
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No skills listed yet.</span>
                    )}
                  </div>
                </div>

                {/* Experience & Prior Projects */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prior Experience</h3>
                    <div className="p-4 bg-gray-50 dark:bg-darkBg rounded-2xl border border-gray-100 dark:border-darkBorder/40 text-xs text-gray-650 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {experienceText || "No experience details added yet."}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: EDIT PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6">
                <div>
                  <h2 className="font-display font-extrabold text-xl dark:text-white">Profile Workspace</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Edit details to improve your automated resume analyzer match percentage.</p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  {/* Profile Avatar Upload */}
                  <div className="space-y-1.5 mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Profile Image / Photo</label>
                    <div className="flex items-center space-x-4 bg-gray-50 dark:bg-darkBg p-3 border border-gray-200 dark:border-darkBorder rounded-2xl">
                      <img
                        src={avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.name || 'user'}`}
                        alt="Avatar Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-brand-500/20 shadow"
                      />
                      <div className="space-y-1 flex-grow">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="text-xs text-gray-550 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-brand-50 file:text-brand-600 dark:file:bg-brand-950/20 dark:file:text-brand-400 hover:file:bg-brand-100 cursor-pointer"
                        />
                        <p className="text-[9px] text-gray-400 leading-none">Supports PNG, JPG, or WEBP (Max 2MB)</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                      <input
                        type="text"
                        value={profile?.name || ''}
                        disabled
                        className="w-full bg-gray-100 dark:bg-darkBg/30 border border-gray-200 dark:border-darkBorder/40 text-sm rounded-xl px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Professional Title</label>
                      <input
                        type="text"
                        placeholder="React Engineer Intern, Aspiring PM"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full bg-gray-100 dark:bg-darkBg/30 border border-gray-200 dark:border-darkBorder/40 text-sm rounded-xl px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">College Roll ID</label>
                      <input
                        type="text"
                        placeholder="2K23/CO/192"
                        value={collegeId}
                        onChange={(e) => setCollegeId(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Branch / Field</label>
                      <input
                        type="text"
                        placeholder="Computer Science"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Expected Grad Year</label>
                      <input
                        type="text"
                        placeholder="2027"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">College / University Name</label>
                      <input
                        type="text"
                        placeholder="Delhi Technological University"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Current Year of Study</label>
                      <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                      >
                        <option value="">Select Year...</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Prior Experience</label>
                    <textarea
                      rows="3"
                      placeholder="List details of any previous coding projects, internships, or hackathon participations..."
                      value={experienceText}
                      onChange={(e) => setExperienceText(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Portfolio Bio</label>
                    <textarea
                      rows="3"
                      placeholder="Share your technical goals and project focuses..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Skills Checklist (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React.js, Node.js, JavaScript, Python, UI Design..."
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Resume Link / Google Drive URL</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="space-y-8 animate-fade-in">
                {/* CAREER BLOGS & CAREER TIPS SECTION */}
                <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6 shadow-sm">
                  <div>
                    <h2 className="font-display font-extrabold text-xl dark:text-white flex items-center space-x-1.5">
                      <BookOpen className="w-5 h-5 text-brand-500" />
                      <span>Career Guidance Blog & Placement Tips</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Vetted strategy papers and interview guides to stand out.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {blogs.map(blog => (
                      <div key={blog.id} className="border border-gray-100 dark:border-darkBorder/40 rounded-2xl overflow-hidden hover-card flex flex-col justify-between">
                        <img src={blog.image} alt={blog.title} className="w-full h-36 object-cover" />
                        <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded">{blog.category}</span>
                            <h4 className="font-bold text-sm text-gray-800 dark:text-white leading-tight mt-1">{blog.title}</h4>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{blog.content}</p>
                          </div>
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                            <span>By {blog.author}</span>
                            <span>{blog.readTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DISCUSSIONS AND CHANNELS SECTION */}
                <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6 shadow-sm">
                  <div>
                    <h2 className="font-display font-extrabold text-xl dark:text-white flex items-center space-x-1.5">
                      <MessageSquare className="w-5 h-5 text-violetAccent-500" />
                      <span>Prep Discussion Channels</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Solve doubts, network with students, and share interview feedback.</p>
                  </div>

                  {!selectedDisc ? (
                    <div className="space-y-6">
                      {/* New thread form */}
                      <form onSubmit={handleCreatePost} className="p-4 bg-gray-50 dark:bg-darkBg border rounded-2xl space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Start a New prep Thread</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Thread Title..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                            className="sm:col-span-2 bg-white dark:bg-darkCard border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none dark:text-white"
                          />
                          <select
                            value={newChannel}
                            onChange={(e) => setNewChannel(e.target.value)}
                            className="bg-white dark:bg-darkCard border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none dark:text-white"
                          >
                            <option value="Engineering">Engineering</option>
                            <option value="Design">Design</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                        <textarea
                          rows="2"
                          placeholder="What is your doubt or interview feedback?"
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          required
                          className="w-full bg-white dark:bg-darkCard border border-gray-200 text-xs rounded-xl p-3 focus:outline-none dark:text-white resize-none"
                        ></textarea>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold text-xs shadow"
                        >
                          Post Thread
                        </button>
                      </form>

                      {/* Threads list */}
                      <div className="space-y-3">
                        {discussions.map(disc => (
                          <div
                            key={disc.id || disc._id}
                            onClick={() => setSelectedDisc(disc)}
                            className="p-4 border border-gray-100 dark:border-darkBorder/40 rounded-xl hover:bg-gray-50/50 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-violetAccent-500 uppercase tracking-widest">{disc.channel}</span>
                              <h4 className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">{disc.title}</h4>
                              <p className="text-xs text-gray-400 mt-1">Asked by {disc.author} &bull; {disc.replies?.length || 0} replies</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 animate-fade-in border border-gray-100 p-5 rounded-2xl">
                      <button
                        onClick={() => setSelectedDisc(null)}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        &larr; Back to threads list
                      </button>

                      {/* Thread main post */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-violetAccent-500 uppercase tracking-wider">{selectedDisc.channel}</span>
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">{selectedDisc.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-sans">{selectedDisc.content}</p>
                        <div className="text-[10px] text-gray-400 pt-1">Posted by {selectedDisc.author}</div>
                      </div>

                      {/* Thread Replies */}
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Replies ({selectedDisc.replies?.length || 0})</h4>
                        {selectedDisc.replies?.map((rep, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-gray-600">
                              <span>{rep.author}</span>
                              <span className="text-gray-400 font-normal">{new Date(rep.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed font-sans">{rep.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Reply form */}
                      <form onSubmit={handlePostReply} className="pt-4 border-t flex space-x-2">
                        <input
                          type="text"
                          placeholder="Write a helpful answer..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          required
                          className="flex-grow bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none dark:text-white"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs shadow-sm"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: STUDENT ASSIGNMENTS */}
            {activeTab === 'assignments' && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6">
                <div>
                  <h2 className="font-display font-extrabold text-xl dark:text-white">Practical Assessments Workspace</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Complete practical tasks assigned by administrators. Upload separate code files and documentation reports.</p>
                </div>

                {allAssignments.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm space-y-2">
                    <BookOpen className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="font-medium">No assignments have been published yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {allAssignments.map((assign) => {
                      const sub = allSubmissions.find(s => s.assignmentId === assign.id && s.studentId === (profile?.id || user?.id || 'student-uid-123'));
                      const isGraded = sub?.status === 'Graded';

                      return (
                        <div
                          key={assign.id}
                          className="border border-gray-100 dark:border-darkBorder/40 rounded-2xl p-5 bg-gray-50/20 dark:bg-darkCard/10 space-y-4 hover:border-gray-200 dark:hover:border-darkBorder transition-all"
                        >
                          {/* Assignment Title Block */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-gray-100 dark:border-darkBorder/20 pb-3">
                            <div>
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white">{assign.title}</h4>
                              <p className="text-xs text-gray-400 mt-1 max-w-xl">{assign.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs px-2 py-0.5 bg-brand-50 border border-brand-200 text-brand-600 rounded-lg dark:bg-brand-950/20 dark:text-brand-400 font-bold whitespace-nowrap">
                                Max score: {assign.points} pts
                              </span>
                              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1.5 justify-end">
                                <Clock className="w-3 h-3" />
                                <span>Due: {assign.deadline}</span>
                              </p>
                            </div>
                          </div>

                          {/* Submission Details Form or View */}
                          {sub ? (
                            // ALREADY SUBMITTED VIEW
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-darkBg rounded-xl border border-gray-100 dark:border-darkBorder/30">
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className={`h-2.5 w-2.5 rounded-full ${isGraded ? 'bg-emerald-500 animate-pulse-slow' : 'bg-amber-500'}`}></span>
                                  <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {isGraded ? 'Assessment Evaluated' : 'Submissions Pending Review'}
                                  </span>
                                </div>

                                {isGraded ? (
                                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-lg border border-emerald-200">
                                    Score: {sub.grade} / {assign.points}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                )}
                              </div>

                              {/* Separate uploads columns */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Code file */}
                                <div className="p-3 border border-gray-100 dark:border-darkBorder/30 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center space-x-2.5">
                                    <FileCode className="w-5 h-5 text-emerald-500" />
                                    <div>
                                      <p className="text-xs font-bold text-gray-800 dark:text-white truncate max-w-[150px]">{sub.codeFileName || 'No Code File'}</p>
                                      <p className="text-[9px] text-gray-400">Code Deliverable &bull; {sub.codeFileSize || '0 KB'}</p>
                                    </div>
                                  </div>
                                  {sub.codeFileName && (
                                    <button
                                      onClick={() => setStudentPreviewFile({ title: sub.codeFileName, type: 'code', content: sub.codeFileContent })}
                                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-darkBg dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-0.5"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>View</span>
                                    </button>
                                  )}
                                </div>

                                {/* Word file */}
                                <div className="p-3 border border-gray-100 dark:border-darkBorder/30 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center space-x-2.5">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    <div>
                                      <p className="text-xs font-bold text-gray-800 dark:text-white truncate max-w-[150px]">{sub.wordFileName || 'No Doc File'}</p>
                                      <p className="text-[9px] text-gray-400">Documentation &bull; {sub.wordFileSize || '0 KB'}</p>
                                    </div>
                                  </div>
                                  {sub.wordFileName && (
                                    <button
                                      onClick={() => setStudentPreviewFile({ title: sub.wordFileName, type: 'word', content: sub.wordFileContent })}
                                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-darkBg dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-0.5"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>Read</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Grade feedback message */}
                              {isGraded && sub.feedback && (
                                <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-150 dark:border-emerald-900/30 rounded-xl space-y-1">
                                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Admin Review Comments</span>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 italic font-sans">"{sub.feedback}"</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            // SUBMISSION FORM (NOT SUBMITTED)
                            <form onSubmit={(e) => handleAssignmentSubmit(e, assign.id)} className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Code file upload channel */}
                                <div className="border border-dashed border-gray-250 dark:border-darkBorder rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2.5 relative bg-gray-50/30">
                                  <Upload className="w-6 h-6 text-emerald-500 animate-pulse-slow" />
                                  <div>
                                    <p className="text-xs font-bold text-gray-700 dark:text-white">Upload Code File</p>
                                    <p className="text-[9px] text-gray-400 mt-0.5">React components, scripts, or ZIP deliverables</p>
                                  </div>
                                  <input
                                    type="file"
                                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.html,.css,.zip"
                                    onChange={handleCodeFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  />
                                  {codeFileProps.name && (
                                    <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-200">
                                      Selected: {codeFileProps.name} ({codeFileProps.size})
                                    </div>
                                  )}
                                </div>

                                {/* Word file upload channel */}
                                <div className="border border-dashed border-gray-250 dark:border-darkBorder rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2.5 relative bg-gray-50/30">
                                  <Upload className="w-6 h-6 text-blue-500 animate-pulse-slow" />
                                  <div>
                                    <p className="text-xs font-bold text-gray-700 dark:text-white">Upload Word/Doc File</p>
                                    <p className="text-[9px] text-gray-400 mt-0.5">Word document, reports, PDF blueprints</p>
                                  </div>
                                  <input
                                    type="file"
                                    accept=".doc,.docx,.pdf,.txt,.md"
                                    onChange={handleWordFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  />
                                  {wordFileProps.name && (
                                    <div className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-lg border border-blue-200">
                                      Selected: {wordFileProps.name} ({wordFileProps.size})
                                    </div>
                                  )}
                                </div>

                              </div>

                              <div className="flex justify-end">
                                <button
                                  type="submit"
                                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Submit Deliverables</span>
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STUDENT PREVIEW FILE SYSTEM MODAL OVERLAY */}
            {studentPreviewFile && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-left">

                  {/* Modal Header */}
                  <div className="p-5 border-b border-gray-150 dark:border-darkBorder/40 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {studentPreviewFile.type === 'code' ? (
                        <FileCode className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{studentPreviewFile.title}</h3>
                        <p className="text-[10px] text-gray-400">File Type: {studentPreviewFile.type === 'code' ? 'Code Deliverable' : 'Documentation Report'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStudentPreviewFile(null)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-darkBg rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Content Preview */}
                  <div className="p-6 overflow-y-auto flex-grow bg-gray-50 dark:bg-darkBg text-xs font-mono text-gray-700 dark:text-gray-300 max-h-[60vh]">
                    {studentPreviewFile.type === 'code' ? (
                      <pre className="whitespace-pre-wrap font-mono p-4 bg-gray-900 text-green-400 rounded-2xl border border-gray-800 overflow-x-auto leading-relaxed">
                        {studentPreviewFile.content}
                      </pre>
                    ) : (
                      <div className="font-sans whitespace-pre-wrap p-4 bg-white dark:bg-darkCard rounded-2xl border border-gray-200 dark:border-darkBorder leading-relaxed text-gray-650 dark:text-gray-350">
                        {studentPreviewFile.content}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-gray-150 dark:border-darkBorder/40 flex justify-end">
                    <button
                      onClick={() => setStudentPreviewFile(null)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-darkBorder dark:hover:bg-brand-900/30 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Close Preview
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
