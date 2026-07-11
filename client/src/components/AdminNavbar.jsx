import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Rocket, Bell } from 'lucide-react';

/**
 * AdminNavbar — Minimal header shown ONLY inside the admin dashboard.
 * No public nav links. Shows logo, "Admin Panel" badge, and logout.
 */
export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <nav className="sticky top-0 z-50 h-14 flex items-center border-b border-white/5 bg-gray-950/90 backdrop-blur-md px-6">
      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
        {/* Left – Logo + Badge */}
        <div className="flex items-center gap-4">
          <Link to="/admin-dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-display font-bold text-base text-white tracking-tight">
              Intern<span className="text-emerald-400">BRO</span>
            </span>
          </Link>

          {/* Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold tracking-wide">Admin Panel</span>
          </div>
        </div>

        {/* Right – User info + Logout */}
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <button
            id="admin-notifications-btn"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name || 'admin'}`}
                alt="avatar"
                className="w-6 h-6 rounded-full ring-1 ring-emerald-500/30"
              />
              <span className="text-gray-300 text-xs font-medium hidden sm:block">
                {user.name || user.email}
              </span>
            </div>
          )}

          {/* Logout */}
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
