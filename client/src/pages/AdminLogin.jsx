import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Lock, Eye, EyeOff, KeyRound, ArrowRight,
  Rocket, AlertTriangle, Users, BarChart2, Settings
} from 'lucide-react';

// Admin credentials — must match the seeded admin in the Python backend (main.py)
const ADMIN_EMAIL    = 'admin@internbro.com';
const ADMIN_SECRET   = 'admin123';

const ADMIN_POWERS = [
  { icon: Users,    label: 'User Management',    desc: 'Manage student & recruiter accounts' },
  { icon: BarChart2, label: 'Platform Analytics', desc: 'View real-time usage statistics' },
  { icon: Shield,   label: 'Content Moderation', desc: 'Approve / reject internship listings' },
  { icon: Settings, label: 'System Control',     desc: 'Configure platform-wide settings' },
];

export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showKey, setShowKey]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [attempts, setAttempts] = useState(0);

  const { adminLogin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/admin-dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Lockout after 5 failed attempts
    if (attempts >= 5) {
      setError('Too many failed attempts. Please refresh the page and try again.');
      return;
    }

    if (secretKey !== ADMIN_SECRET) {
      setAttempts((a) => a + 1);
      setError(`Invalid admin secret key. (${5 - attempts - 1} attempts remaining)`);
      return;
    }

    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setAttempts((a) => a + 1);
      setError('Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-12 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-60px] right-[-60px] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Intern<span className="text-emerald-400">BRO</span>
          </span>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          {/* Shield badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">Administrator Access</span>
          </div>

          <h1 className="font-display font-bold text-4xl xl:text-5xl text-white leading-tight mb-4">
            Admin<br />
            <span className="text-emerald-400">Control</span> Panel
          </h1>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Restricted area. Only authorized administrators may access the platform control panel.
          </p>

          {/* Powers */}
          <div className="space-y-3">
            {ADMIN_POWERS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 bg-white/5 rounded-xl p-3.5 border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{label}</div>
                  <div className="text-gray-500 text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-gray-600 text-xs">
          © 2025 InternBRO · Admin Portal · Restricted Access
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-950">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <Shield className="w-7 h-7 text-emerald-400" />
            <span className="font-display font-bold text-xl text-white">
              Admin Portal
            </span>
          </div>

          {/* Warning Banner */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-300/80 text-xs leading-relaxed">
              This is a <strong className="text-amber-300">restricted area</strong>. Unauthorized access attempts are logged and monitored.
            </p>
          </div>

          {/* Card */}
          <div className="bg-gray-900 rounded-3xl border border-white/10 shadow-2xl shadow-black/60 p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-7">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-white">Admin Sign In</h2>
                <p className="text-gray-500 text-xs">Enter your admin credentials below</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/40 text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@internbro.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-gray-800/60 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="admin-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-white/10 bg-gray-800/60 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Admin Secret Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="admin-secret-key"
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter secret key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-white/10 bg-gray-800/60 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-600">
                  Contact your system administrator if you don't have this key.
                </p>
              </div>

              {/* Attempts warning */}
              {attempts > 0 && (
                <div className="text-xs text-amber-500/80 font-medium">
                  ⚠️ {attempts} failed attempt{attempts > 1 ? 's' : ''}. {5 - attempts} remaining before lockout.
                </div>
              )}

              {/* Submit */}
              <button
                id="admin-submit-btn"
                type="submit"
                disabled={loading || attempts >= 5}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 hover:shadow-emerald-800/60 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Access Admin Panel
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Student link */}
            <div className="mt-7 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-gray-600">
                Looking for the student portal?{' '}
                <Link to="/login" className="font-semibold text-brand-400 hover:underline">
                  Student Login →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
