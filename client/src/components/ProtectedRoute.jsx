import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * StudentRoute — Only accessible by logged-in students.
 * Admins are redirected to the admin dashboard.
 * Guests are redirected to the student login page.
 */
export function StudentRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-darkBg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role?.toUpperCase() === 'ADMIN') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (user.role?.toUpperCase() === 'RECRUITER') {
    return <Navigate to="/recruiter-dashboard" replace />;
  }

  return children;
}

/**
 * RecruiterRoute — Only accessible by logged-in recruiters.
 * Admins are redirected to the admin dashboard.
 * Students are redirected to the student dashboard.
 * Guests are redirected to the login page.
 */
export function RecruiterRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-darkBg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role?.toUpperCase() === 'ADMIN') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (user.role?.toUpperCase() === 'STUDENT') {
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
}

/**
 * AdminRoute — Only accessible by logged-in admins.
 * Students & guests are redirected to the admin login page.
 */
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
}
