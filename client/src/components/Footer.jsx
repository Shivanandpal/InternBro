import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-darkCard border-t border-gray-200/50 dark:border-darkBorder/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-violetAccent-500 flex items-center justify-center text-white font-bold">
                <Rocket className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight dark:text-white">
                Intern<span className="text-brand-500">BRO</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              "Launch Your Career, One Internship at a Time." The modern full-featured platform built to link outstanding students with industry leaders.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Student Routes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Students</h3>
            <ul className="space-y-2">
              <li><Link to="/listings" className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 transition-colors">Browse Internships</Link></li>
              <li><Link to="/ai-assistant" className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 transition-colors">AI Resume Analyzer</Link></li>
              <li><Link to="/ai-assistant" className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 transition-colors">AI Career Coach</Link></li>
              <li><Link to="/student-dashboard" className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 transition-colors">Skill Assessments</Link></li>
            </ul>
          </div>

          {/* Recruiter Routes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Recruiters</h3>
            <ul className="space-y-2">
              <li><Link to="/recruiter-dashboard" className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 transition-colors">Post Internships</Link></li>
              <li><Link to="/recruiter-dashboard" className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 transition-colors">Manage Candidates</Link></li>
              <li><Link to="/recruiter-dashboard" className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 transition-colors">Posting Analytics</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Get the latest career tips and featured internship alerts sent to your inbox.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing to InternBRO newsletter!"); }} className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter email"
                required
                className="flex-grow px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-darkBg dark:border-darkBorder dark:focus:ring-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-brand-600 to-violetAccent-500 text-white rounded-lg font-semibold text-xs hover:from-brand-700 hover:to-violetAccent-600 shadow-sm"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-darkBorder/40 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} InternBRO. All rights reserved.</p>
          <p className="text-xs text-gray-400 flex items-center mt-2 md:mt-0">
            Crafted with <Heart className="w-3.5 h-3.5 mx-1 text-red-500 fill-red-500 animate-pulse-slow" /> for global builders.
          </p>
        </div>
      </div>
    </footer>
  );
}
