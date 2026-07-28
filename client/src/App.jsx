import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';
import { StudentRoute, AdminRoute, RecruiterRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Listings from './pages/Listings';
import Details from './pages/Details';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AICareerAssistant from './pages/AICareerAssistant';
import Contact from './pages/Contact';
import AddInternship from './pages/AddInternship';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';

// Admin-only paths — these get the minimal AdminNavbar instead of the public Navbar
const ADMIN_PATHS = ['/admin-dashboard', '/admin-login'];

function AppLayout() {
  const location = useLocation();
  const isAdminPath = ADMIN_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Render the correct navbar based on the current path */}
      {isAdminPath ? <AdminNavbar /> : <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/"               element={<Home />} />
          <Route path="/about"          element={<About />} />
          <Route path="/listings"       element={<Listings />} />
          <Route path="/listings/:id"   element={<Details />} />
          <Route path="/ai-assistant"   element={<AICareerAssistant />} />
          <Route path="/contact"        element={<Contact />} />

          {/* ── Auth routes (no guards needed) ── */}
          <Route path="/login"          element={<StudentLogin />} />
          <Route path="/admin-login"    element={<AdminLogin />} />

          {/* ── Protected student routes ── */}
          <Route path="/student-dashboard"  element={<StudentRoute><StudentDashboard /></StudentRoute>} />
          <Route path="/recruiter-dashboard" element={<RecruiterRoute><RecruiterDashboard /></RecruiterRoute>} />
          <Route path="/add-internship"     element={<RecruiterRoute><AddInternship /></RecruiterRoute>} />

          {/* ── Protected admin routes ── */}
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </main>

      {/* Hide footer on admin paths */}
      {!isAdminPath && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
