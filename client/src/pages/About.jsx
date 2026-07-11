import React from 'react';
import { Rocket, Target, Heart, CheckCircle2 } from 'lucide-react';

export default function About() {
  const principles = [
    {
      title: "Our Mission",
      desc: "To democratize professional career pathways by building direct, friction-free connections between student builders and leading talent recruiters globally.",
      icon: Target,
      color: "text-brand-500 bg-brand-50 dark:bg-brand-950/20 border-brand-100 dark:border-brand-900/30"
    },
    {
      title: "Our Vision",
      desc: "To construct the ultimate AI-driven career incubator where every student receives personalized coaching, resume alignment, and skill recommendations to land their dream job.",
      icon: Rocket,
      color: "text-violetAccent-500 bg-violetAccent-50 dark:bg-violetAccent-950/20 border-violetAccent-100 dark:border-violetAccent-900/30"
    },
    {
      title: "Our Values",
      desc: "Authenticity, growth mindset, and developer elegance. We believe standard minimum products are failures; we build premium ecosystems that inspire users.",
      icon: Heart,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
    }
  ];

  const valueProps = [
    "Gemini AI integration for resume review and career roadmaps.",
    "Integrated PDF resume builder linked directly to analysis engines.",
    "Dual-role platform setups to switch student & recruiter experiences instantly.",
    "Vetted internship listings with clear deadline notifications.",
    "Direct applicant shortlisting dashboard with matching scores.",
    "Community channel discussion boards for collaborative prep."
  ];

  return (
    <div className="page-transition min-h-screen relative overflow-hidden bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 py-16">
      <div className="glow-blob w-[400px] h-[400px] bg-brand-500 top-[-100px] right-[-100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl dark:text-white leading-tight">
            Connecting Talent With <br/>
            <span className="bg-gradient-to-r from-brand-600 to-violetAccent-500 bg-clip-text text-transparent">
              Tomorrow's Industry Leaders
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            InternBRO is more than a job portal; it is an AI-powered incubator helping you structure your portfolio and accelerate your career.
          </p>
        </div>

        {/* Mission Vision Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {principles.map((pr, idx) => {
            const Icon = pr.icon;
            return (
              <div key={idx} className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl p-8 hover-card">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 shadow-sm ${pr.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-3">{pr.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{pr.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Key differentiators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="font-display font-extrabold text-3xl dark:text-white leading-tight">
              Why Students & Talent Partners Choose InternBRO
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              We understand that standard resume lists are outdated. Students need actionable guidance on what core skills to add, while recruiters need data-driven candidate shortlisting metrics to skip hundreds of hours reading duplicate PDFs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {valueProps.map((prop, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Beautiful side graphic card */}
          <div className="bg-gradient-to-tr from-brand-600 to-violetAccent-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-[360px]">
            <div className="glow-blob w-[200px] h-[200px] bg-white opacity-10 top-0 left-0"></div>
            <div className="space-y-4 relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full">Core Technology Stack</span>
              <h3 className="font-display font-extrabold text-3xl">Fully Integrated AI Capabilities</h3>
              <p className="text-brand-100 text-sm leading-relaxed">
                Powered by Google Gemini 1.5 models, InternBRO provides immediate, realistic evaluations, allowing student applicants to benchmark their skills profile directly against job details before applying.
              </p>
            </div>
            <div className="border-t border-white/20 pt-4 flex items-center justify-between text-xs text-brand-100 z-10">
              <span>Frontend: React, Tailwind CSS</span>
              <span>Backend: Node, Express, MongoDB</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
