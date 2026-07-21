import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Rocket, Mail, Lock, Eye, EyeOff, User, ArrowRight,
  Sparkles, BookOpen, Trophy, Zap
} from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, label: 'AI Career Coach', desc: 'Personalized job guidance powered by Gemini' },
  { icon: BookOpen, label: 'Smart Internship Feed', desc: 'Curated listings matched to your skills' },
  { icon: Trophy, label: 'Track Applications', desc: 'Manage all your internship applications' },
  { icon: Zap, label: 'Instant Alerts', desc: 'Get notified about new matching internships' },
];

export default function StudentLogin() {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('STUDENT'); // 'STUDENT' | 'RECRUITER' | 'ADMIN'

  const { login, signup, loginWithToken, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/student-dashboard';
  //checks
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Use loginWithToken to properly load user + Express profile into AuthContext
      loginWithToken()
        .then((userData) => {
          // Route based on role
          if (userData?.role === 'RECRUITER') {
            navigate('/recruiter-dashboard', { replace: true });
          } else if (userData?.role === 'ADMIN') {
            navigate('/admin-dashboard', { replace: true });
          } else {
            navigate('/student-dashboard', { replace: true });
          }
        })
        .catch(() => {
          // Token was invalid — go to login fresh
          navigate('/login', { replace: true });
        });
    }
  }, [location]);

  useEffect(() => {
    if (tab === 'signup' && selectedRole === 'ADMIN') {
      setSelectedRole('STUDENT');
    }
  }, [tab, selectedRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let loggedUser;
      if (tab === 'login') {
        if (selectedRole === 'ADMIN') {
          loggedUser = await adminLogin(email, password);
        } else {
          loggedUser = await login(email, password);
        }
      } else {
        if (!name.trim()) { setError('Please enter your full name.'); setLoading(false); return; }
        loggedUser = await signup(
          email,
          password,
          name,
          selectedRole
        );
      }

      if (loggedUser?.role === 'ADMIN') {
        navigate('/admin-dashboard', { replace: true });
      } else if (loggedUser?.role === 'RECRUITER') {
        navigate('/recruiter-dashboard', { replace: true });
      } else {
        navigate('/student-dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violetAccent-700 p-12">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-violetAccent-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-brand-400/20 blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
            <Rocket className="w-5 h-5 text-white animate-pulse-slow" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Intern<span className="text-brand-200">BRO</span>
          </span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10">
          <h1 className="font-display font-bold text-4xl xl:text-5xl text-white leading-tight mb-4">
            Launch Your<br />
            <span className="text-brand-200">Career</span> Here 🚀
          </h1>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Join thousands of students discovering, applying, and landing their dream internships with AI-powered tools.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{label}</div>
                  <div className="text-white/60 text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-white/40 text-xs">
          © 2025 InternBRO · Student Portal
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-darkBg px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violetAccent-500 flex items-center justify-center shadow">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Intern<span className="text-brand-500">BRO</span>
            </span>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-darkCard rounded-3xl shadow-xl shadow-gray-200/60 dark:shadow-black/40 p-8 border border-gray-100 dark:border-darkBorder">
            {/* Tab Switcher */}
            <div className="flex rounded-2xl bg-gray-100 dark:bg-darkBg/80 p-1 mb-6">
              {['login', 'signup'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${tab === t
                    ? 'bg-white dark:bg-darkCard text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Role Switcher */}
            <div className="mb-6 bg-gray-50 dark:bg-darkBg/30 p-3 rounded-2xl border border-gray-100 dark:border-darkBorder/40">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 text-center">
                Select Your Role
              </label>
              <div className="flex rounded-xl bg-gray-100 dark:bg-darkBg/80 p-1">
                {['STUDENT', 'RECRUITER', ...(tab === 'login' ? ['ADMIN'] : [])].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setSelectedRole(r); setError(''); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${selectedRole === r
                      ? 'bg-white dark:bg-darkCard text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                  >
                    {r.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-1">
              {tab === 'login' ? 'Welcome back 👋' : 'Join InternBRO 🎯'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
              {tab === 'login'
                ? `Sign in to your ${selectedRole.toLowerCase()} account to continue.`
                : `Create your free ${selectedRole.toLowerCase()} account today.`}
            </p>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <span className="text-red-400">⚠️</span> {error}
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => window.location.href = 'https://internbro.onrender.com/auth/google'}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkBg text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-darkCard transition-all shadow-sm mb-6"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.64 -0.06,-1.25 -0.16,-1.9Z" fill="#4285F4" />
                <path d="M12,20.6c2.59,0 4.77,-0.86 6.36,-2.32l-3.3,-2.58c-0.91,0.61 -2.08,0.98 -3.06,0.98c-2.35,0 -4.35,-1.59 -5.06,-3.72H3.5v2.66c1.57,3.12 4.79,5.26 8.5,5.26Z" fill="#34A853" />
                <path d="M6.94,13.06c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7s0.1,-1.16 0.28,-1.7V7.12H3.5c-0.6,1.2 -0.94,2.56 -0.94,4.0s0.34,2.8 0.94,4.0l3.44,-2.66c0,-0.12 0,-0.18 0,-0.28Z" fill="#FBBC05" />
                <path d="M12,6.46c1.41,0 2.68,0.49 3.68,1.44l2.76,-2.76C16.77,3.61 14.59,2.8 12,2.8C8.29,2.8 5.07,4.94 3.5,8.06l3.44,2.66c0.71,-2.13 2.71,-3.72 5.06,-3.72Z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* OR Separator */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-darkBorder" />
              <span className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase">Or email</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-darkBorder" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name – signup only */}
              {tab === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="student-name"
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={tab === 'signup'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="student-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="student-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="student-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-violetAccent-600 hover:from-brand-700 hover:to-violetAccent-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {tab === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Admin link */}
            <div className="mt-7 pt-6 border-t border-gray-100 dark:border-darkBorder text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Are you an administrator?{' '}
                <Link
                  to="/admin-login"
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Admin Login →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
