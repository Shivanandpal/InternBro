import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, DollarSign, Star, Zap } from 'lucide-react';

export default function InternshipCard({ job, isSaved, onSaveToggle, matchScore, matchingSkills }) {
  const companyInitial = job.company ? job.company.charAt(0) : 'C';

  return (
    <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 dark:hover:shadow-brand-950/20 relative flex flex-col justify-between h-full">
      {/* Top Header Card */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {job.logo ? (
              <img
                src={job.logo}
                alt={job.company}
                className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-darkBorder bg-gray-50 dark:bg-darkBg"
                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${job.company}`; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg border border-brand-100 dark:border-brand-900/30">
                {companyInitial}
              </div>
            )}
            <div>
              <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white leading-tight hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                <Link to={`/listings/${job.id || job._id}`}>{job.title}</Link>
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{job.company}</p>
            </div>
          </div>
          
          {/* Action Saved Star */}
          <button
            onClick={() => onSaveToggle && onSaveToggle(job.id || job._id)}
            className={`p-2 rounded-xl transition-all duration-300 ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-200/50 dark:border-amber-900/30'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-darkBg dark:hover:bg-darkBorder/40 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border border-gray-200/30 dark:border-darkBorder/20'
            }`}
            title={isSaved ? "Saved" : "Save for Later"}
          >
            <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Match score display if matches skills */}
        {matchScore !== undefined && (
          <div className="mt-4 flex items-center space-x-2 bg-gradient-to-r from-brand-500/10 to-violetAccent-500/10 border border-brand-500/20 dark:border-brand-500/10 rounded-xl px-3 py-1.5 w-max">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              AI Match: <strong>{matchScore}%</strong>
            </span>
          </div>
        )}

        {/* Grid Meta Information */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-5 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{job.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="truncate font-medium text-gray-700 dark:text-gray-300">{job.stipend || 'Unpaid'}</span>
          </div>
        </div>

        {/* Skills Required */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {job.skillsRequired.slice(0, 3).map((skill, index) => {
              const matches = matchingSkills && matchingSkills.some(ms => ms.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(ms.toLowerCase()));
              return (
                <span
                  key={index}
                  className={`text-xs px-2.5 py-1 rounded-lg border ${
                    matches
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30 font-semibold'
                      : 'bg-gray-50 dark:bg-darkBg/60 text-gray-500 dark:text-gray-400 border-gray-200/50 dark:border-darkBorder/40'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
            {job.skillsRequired.length > 3 && (
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-darkBg border border-gray-200/50 dark:border-darkBorder/40 px-2 py-1 rounded-lg">
                +{job.skillsRequired.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-darkBorder/40 flex items-center justify-between space-x-3">
        <span className="text-[11px] text-gray-400 font-medium">Deadline: {job.deadline || 'Ongoing'}</span>
        <Link
          to={`/listings/${job.id || job._id}`}
          className="px-4 py-2 text-xs font-semibold rounded-xl text-brand-600 dark:text-brand-400 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-950/40 border border-brand-200/40 dark:border-brand-900/20 transition-all text-center flex-grow"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
