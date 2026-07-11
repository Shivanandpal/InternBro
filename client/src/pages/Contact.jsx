import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedLogs, setSubmittedLogs] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const logEntry = {
      name,
      email,
      subject,
      message,
      time: new Date().toLocaleTimeString()
    };

    setTimeout(() => {
      setSubmittedLogs(prev => [logEntry, ...prev]);
      setSubmitting(false);
      setShowSuccess(true);
      
      // Clear fields
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1200);
  };

  return (
    <div className="page-transition min-h-screen relative overflow-hidden bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 py-16">
      <div className="glow-blob w-[300px] h-[300px] bg-brand-500 top-[20%] left-[-100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl dark:text-white leading-tight">
            We'd Love To <br/>
            <span className="bg-gradient-to-r from-brand-600 to-violetAccent-500 bg-clip-text text-transparent">
              Hear From You
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Have questions about student matches, recruiter setups, or AI resume analyzer configurations? Get in touch with our team today.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* LEFT COLUMN: CONTACT DETAILS CARDS */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl p-6 flex items-center space-x-4 shadow-sm hover-card">
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center flex-shrink-0 border">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Email Support</h4>
                <p className="text-xs text-gray-400 mt-0.5">support@internbro.com</p>
              </div>
            </div>

            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl p-6 flex items-center space-x-4 shadow-sm hover-card">
              <div className="w-12 h-12 bg-violetAccent-50 dark:bg-violetAccent-950/20 text-violetAccent-600 dark:text-violetAccent-400 rounded-xl flex items-center justify-center flex-shrink-0 border">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Call Support</h4>
                <p className="text-xs text-gray-400 mt-0.5">+1 (555) 019-2834</p>
              </div>
            </div>

            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl p-6 flex items-center space-x-4 shadow-sm hover-card">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 border">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Corporate HQ</h4>
                <p className="text-xs text-gray-400 mt-0.5">San Francisco, CA, USA</p>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: VALIDATED INQUIRY FORM */}
          <div className="lg:col-span-2 bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="font-display font-bold text-lg dark:text-white">Send a Message</h3>
              <p className="text-xs text-gray-400 mt-0.5">We respond within 24 business hours.</p>
            </div>

            {showSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200/40 rounded-2xl text-center space-y-3 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-semibold text-base text-gray-900 dark:text-white">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-gray-400">Thank you. Your message has been logged in our simulated database thread below.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Subject Topic</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Inquiry Message</label>
                  <textarea
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-brand-500/15"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* LOGS DISPLAY (Developer feature!) */}
        {submittedLogs.length > 0 && (
          <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto space-y-4 animate-slide-up">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center space-x-2 border-b border-gray-100 dark:border-darkBorder/30 pb-3">
              <MessageSquare className="w-4.5 h-4.5 text-brand-500" />
              <span>Simulated Client Communication Log ({submittedLogs.length})</span>
            </h3>
            
            <div className="space-y-3">
              {submittedLogs.map((log, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-darkBorder/40 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-800 dark:text-gray-300">{log.name} &bull; <span className="text-gray-400 font-normal">{log.email}</span></span>
                    <span className="text-[10px] text-gray-400">{log.time}</span>
                  </div>
                  <div className="text-xs font-semibold text-brand-500">{log.subject}</div>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
