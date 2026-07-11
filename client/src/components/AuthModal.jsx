import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Calendar, GraduationCap, FileSpreadsheet, Send, ArrowRight, ArrowLeft, KeyRound, Check } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { login, signup } = useAuth();
  
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [regStep, setRegStep] = useState(1); // 1 | 2 | 3
  const [submitting, setSubmitting] = useState(false);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  
  const [college, setCollege] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [branch, setBranch] = useState('');
  const [gradYear, setGradYear] = useState('');

  const [skillsText, setSkillsText] = useState('');
  const [experienceText, setExperienceText] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await login(email, password, 'student');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert("Authentication failed. Please verify credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      
      const profileData = {
        title: branch ? `${branch} Student` : 'Aspiring Builder',
        skills: skillsArray,
        education: [{ school: college, degree: branch, year: gradYear }],
        projects: [],
        experience: [],
        resumeUrl: '',
        bio: experienceText,
        phone: '',
        savedJobs: [],
        certificates: [],
        
        // Detailed real-time attributes
        dob,
        collegeId,
        branch,
        graduationYear: gradYear,
        experienceText
      };

      const ok = await signup(email, password, name, 'student', profileData);
      if (ok) {
        alert("Registration complete! Welcome to InternBRO.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        alert("Failed to create account. Email might be in use.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Registration failed. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
        
        {/* Modal Banner */}
        <div className="bg-gradient-to-r from-brand-600 to-violetAccent-500 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="font-display font-extrabold text-xl">
              {authMode === 'login' ? 'Welcome Back' : 'Create Student Account'}
            </h3>
            <p className="text-xs text-brand-100 mt-1">
              {authMode === 'login' 
                ? 'Sign in to access your dashboard and apply.' 
                : `Register to unlock placements (Step ${regStep} of 3)`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl font-bold bg-white/10 w-8 h-8 rounded-full flex items-center justify-center focus:outline-none"
          >
            &times;
          </button>
        </div>

        {/* Modal Form Container */}
        <div className="p-6">
          {authMode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="student@internbro.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center justify-center space-x-1"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-brand-500 hover:underline font-semibold"
                >
                  Register as Student
                </button>
              </div>
            </form>
          ) : (
            /* MULTI-STEP REGISTRATION FORM */
            <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-5">
              
              {/* STEP 1: Basic Credentials & DOB */}
              {regStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        placeholder="john.doe@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (name && email && password && dob) setRegStep(2);
                      else alert("Please fill all core credentials to proceed.");
                    }}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1"
                  >
                    <span>Next: Academic Background</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* STEP 2: Academics */}
              {regStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">College / University Name</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Delhi Technological University"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">College Student ID / Roll Number</label>
                    <div className="relative">
                      <FileSpreadsheet className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="2K23/CO/192"
                        value={collegeId}
                        onChange={(e) => setCollegeId(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl focus:outline-none dark:text-white"
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
                        required
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3 py-2.5 focus:outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Expected Grad Year</label>
                      <input
                        type="text"
                        placeholder="2027"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        required
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3 py-2.5 focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="px-4 py-3 border border-gray-200 dark:border-darkBorder text-xs font-semibold rounded-xl text-gray-500 flex items-center justify-center space-x-1 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (college && collegeId && branch && gradYear) setRegStep(3);
                        else alert("Please fill academic details to proceed.");
                      }}
                      className="flex-grow py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1"
                    >
                      <span>Next: Skills & Experience</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Skills & Experience */}
              {regStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Core Skills (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React.js, Node.js, JavaScript, Python"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Prior Experience / Achievements</label>
                    <textarea
                      rows="4"
                      placeholder="List details of any previous coding projects, internships, or hackathon participations..."
                      value={experienceText}
                      onChange={(e) => setExperienceText(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none dark:text-white resize-none"
                    ></textarea>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="px-4 py-3 border border-gray-200 dark:border-darkBorder text-xs font-semibold rounded-xl text-gray-500 flex items-center justify-center space-x-1 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRegisterSubmit}
                      disabled={submitting || !skillsText || !experienceText}
                      className="flex-grow py-3 bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Complete Registration</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-darkBorder/40">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setRegStep(1); }}
                  className="text-brand-500 hover:underline font-semibold"
                >
                  Login Instead
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
