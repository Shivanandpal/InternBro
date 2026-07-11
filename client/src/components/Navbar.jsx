import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Menu, X, Rocket, User, LogOut, Shield, Briefcase, Award } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const baseLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Internships', path: '/listings' },
    { name: 'AI Career Coach', path: '/ai-assistant' },
    { name: 'Contact', path: '/contact' }
  ];

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || profile?.role?.toUpperCase() === 'ADMIN';
  const navLinks = isAdmin 
    ? [...baseLinks, { name: 'Add Internship', path: '/add-internship' }]
    : baseLinks;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-darkBorder/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" id="logo-link" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violetAccent-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold">
                <Rocket className="w-5 h-5 animate-pulse-slow" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Intern<span className="bg-gradient-to-r from-brand-500 to-violetAccent-500 bg-clip-text text-transparent">BRO</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-darkBorder/40 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Utility & Profile */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />

            {/* Dashboard Redirect Shortcut */}
            {user && (
              <Link
                to={
                  user.role?.toUpperCase() === 'ADMIN'
                    ? '/admin-dashboard'
                    : user.role?.toUpperCase() === 'RECRUITER'
                    ? '/recruiter-dashboard'
                    : '/student-dashboard'
                }
                className="px-3 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-darkCard dark:hover:bg-darkBorder border border-gray-200 dark:border-darkBorder text-gray-700 dark:text-gray-300 transition-all duration-300"
              >
                Dashboard
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-darkBorder">
                <img
                  src={profile?.profile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-brand-500/20 shadow-sm"
                />
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-brand-600 dark:text-brand-400 hover:bg-gray-100 dark:hover:bg-darkCard"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkCard hover:text-gray-900 dark:hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-b border-gray-200 dark:border-darkBorder/40 animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-darkCard dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user && (
              <Link
                to={
                  user.role?.toUpperCase() === 'ADMIN'
                    ? '/admin-dashboard'
                    : user.role?.toUpperCase() === 'RECRUITER'
                    ? '/recruiter-dashboard'
                    : '/student-dashboard'
                }
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20"
              >
                Dashboard
              </Link>
            )}

            {/* Mobile Role Switchers — REMOVED */}

            {user ? (
              <div className="pt-4 pb-2 border-t border-gray-200 dark:border-darkBorder flex items-center justify-between px-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={profile?.profile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full border"
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{profile?.name || user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setIsOpen(false);
                }}
                className="w-full mt-2 py-2 text-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
