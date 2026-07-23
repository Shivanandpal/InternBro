import React, { useState, useEffect } from 'react';
import {
  Shield, Briefcase, Users, Check, X, ShieldAlert, Award,
  Trash2, UserCheck, UserX, Search, PlusCircle, Calendar,
  BookOpen, FileCode, FileText, Download, Activity, ExternalLink, RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'https://internbro.onrender.com/api';

const calculateAge = (dobString) => {
  if (!dobString) return 'N/A';
  try {
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  } catch (e) {
    return 'N/A';
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeInternships: 0,
    pendingApproval: 0,
    totalStudents: 342,
    totalRecruiters: 48,
    totalApplications: 156
  });

  const [pendingJobs, setPendingJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  //checks
  // Active Tab: moderation, listings, users-activity, total-users, assignments
  const [activeTab, setActiveTab] = useState('moderation');

  // Custom states for local fallback & integrations
  const [activities, setActivities] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');

  // User tab state filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const getDynamicActivities = () => {
    const list = [];

    // 1. Add recent applications
    applications.forEach(app => {
      list.push({
        id: app.id || app._id,
        user: app.studentName || 'Student',
        role: 'student',
        action: `Applied for '${app.jobDetails?.title || 'Internship'}' at ${app.jobDetails?.company || 'Company'}`,
        timestamp: app.appliedAt || new Date().toISOString()
      });
    });

    // 2. Add recent users
    usersList.forEach(u => {
      list.push({
        id: u.uid || u.id,
        user: u.name,
        role: u.role?.toLowerCase(),
        action: `Registered a new ${u.role?.toLowerCase()} account`,
        timestamp: u.createdAt || new Date(Date.now() - 3600000 * 24).toISOString()
      });
    });

    // 3. Add recent internships
    allJobs.forEach(job => {
      list.push({
        id: job.id || job._id,
        user: job.company || 'Recruiter',
        role: 'recruiter',
        action: `Posted a new internship listing: '${job.title}'`,
        timestamp: job.created_at || new Date(Date.now() - 3600000 * 12).toISOString()
      });
    });

    // Sort all by timestamp descending
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 30);
  };

  const getMostPopularInternship = () => {
    if (applications.length === 0) return 'None';
    const counts = {};
    let maxCount = 0;
    let popularJobTitle = 'None';

    applications.forEach(app => {
      const title = app.jobDetails?.title || 'Unknown Internship';
      const company = app.jobDetails?.company || '';
      const key = `${title} (${company})`;
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] > maxCount) {
        maxCount = counts[key];
        popularJobTitle = key;
      }
    });

    return `${popularJobTitle} (${maxCount} applied)`;
  };

  // Assignment Form State
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignPoints, setAssignPoints] = useState(100);
  const [assignInternshipId, setAssignInternshipId] = useState('');

  // Grading states
  const [gradingSubId, setGradingSubId] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');

  // Previews modals
  const [previewFile, setPreviewFile] = useState(null); // { title: '', type: 'code'|'word', content: '' }

  const fetchAdminData = async () => {
    setLoading(true);

    // 1. Fetch analytics
    try {
      const statsRes = await fetch(`${API_BASE_URL}/analytics`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.warn("Could not retrieve analytics data.", err);
    }

    // 2. Fetch all jobs from Neon PostgreSQL Database (Python Backend)
    try {
      const jobsRes = await fetch(`https://internbro.onrender.com/internships/`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        const mappedJobs = jobsData.map(j => ({
          ...j,
          skillsRequired: j.skills ? j.skills.split(',').map(s => s.trim()) : [],
          // Default to 'Pending' (not 'Approved') so new recruiter postings surface in the moderation queue
          status: j.status || 'Pending'
        }));
        setAllJobs(mappedJobs);
        // Filter for both 'Pending' (new) and case-insensitive variants
        setPendingJobs(mappedJobs.filter(j => j.status?.toLowerCase() === 'pending'));
      }
    } catch (err) {
      console.warn("Could not retrieve internship listings from Python backend.", err);
    }

    // 3. Fetch all users from Neon PostgreSQL Database (Python Backend)
    try {
      const token = localStorage.getItem('token');
      const usersRes = await fetch(`https://internbro.onrender.com/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const formattedUsers = usersData.map(u => ({
          uid: u.id,
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          premium: u.premium,
          createdAt: u.created_at,
          profile: {
            dob: u.dob || '',
            collegeName: u.college_name || '',
            mobile_no: u.mobile_no || '',
            resumeUrl: ''
          }
        }));
        setUsersList(formattedUsers);
      }
    } catch (err) {
      console.warn("Could not retrieve users list from Python backend.", err);
    }

    // 4. Fetch all applications
    try {
      const appsRes = await fetch(`${API_BASE_URL}/applications`);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }
    } catch (err) {
      console.warn("Could not retrieve applications from Express backend.", err);
    }

    setLoading(false);
  };

  // Synchronize localStorage datasets on mount
  useEffect(() => {
    fetchAdminData();

    // 1. Load Activity log
    let localAct = localStorage.getItem('internbro_activities');
    if (!localAct) {
      const defaultActs = [
        { id: "act-1", user: "Raj Sharma", role: "student", action: "Submitted assignment 'React Forms and Hooks Assessment' with files", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: "act-2", user: "Raj Sharma", role: "student", action: "Applied for 'Software Engineering Intern (Frontend)' at Google", timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
        { id: "act-3", user: "Sarah Jenkins", role: "recruiter", action: "Created recruiter profile for Google Inc.", timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
        { id: "act-4", user: "Alexander Bro", role: "admin", action: "Assigned new assignment 'React Forms and Hooks Assessment'", timestamp: new Date(Date.now() - 3600000 * 30).toISOString() }
      ];
      localStorage.setItem('internbro_activities', JSON.stringify(defaultActs));
      localAct = JSON.stringify(defaultActs);
    }
    setActivities(JSON.parse(localAct));

    // 2. Load users list
    let localUsers = localStorage.getItem('internbro_users');
    if (!localUsers) {
      const defaultUsers = [
        { uid: "admin-uid-789", name: "Alexander Bro", email: "system.admin@internbro.com", role: "admin", status: "Active" },
        { uid: "recruiter-uid-456", name: "Sarah Jenkins", email: "recruiting@google.com", role: "recruiter", status: "Active", company: "Google Inc." },
        { uid: "recruiter-uid-figma", name: "John Doe", email: "hr@figma.com", role: "recruiter", status: "Active", company: "Figma" },
        { uid: "student-uid-123", name: "Raj Sharma", email: "raj.student@internbro.com", role: "student", status: "Active", college: "Delhi Technological University" },
        { uid: "student-uid-789", name: "Amit Verma", email: "amit.developer@gmail.com", role: "student", status: "Active", college: "IIT Delhi" },
        { uid: "student-uid-sneha", name: "Sneha Patel", email: "sneha.patel@gmail.com", role: "student", status: "Active", college: "Mumbai University" }
      ];
      localStorage.setItem('internbro_users', JSON.stringify(defaultUsers));
      localUsers = JSON.stringify(defaultUsers);
    }
    setUsersList(JSON.parse(localUsers));

    // 3. Load assignments list
    let localAssign = localStorage.getItem('internbro_assignments');
    if (!localAssign) {
      const defaultAssign = [
        { id: "assign-1", title: "React Forms and Hooks Assessment", description: "Implement a multi-step job application form using controlled React inputs, state hooks, and validation regex.", deadline: "2026-07-10", points: 100, createdAt: new Date(Date.now() - 3600000 * 30).toISOString() },
        { id: "assign-2", title: "Database Schema Design for InternBRO", description: "Design a relational schema (SQL DDL) for users, listings, applications, and verified skill badges.", deadline: "2026-07-20", points: 100, createdAt: new Date(Date.now() - 3600000 * 5).toISOString() }
      ];
      localStorage.setItem('internbro_assignments', JSON.stringify(defaultAssign));
      localAssign = JSON.stringify(defaultAssign);
    }
    const parsedAssign = JSON.parse(localAssign);
    setAssignments(parsedAssign);
    if (parsedAssign.length > 0) {
      setSelectedAssignmentId(parsedAssign[0].id);
    }

    // 4. Load submissions list
    let localSubs = localStorage.getItem('internbro_submissions');
    if (!localSubs) {
      const defaultSubs = [
        {
          id: "sub-1",
          assignmentId: "assign-1",
          studentId: "student-uid-123",
          studentName: "Raj Sharma",
          studentEmail: "raj.student@internbro.com",
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
      localSubs = JSON.stringify(defaultSubs);
    }
    setSubmissions(JSON.parse(localSubs));
  }, []);

  const handleModeration = async (jobId, action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ No admin token found. Please log out and log back in as admin (admin@internbro.com).');
      return;
    }
    try {
      const res = await fetch(`https://internbro.onrender.com/internships/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) {
        // Log activity on success
        const targetJob = allJobs.find(j => j.id === jobId || j._id === jobId);
        const logName = targetJob ? `"${targetJob.title}" at ${targetJob.company}` : 'Internship Posting';
        logActivity(`Moderated Placement: Marked ${logName} as ${action}`);
        alert(`✅ Listing has been ${action.toLowerCase()} and saved to database. Students can now see it in the Internships section.`);
        fetchAdminData();
      } else {
        // Provide specific feedback based on HTTP status code
        const errBody = await res.json().catch(() => ({}));
        const errDetail = errBody.detail || res.statusText || 'Unknown error';
        if (res.status === 401 || res.status === 403) {
          alert(`❌ Authentication failed (${res.status}): ${errDetail}\n\nYour admin session may have expired. Please log out and log back in as admin@internbro.com.`);
        } else {
          alert(`❌ Could not update internship status (${res.status}): ${errDetail}`);
        }
      }
    } catch (err) {
      console.error('handleModeration network error:', err);
      alert(`❌ Network error — could not reach the backend server.\n\nMake sure the Python backend is running on https://internbro.onrender.com.\n\nError: ${err.message}`);
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const targetApp = applications.find(a => a.id === appId || a._id === appId);
        if (targetApp) {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              await fetch(`https://internbro.onrender.com/api/applications/sync-status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  student_id: targetApp.studentId,
                  internship_id: targetApp.jobId,
                  status: newStatus.toUpperCase()
                })
              });
            } catch (pyErr) {
              console.warn("Failed to sync application status to Python backend", pyErr);
            }
          }
        }
        alert(`Application status updated to: ${newStatus}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      alert("Error updating application status.");
    }
  };

  // Logging activities helper
  const logActivity = (actionText) => {
    const newAct = {
      id: 'act-' + Date.now(),
      user: 'Alexander Bro',
      role: 'admin',
      action: actionText,
      timestamp: new Date().toISOString()
    };
    const updated = [newAct, ...activities];
    setActivities(updated);
    localStorage.setItem('internbro_activities', JSON.stringify(updated));
  };

  // USER MANAGEMENT ACTIONS
  const handleToggleUserRole = (uid, currentRole) => {
    const newRole = currentRole === 'student' ? 'recruiter' : currentRole === 'recruiter' ? 'admin' : 'student';
    const updated = usersList.map(u => u.uid === uid ? { ...u, role: newRole } : u);
    setUsersList(updated);
    localStorage.setItem('internbro_users', JSON.stringify(updated));

    const targetUser = usersList.find(u => u.uid === uid);
    logActivity(`Changed role of user ${targetUser?.name || 'Unknown'} from ${currentRole} to ${newRole}`);
    alert(`Changed ${targetUser?.name}'s role to ${newRole.toUpperCase()} successfully.`);
  };

  const handleDeleteUser = (uid) => {
    const targetUser = usersList.find(u => u.uid === uid);
    if (!window.confirm(`Are you sure you want to delete user ${targetUser?.name}?`)) return;

    const updated = usersList.filter(u => u.uid !== uid);
    setUsersList(updated);
    localStorage.setItem('internbro_users', JSON.stringify(updated));

    logActivity(`Deleted user account: ${targetUser?.name} (${targetUser?.email})`);
    alert(`Account for ${targetUser?.name} has been removed.`);
  };

  // ASSIGNMENT ACTIONS
  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignTitle || !assignDesc || !assignDeadline) {
      alert("Please fill in all assignment fields.");
      return;
    }

    const linkedInternship = allJobs.find(j => (j.id || j._id) === assignInternshipId);
    const newAssign = {
      id: 'assign-' + Date.now(),
      title: assignTitle,
      description: assignDesc,
      deadline: assignDeadline,
      points: Number(assignPoints) || 100,
      internshipId: assignInternshipId || null,
      internshipTitle: linkedInternship ? linkedInternship.title : null,
      internshipCompany: linkedInternship ? linkedInternship.company : null,
      createdAt: new Date().toISOString()
    };

    const updated = [newAssign, ...assignments];
    setAssignments(updated);
    localStorage.setItem('internbro_assignments', JSON.stringify(updated));
    setSelectedAssignmentId(newAssign.id);

    logActivity(`Assigned new assignment: "${assignTitle}"${linkedInternship ? ` (linked to: ${linkedInternship.title} @ ${linkedInternship.company})` : ''
      }`);

    // Reset Form
    setAssignTitle('');
    setAssignDesc('');
    setAssignDeadline('');
    setAssignPoints(100);
    setAssignInternshipId('');

    alert(`Successfully assigned assignment: ${newAssign.title}!`);
  };

  // GRADING ACTIONS
  const handleStartGrade = (sub) => {
    setGradingSubId(sub.id);
    setGradeValue(sub.grade || '');
    setFeedbackValue(sub.feedback || '');
  };

  const handleSaveGrade = (e) => {
    e.preventDefault();
    const updated = submissions.map(sub => {
      if (sub.id === gradingSubId) {
        return {
          ...sub,
          status: 'Graded',
          grade: gradeValue,
          feedback: feedbackValue
        };
      }
      return sub;
    });

    setSubmissions(updated);
    localStorage.setItem('internbro_submissions', JSON.stringify(updated));
    setGradingSubId('');

    const targetSub = submissions.find(s => s.id === gradingSubId);
    logActivity(`Graded submission for ${targetSub?.studentName} on assignment ID: ${targetSub?.assignmentId}`);
    alert("Grade and review feedback logged successfully!");
  };

  // MOCK SEED SUBMISSIONS FOR TESTING
  const handleSeedSubmissions = () => {
    if (assignments.length === 0) {
      alert("Please create at least one assignment first before seeding student submissions.");
      return;
    }

    const targetAssign = assignments.find(a => a.id === selectedAssignmentId) || assignments[0];
    const newMockSubs = [
      {
        id: "sub-seed-1",
        assignmentId: targetAssign.id,
        studentId: "student-uid-789",
        studentName: "Amit Verma",
        studentEmail: "amit.developer@gmail.com",
        codeFileName: "QuizComponent.jsx",
        codeFileSize: "5.1 KB",
        codeFileContent: "import React, { useState } from 'react';\n\nexport default function Quiz() {\n  const [step, setStep] = useState(0);\n  return (\n    <div className='p-6 border rounded-xl'>\n      <h3>Assessment Step: {step}</h3>\n      <button onClick={() => setStep(step + 1)}>Next</button>\n    </div>\n  );\n}",
        wordFileName: "QuizDocumentation.docx",
        wordFileSize: "18 KB",
        wordFileContent: "STUDENT DOCUMENTATION REPORT:\nProject name: Skill Assessment Module.\nAuthor: Amit Verma.\nKey Sections:\n1. Architecture state diagram of hooks.\n2. Styling tokens used for border alignments.",
        submittedAt: new Date().toISOString(),
        status: "Pending Review",
        grade: "",
        feedback: ""
      },
      {
        id: "sub-seed-2",
        assignmentId: targetAssign.id,
        studentId: "student-uid-sneha",
        studentName: "Sneha Patel",
        studentEmail: "sneha.patel@gmail.com",
        codeFileName: "server.js",
        codeFileSize: "3.5 KB",
        codeFileContent: "const express = require('express');\nconst app = express();\n\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'ok', uptime: process.uptime() });\n});\n\napp.listen(3000, () => console.log('Ready'));",
        wordFileName: "ServerSpecSummary.pdf",
        wordFileSize: "85 KB",
        wordFileContent: "BACKEND API SPECIFICATION:\nAuthor: Sneha Patel.\nEndpoints documented:\n- GET /api/health (Uptime diagnostics)\n- GET /api/jobs (Placements listings)",
        submittedAt: new Date().toISOString(),
        status: "Pending Review",
        grade: "",
        feedback: ""
      }
    ];

    // Filter out duplicates
    const filteredOld = submissions.filter(s => s.assignmentId !== targetAssign.id || !s.id.startsWith("sub-seed-"));
    const updated = [...newMockSubs, ...filteredOld];
    setSubmissions(updated);
    localStorage.setItem('internbro_submissions', JSON.stringify(updated));
    alert(`Seeded 2 mockup student submissions for: "${targetAssign.title}"! You can now review separate code and word files.`);
  };

  // Filtered lists
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const selectedAssignmentSubmissions = submissions.filter(sub => sub.assignmentId === selectedAssignmentId);
  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);

  return (
    <div className="page-transition min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-gray-150 dark:border-darkBorder/40 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shadow-sm">
              <Shield className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white leading-tight">Admin Control Room</h1>
              <p className="text-xs text-gray-400 mt-0.5">Platform logs audits, user roster moderation, and assignment uploads dispatcher.</p>
            </div>
          </div>
          <button
            onClick={fetchAdminData}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-darkCard hover:bg-gray-200 dark:hover:bg-darkBorder border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-gray-300 rounded-xl transition-all"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>

        {/* Global stats grids */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-darkCard p-5 border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Placements</span>
            <h3 className="font-display font-extrabold text-2xl dark:text-white mt-1">{allJobs.length}</h3>
          </div>
          <div className="bg-white dark:bg-darkCard p-5 border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Pending Approvals</span>
            <h3 className="font-display font-extrabold text-2xl text-amber-500 dark:text-amber-400 mt-1">
              {allJobs.filter(j => j.status?.toLowerCase() === 'pending').length}
            </h3>
          </div>
          <div className="bg-white dark:bg-darkCard p-5 border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Registered Students</span>
            <h3 className="font-display font-extrabold text-2xl dark:text-white mt-1">
              {usersList.filter(u => u.role?.toLowerCase() === 'student').length}
            </h3>
          </div>
          <div className="bg-white dark:bg-darkCard p-5 border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Talent Recruiters</span>
            <h3 className="font-display font-extrabold text-2xl dark:text-white mt-1">
              {usersList.filter(u => u.role?.toLowerCase() === 'recruiter').length}
            </h3>
          </div>
          <div className="bg-white dark:bg-darkCard p-5 border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Assignments</span>
            <h3 className="font-display font-extrabold text-2xl dark:text-white mt-1">{assignments.length}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-3 space-y-1 shadow-sm">

            <button
              onClick={() => setActiveTab('moderation')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'moderation'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Moderation Queue</span>
              {pendingJobs.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-bold">{pendingJobs.length}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'listings'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Manage Placements</span>
              <span className="ml-auto text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full font-bold">{allJobs.length}</span>
            </button>

            <div className="border-t border-gray-150 dark:border-darkBorder/30 my-2 pt-2"></div>
            <div className="px-3 pb-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Advanced Moderation</div>

            <button
              onClick={() => setActiveTab('users-activity')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'users-activity'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Activity className="w-4 h-4" />
              <span>Users Activity</span>
              {activities.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 dark:bg-darkBorder rounded-full text-gray-500 dark:text-gray-400 font-bold">{activities.length}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('total-users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'total-users'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>No. of Users</span>
              <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 dark:bg-darkBorder rounded-full text-gray-500 dark:text-gray-400 font-bold">{usersList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'assignments'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBg hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Assignment Column</span>
              {submissions.filter(s => s.status === 'Pending Review').length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-bold">
                  {submissions.filter(s => s.status === 'Pending Review').length}
                </span>
              )}
            </button>

          </div>

          {/* MAIN ACTIONS AREA */}
          <div className="lg:col-span-3">

            {/* TAB: MODERATION QUEUE WORKSPACE */}
            {activeTab === 'moderation' && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="font-display font-extrabold text-xl dark:text-white">Moderation Approval Queue</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Audit new internship postings requested by talent recruiters.</p>
                </div>

                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : pendingJobs.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm space-y-2">
                    <Check className="w-10 h-10 mx-auto text-emerald-500 bg-emerald-50 dark:bg-emerald-950/10 rounded-full p-2 border border-emerald-200 dark:border-emerald-900" />
                    <p className="font-medium">All clear! The moderation queue is currently empty.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingJobs.map((job) => (
                      <div
                        key={job.id || job._id}
                        className="border border-gray-100 dark:border-darkBorder/40 rounded-2xl p-5 hover:bg-gray-50/50 dark:hover:bg-darkBg/30 transition-colors animate-fade-in"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
                            <p className="text-xs text-brand-600 font-semibold">{job.company} &bull; {job.location}</p>
                            <p className="text-xs text-gray-400">Duration: {job.duration} &bull; Stipend: {job.stipend}</p>
                            <p className="text-xs text-gray-400 max-w-lg mt-2 line-clamp-2">{job.description}</p>
                          </div>

                          <div className="flex sm:flex-col gap-2">
                            <button
                              onClick={() => handleModeration(job.id || job._id, 'Approved')}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleModeration(job.id || job._id, 'Rejected')}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MANAGE ALL PLACEMENTS WORKSPACE */}
            {activeTab === 'listings' && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="font-display font-extrabold text-xl dark:text-white">Database Listings Auditor</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Audit, approve, or reject active internship postings.</p>
                </div>

                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : allJobs.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    <p className="font-medium">No job postings exist in database.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allJobs.map((job) => (
                      <div
                        key={job.id || job._id}
                        className="border border-gray-100 dark:border-darkBorder/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
                          <p className="text-xs text-gray-400">{job.company} &bull; Status: <strong className={job.status === 'Approved' ? 'text-emerald-600' : 'text-amber-500'}>{job.status}</strong></p>
                        </div>

                        <div className="flex space-x-2">
                          {job.status !== 'Approved' && (
                            <button
                              onClick={() => handleModeration(job.id || job._id, 'Approved')}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/30"
                              title="Approve job"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {job.status !== 'Rejected' && (
                            <button
                              onClick={() => handleModeration(job.id || job._id, 'Rejected')}
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 border border-red-200/30"
                              title="Reject job"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: USERS ACTIVITY FEED */}
            {activeTab === 'users-activity' && (
              <div className="space-y-6">
                {/* Database Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Premium Upgrades</span>
                      <h3 className="font-display font-extrabold text-xl dark:text-white mt-1">
                        {usersList.filter(u => u.premium).length} Active Subscribers
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-1">Users with unlocked premium resume creations and AI coach tools.</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      👑
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-violetAccent-500/10 to-brand-500/10 border border-violetAccent-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-violetAccent-600 dark:text-violetAccent-400 uppercase tracking-widest block">Popular Internship</span>
                      <h3 className="font-display font-extrabold text-sm dark:text-white mt-1 leading-snug">
                        {getMostPopularInternship()}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-1">Placement containing the highest number of student applications.</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                      🚀
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-display font-extrabold text-xl dark:text-white">Platform Activity Stream</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Real-time log audit trail computed directly from database entries.</p>
                    </div>
                  </div>

                  {getDynamicActivities().length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
                      <Activity className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="font-medium">No activity records logged yet.</p>
                    </div>
                  ) : (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {getDynamicActivities().map((act, actIdx) => (
                          <li key={act.id || actIdx}>
                            <div className="relative pb-8">
                              {actIdx !== getDynamicActivities().length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-darkBorder" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-darkCard ${act.role === 'admin' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                    act.role === 'recruiter' ? 'bg-violetAccent-100 text-violetAccent-600 dark:bg-violetAccent-950/40 dark:text-violetAccent-400' :
                                      'bg-brand-100 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400'
                                    }`}>
                                    {act.role === 'admin' ? <Shield className="w-4 h-4" /> :
                                      act.role === 'recruiter' ? <Briefcase className="w-4 h-4" /> :
                                        <Users className="w-4 h-4" />}
                                  </span>
                                </div>
                                <div className="flex-grow pt-1.5 flex justify-between gap-4 text-xs">
                                  <div>
                                    <span className="font-bold text-gray-900 dark:text-white">{act.user}</span>
                                    <span className="text-gray-400 ml-1">({act.role})</span>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium">{act.action}</p>
                                  </div>
                                  <div className="text-right text-gray-400 whitespace-nowrap">
                                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <span className="block text-[9px] mt-0.5">{new Date(act.timestamp).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: NUMBER OF USERS */}
            {activeTab === 'total-users' && (
              <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="font-display font-extrabold text-xl dark:text-white">Active Users Registry</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Global audit logs roster of candidate profiles, recruiter agents, and platform moderators.</p>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-grow w-full">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by name or email address..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white w-full sm:w-44"
                  >
                    <option value="">All Roles</option>
                    <option value="student">Students</option>
                    <option value="recruiter">Recruiters</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>

                {/* User Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredUsers.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-gray-400 text-xs font-medium">
                      No matching user listings found.
                    </div>
                  ) : (
                    filteredUsers.map(u => {
                      const isStudent = u.role?.toLowerCase() === 'student';
                      const studentApps = applications.filter(app => app.studentId === u.uid || app.studentId === u.id);

                      return (
                        <div
                          key={u.uid || u._id}
                          className="p-5 rounded-3xl border border-gray-200/60 dark:border-darkBorder/40 bg-gray-50/30 dark:bg-darkCard/25 space-y-4 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in col-span-2"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-darkBorder/20 pb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${isStudent ? 'bg-brand-100 text-brand-600 dark:bg-brand-950/30' :
                                u.role?.toLowerCase() === 'recruiter' ? 'bg-violetAccent-100 text-violetAccent-600 dark:bg-violetAccent-950/30' :
                                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30'
                                }`}>
                                {u.name ? u.name.charAt(0) : 'U'}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-darkBg text-gray-400">
                                    {u.role}
                                  </span>
                                </h4>
                                <p className="text-xs text-gray-400">{u.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {u.uid !== 'admin-uid-789' && u.id !== 'admin-uid-789' && (
                                <button
                                  onClick={() => handleDeleteUser(u.uid || u.id)}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {isStudent ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Left stats */}
                              <div className="space-y-2">
                                <p className="text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">College:</span> {u.profile?.collegeName || u.profile?.collegeId || u.college || 'N/A'}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">Age:</span> {calculateAge(u.profile?.dob)} ({u.profile?.dob || 'N/A'})
                                </p>
                                <div className="pt-2">
                                  {(() => {
                                    const activeResumeUrl = u.profile?.resumeUrl || studentApps[0]?.resumeUrl;
                                    return activeResumeUrl ? (
                                      <a
                                        href={activeResumeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:hover:bg-brand-900/30 dark:text-brand-400 rounded-xl font-bold border border-brand-200/30 transition-all text-[11px]"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>View Candidate Resume</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : (
                                      <span className="text-gray-400 italic text-[11px]">No resume uploaded</span>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Right: Applications list */}
                              <div className="bg-white dark:bg-darkCard/30 p-4 border border-gray-150/40 dark:border-darkBorder/40 rounded-2xl space-y-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 dark:border-darkBorder/20 pb-1.5">
                                  Applied Internships ({studentApps.length})
                                </span>
                                {studentApps.length === 0 ? (
                                  <p className="text-gray-400 italic text-[11px] py-1">No applications submitted yet.</p>
                                ) : (
                                  <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                                    {studentApps.map((app) => (
                                      <div key={app._id || app.id} className="text-xs space-y-1.5 border-b border-gray-100 dark:border-darkBorder/10 pb-2.5 last:border-0 last:pb-0">
                                        <p className="font-bold text-gray-800 dark:text-gray-200">
                                          {app.jobDetails?.title || 'Internship Opportunity'}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                          at {app.jobDetails?.company || 'Recruiter'}
                                        </p>
                                        <div className="flex items-center justify-between gap-2 mt-1">
                                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${app.status === 'Shortlisted' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                                            app.status === 'Rejected' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' :
                                              'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                                            }`}>
                                            {app.status}
                                          </span>
                                          <div className="flex items-center space-x-1.5">
                                            {app.status !== 'Shortlisted' && (
                                              <button
                                                onClick={() => handleUpdateApplicationStatus(app._id || app.id, 'Shortlisted')}
                                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-sm shadow-emerald-500/10 transition-colors"
                                              >
                                                Select
                                              </button>
                                            )}
                                            {app.status !== 'Rejected' && (
                                              <button
                                                onClick={() => handleUpdateApplicationStatus(app._id || app.id, 'Rejected')}
                                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold shadow-sm shadow-red-500/10 transition-colors"
                                              >
                                                Reject
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">
                              <p><span className="font-semibold text-gray-500">Associated Organization:</span> {u.company?.name || 'N/A'}</p>
                              <p><span className="font-semibold text-gray-500">Website:</span> {u.company?.website || 'N/A'}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}

            {/* TAB: ASSIGNMENT COLUMN */}
            {activeTab === 'assignments' && (
              <div className="space-y-6">

                {/* ASSIGNMENT PUBLISHER BOX */}
                <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6 shadow-sm">
                  <div>
                    <h2 className="font-display font-extrabold text-xl dark:text-white flex items-center gap-1.5">
                      <span>Publish New Practical Assignment</span>
                      <PlusCircle className="w-4 h-4 text-emerald-500" />
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Assign custom assessments to all developers on the platform. Students can upload both code and documentation deliverables.</p>
                  </div>

                  <form onSubmit={handleAssignSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">Assignment Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Node API routing & validation"
                          value={assignTitle}
                          onChange={e => setAssignTitle(e.target.value)}
                          required
                          className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">Max Score (Points)</label>
                        <input
                          type="number"
                          placeholder="100"
                          min="1"
                          max="1000"
                          value={assignPoints}
                          onChange={e => setAssignPoints(e.target.value)}
                          required
                          className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Internship Selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block">Linked Internship</label>
                      <select
                        value={assignInternshipId}
                        onChange={e => setAssignInternshipId(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                      >
                        <option value="">— Select Internship (optional) —</option>
                        {allJobs.map(j => (
                          <option key={j.id || j._id} value={j.id || j._id}>
                            {j.title} @ {j.company}
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-gray-400">Link this assignment to a specific internship so students know it belongs to that programme.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">Submission Deadline</label>
                        <input
                          type="date"
                          value={assignDeadline}
                          onChange={e => setAssignDeadline(e.target.value)}
                          required
                          className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">Action Dispatch</label>
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Publish Assignment</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block">Task description & Requirements</label>
                      <textarea
                        rows="3"
                        placeholder="Detail out the instructions, requirements for code files, and content for word document files..."
                        value={assignDesc}
                        onChange={e => setAssignDesc(e.target.value)}
                        required
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white resize-none"
                      ></textarea>
                    </div>
                  </form>
                </div>

                {/* ACTIVE ASSIGNMENTS AUDIT TRAIL */}
                <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-6 shadow-sm">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-darkBorder/30 pb-4">
                    <div>
                      <h2 className="font-display font-extrabold text-xl dark:text-white">Active Assignments Submissions</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Select assignment, view uploaded student submissions columns, and review grades.</p>
                    </div>

                    {/* Assignment Selector */}
                    {assignments.length > 0 && (
                      <select
                        value={selectedAssignmentId}
                        onChange={e => {
                          setSelectedAssignmentId(e.target.value);
                          setGradingSubId('');
                        }}
                        className="bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white w-full sm:w-64 font-semibold"
                      >
                        {assignments.map(a => (
                          <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {assignments.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs font-medium">
                      No assignments created. Assign one above to start monitoring submissions.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Short Description */}
                      <div className="p-4 bg-gray-50 dark:bg-darkBg border border-gray-150 dark:border-darkBorder/40 rounded-2xl text-xs space-y-2">
                        <div className="flex justify-between font-bold">
                          <span className="text-gray-900 dark:text-white">{selectedAssignment?.title}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Max Score: {selectedAssignment?.points} pts</span>
                        </div>
                        {/* Internship badge */}
                        {selectedAssignment?.internshipTitle && (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              <Briefcase className="w-2.5 h-2.5" />
                              {selectedAssignment.internshipTitle} @ {selectedAssignment.internshipCompany}
                            </span>
                          </div>
                        )}
                        <p className="text-gray-500 leading-relaxed">{selectedAssignment?.description}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Deadline: {selectedAssignment?.deadline}</span>
                        </div>
                      </div>

                      {/* Seed Button & Title */}
                      <div className="flex justify-between items-center pt-2">
                        <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">
                          Submissions ({selectedAssignmentSubmissions.length})
                        </h4>
                        <button
                          onClick={handleSeedSubmissions}
                          className="px-3 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold rounded-lg transition-colors"
                          title="Generate fake uploads for verification"
                        >
                          + Seed Mock Student Uploads
                        </button>
                      </div>

                      {/* SUBMISSIONS TABLE */}
                      {selectedAssignmentSubmissions.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-gray-200 dark:border-darkBorder rounded-2xl text-gray-400 text-xs">
                          No submissions uploaded for this task yet. Log in as a student to submit or click "Seed Mock Student Uploads".
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-gray-150 dark:border-darkBorder/30 rounded-2xl">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-darkBg border-b border-gray-150 dark:border-darkBorder/40 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                <th className="p-3.5">Student</th>
                                <th className="p-3.5 text-center">Code File Column</th>
                                <th className="p-3.5 text-center">Word File Column</th>
                                <th className="p-3.5 text-center">Grade Feedback</th>
                                <th className="p-3.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-darkBorder/20">
                              {selectedAssignmentSubmissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-55 dark:hover:bg-darkCard/10 transition-colors">
                                  {/* Student Name */}
                                  <td className="p-3.5">
                                    <div className="font-semibold text-gray-900 dark:text-white">{sub.studentName}</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{sub.studentEmail}</div>
                                    <div className="text-[9px] text-gray-400 italic mt-0.5">Uploaded: {new Date(sub.submittedAt).toLocaleDateString()}</div>
                                  </td>

                                  {/* Code File Column */}
                                  <td className="p-3.5 text-center">
                                    {sub.codeFileName ? (
                                      <div className="inline-flex flex-col items-center">
                                        <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                                          <FileCode className="w-3.5 h-3.5" />
                                          <span className="truncate max-w-[100px]">{sub.codeFileName}</span>
                                        </div>
                                        <button
                                          onClick={() => setPreviewFile({ title: sub.codeFileName, type: 'code', content: sub.codeFileContent })}
                                          className="text-[9px] text-brand-500 hover:underline mt-1 font-semibold flex items-center gap-0.5"
                                        >
                                          <ExternalLink className="w-2.5 h-2.5" />
                                          <span>Preview Code</span>
                                        </button>
                                        <span className="text-[8px] text-gray-400 mt-0.5">Size: {sub.codeFileSize}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic text-[10px]">- Missing -</span>
                                    )}
                                  </td>

                                  {/* Word File Column */}
                                  <td className="p-3.5 text-center">
                                    {sub.wordFileName ? (
                                      <div className="inline-flex flex-col items-center">
                                        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/30">
                                          <FileText className="w-3.5 h-3.5" />
                                          <span className="truncate max-w-[100px]">{sub.wordFileName}</span>
                                        </div>
                                        <button
                                          onClick={() => setPreviewFile({ title: sub.wordFileName, type: 'word', content: sub.wordFileContent })}
                                          className="text-[9px] text-brand-500 hover:underline mt-1 font-semibold flex items-center gap-0.5"
                                        >
                                          <ExternalLink className="w-2.5 h-2.5" />
                                          <span>Read Document</span>
                                        </button>
                                        <span className="text-[8px] text-gray-400 mt-0.5">Size: {sub.wordFileSize}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic text-[10px]">- Missing -</span>
                                    )}
                                  </td>

                                  {/* Grade Status */}
                                  <td className="p-3.5 text-center">
                                    {sub.status === 'Graded' ? (
                                      <div className="inline-block text-center">
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold rounded-lg dark:bg-emerald-950/20 dark:text-emerald-400">
                                          {sub.grade} / {selectedAssignment?.points} pts
                                        </span>
                                        {sub.feedback && (
                                          <p className="text-[9px] text-gray-400 mt-1 max-w-[120px] truncate italic" title={sub.feedback}>
                                            "{sub.feedback}"
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold rounded-lg dark:bg-amber-950/20 dark:text-amber-400">
                                        Needs Grade
                                      </span>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="p-3.5 text-right">
                                    <button
                                      onClick={() => handleStartGrade(sub)}
                                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[10px] transition-colors"
                                    >
                                      Grade Task
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* INLINE GRADING MODAL EDITOR */}
                  {gradingSubId && (
                    <div className="p-5 border border-emerald-150 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-2xl space-y-4 animate-slide-up">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                          Grading Panel for: {submissions.find(s => s.id === gradingSubId)?.studentName}
                        </h4>
                        <button onClick={() => setGradingSubId('')} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveGrade} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Grade (Marks)</label>
                          <input
                            type="text"
                            placeholder="e.g. 95"
                            value={gradeValue}
                            onChange={e => setGradeValue(e.target.value)}
                            required
                            className="w-full bg-white dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2 relative">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block">Review Comments</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. Great reactive forms code styling..."
                              value={feedbackValue}
                              onChange={e => setFeedbackValue(e.target.value)}
                              className="w-full bg-white dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm transition-colors whitespace-nowrap"
                            >
                              Log Grade
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* FILE PREVIEW SYSTEM MODAL OVERLAY */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-scale-up">

            {/* Modal Header */}
            <div className="p-5 border-b border-gray-150 dark:border-darkBorder/40 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {previewFile.type === 'code' ? (
                  <FileCode className="w-5 h-5 text-emerald-500" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-500" />
                )}
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{previewFile.title}</h3>
                  <p className="text-[10px] text-gray-400">File Type: {previewFile.type === 'code' ? 'Code Deliverable' : 'Documentation Report'}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-darkBg rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Preview */}
            <div className="p-6 overflow-y-auto flex-grow bg-gray-50 dark:bg-darkBg text-xs font-mono text-gray-700 dark:text-gray-300 max-h-[60vh]">
              {previewFile.type === 'code' ? (
                <pre className="whitespace-pre-wrap font-mono p-4 bg-gray-900 text-green-400 rounded-2xl border border-gray-800 overflow-x-auto leading-relaxed">
                  {previewFile.content}
                </pre>
              ) : (
                <div className="font-sans whitespace-pre-wrap p-4 bg-white dark:bg-darkCard rounded-2xl border border-gray-200 dark:border-darkBorder leading-relaxed text-gray-600 dark:text-gray-300">
                  {previewFile.content}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-150 dark:border-darkBorder/40 flex justify-end">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-darkBorder dark:hover:bg-brand-900/30 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
