import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileSearch, Sparkles, MessageSquareCode, FileText, Send, CheckCircle2, ChevronRight, Zap, RefreshCw, Star, CreditCard, Lock, Check, Download, Image, Clock, LogIn, Upload } from 'lucide-react';
import * as authAPI from '../api/auth';

const API_BASE_URL = 'https://internbro.onrender.com/api';

export default function AICareerAssistant() {
  const { user, setUser, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  //checks
  // Workspace tabs: 'analyzer' | 'chat' | 'builder'
  const [activeTab, setActiveTab] = useState('analyzer');

  // 1. Resume Analyzer States
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // 2. Chat Assistant States
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hello! I am InternBRO's Career Coach. I can analyze your skills, recommend learning roadmaps, mock interview talking points, or review your projects. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Resume File states and Checkout Modal states
  const [resumeFile, setResumeFile] = useState(null);
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'text'
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Load Razorpay Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Trigger Razorpay upgrade order and overlay
  const handleBuyPremium = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Failed to load Razorpay SDK. Check your internet connection.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://internbro.onrender.com/payment/create-order", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        alert("Failed to initiate payment. Please log in again.");
        return;
      }
      const orderData = await res.json();

      if (orderData.id.startsWith("order_mock")) {
        alert("Payment Verified! You are now a Premium Member (Mock Mode)!");
        setUser(prev => ({ ...prev, premium: true }));
        setShowPremiumModal(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "InternBRO Premium",
        description: "Lifetime access to all AI features & premium templates",
        image: "https://api.dicebear.com/7.x/adventurer/svg?seed=InternBRO",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("https://internbro.onrender.com/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            if (verifyRes.ok) {
              alert("Payment Verified! You are now a Premium Member!");
              const resMe = await authAPI.me();
              if (resMe.data) setUser(resMe.data);
              setShowPremiumModal(false);
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            alert("Error verifying payment.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || ""
        },
        theme: {
          color: "#6366f1"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Razorpay checkout failed.");
    }
  };

  // 3. Resume Builder States
  const [cvName, setCvName] = useState('');
  const [cvEmail, setCvEmail] = useState('');
  const [cvTitle, setCvTitle] = useState('');
  const [cvSkills, setCvSkills] = useState('');
  const [cvBio, setCvBio] = useState('');
  const [cvEduSchool, setCvEduSchool] = useState('');
  const [cvEduDegree, setCvEduDegree] = useState('');
  const [cvEduYear, setCvEduYear] = useState('');
  const [cvProjTitle, setCvProjTitle] = useState('');
  const [cvProjDesc, setCvProjDesc] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [purchasedTemplates, setPurchasedTemplates] = useState(() => {
    const saved = localStorage.getItem('internbro_purchased_templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [previewTimer, setPreviewTimer] = useState(0);
  const [previewTemplateId, setPreviewTemplateId] = useState(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(null); // 'pdf' | 'png'

  useEffect(() => {
    window.scrollTo(0, 0);
    // Pre-populate builder details from active student profile
    if (profile?.profile?.purchasedTemplates) {
      setPurchasedTemplates(profile.profile.purchasedTemplates);
    }
    if (profile) {
      setCvName(profile.name || '');
      setCvEmail(profile.email || '');
      setCvTitle(profile.profile?.title || '');
      setCvSkills(profile.profile?.skills?.join(', ') || '');
      setCvBio(profile.profile?.bio || '');

      const edu = profile.profile?.education?.[0];
      if (edu) {
        setCvEduSchool(edu.school || '');
        setCvEduDegree(edu.degree || '');
        setCvEduYear(edu.year || '');
      }

      const proj = profile.profile?.projects?.[0];
      if (proj) {
        setCvProjTitle(proj.title || '');
        setCvProjDesc(proj.description || '');
      }
    }
  }, [profile]);

  // Handle Resume Analysis submission via port 8000
  const handleResumeAnalysis = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!resumeFile && !resumeText.trim()) {
      alert("Please upload a resume file or paste your resume text.");
      return;
    }
    setAnalyzing(true);
    setAnalysisResult(null);
    const token = localStorage.getItem("token");
    try {
      let res;
      if (inputMode === 'upload' && resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        res = await fetch("https://internbro.onrender.com/resume/analyze", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
      } else {
        const fileBlob = new Blob([resumeText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const mockFile = new File([fileBlob], "resume_text.docx", { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const formData = new FormData();
        formData.append("file", mockFile);
        res = await fetch("https://internbro.onrender.com/resume/analyze", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
      }

      if (res.status === 403) {
        setShowPremiumModal(true);
      } else if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
        const resMe = await authAPI.me();
        if (resMe.data) setUser(resMe.data);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to analyze resume.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting the AI analysis server.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle conversational chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setSendingChat(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://internbro.onrender.com/chat/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: userMsg.content })
      });

      if (res.status === 403) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Your free AI credits have expired. Please upgrade to Premium to continue chatting with the Career Coach!" }]);
        setShowPremiumModal(true);
      } else if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        const resMe = await authAPI.me();
        if (resMe.data) setUser(resMe.data);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to send chat message.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting the AI Career Coach.");
    } finally {
      setSendingChat(false);
    }
  };

  // Sync Resume Builder to Student Profile
  const handleSyncBuilder = async () => {
    const skillsArray = cvSkills.split(',').map(s => s.trim()).filter(Boolean);
    const syncPayload = {
      profile: {
        ...profile?.profile,
        title: cvTitle,
        skills: skillsArray,
        bio: cvBio,
        education: [{ school: cvEduSchool, degree: cvEduDegree, year: cvEduYear }],
        projects: [{ title: cvProjTitle, description: cvProjDesc, link: '#' }],
        resumeUrl: 'https://internbro-resumes.s3.amazonaws.com/live-builder-cv.pdf'
      }
    };

    const ok = await updateProfile(syncPayload);
    if (ok) {
      alert("Resume builder details synchronized successfully with your main profile! You are ready to apply with these credentials.");
    }
  };

  // Handle 15-second countdown timer for premium template previews
  useEffect(() => {
    let intervalId;
    if (previewTimer > 0 && selectedTemplate === previewTemplateId) {
      intervalId = setInterval(() => {
        setPreviewTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setPendingTemplate(previewTemplateId);
            setShowPaymentModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [previewTimer, selectedTemplate, previewTemplateId]);

  const handleTemplateSelect = async (templateId) => {
    if (purchasedTemplates.includes(templateId) || templateId === 'classic') {
      setSelectedTemplate(templateId);
      setPreviewTemplateId(templateId);
      return;
    }

    // Guard: require login before showing payment
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (previewTemplateId !== templateId) {
      setSelectedTemplate(templateId);
      setPreviewTemplateId(templateId);
      setPreviewTimer(15);
    } else if (previewTimer > 0) {
      setSelectedTemplate(templateId);
    } else {
      setPendingTemplate(templateId);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Check your internet connection.");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://internbro.onrender.com/payment/create-order-templates", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) {
          alert("Failed to initiate templates payment. Please log in again.");
          return;
        }
        const orderData = await res.json();

        if (orderData.id.startsWith("order_mock")) {
          alert("Payment Verified! Premium templates unlocked successfully (Mock Mode)!");
          const newPurchased = [...purchasedTemplates, templateId];
          setPurchasedTemplates(newPurchased);
          localStorage.setItem('internbro_purchased_templates', JSON.stringify(newPurchased));
          setSelectedTemplate(templateId);
          setPreviewTemplateId(templateId);
          setPreviewTimer(0);
          return;
        }

        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "InternBRO Resume Templates",
          description: "Unlock all premium recruiter-approved CV layouts",
          image: "https://api.dicebear.com/7.x/adventurer/svg?seed=InternBROCV",
          order_id: orderData.id,
          handler: async function (response) {
            try {
              const verifyRes = await fetch("https://internbro.onrender.com/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              if (verifyRes.ok) {
                alert("Payment Verified! Premium templates unlocked successfully!");
                const newPurchased = [...purchasedTemplates, templateId];
                setPurchasedTemplates(newPurchased);
                localStorage.setItem('internbro_purchased_templates', JSON.stringify(newPurchased));
                setSelectedTemplate(templateId);
                setPreviewTemplateId(templateId);
                setPreviewTimer(0);
              } else {
                alert("Payment verification failed.");
              }
            } catch (err) {
              console.error(err);
              alert("Error verifying payment.");
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || ""
          },
          theme: {
            color: "#6366f1"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error(err);
        alert("Razorpay checkout failed.");
      }
    }
  };

  const handleUnlockTemplate = async () => {
    setIsProcessingPayment(true);
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Failed to load Razorpay SDK. Check your internet connection.");
      setIsProcessingPayment(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://internbro.onrender.com/payment/create-order-templates", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        alert("Failed to initiate templates payment. Please log in again.");
        setIsProcessingPayment(false);
        return;
      }
      const orderData = await res.json();

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "InternBRO Resume Templates",
        description: "Unlock all premium recruiter-approved CV layouts",
        image: "https://api.dicebear.com/7.x/adventurer/svg?seed=InternBROCV",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("https://internbro.onrender.com/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            if (verifyRes.ok) {
              alert("Payment Verified! Template is now unlocked!");
              const updatedPurchases = [...purchasedTemplates, pendingTemplate || 'premium_all'];
              setPurchasedTemplates(updatedPurchases);

              // Sync template purchase with Express database
              const updatedPayload = {
                profile: {
                  ...profile?.profile,
                  purchasedTemplates: updatedPurchases
                }
              };
              await updateProfile(updatedPayload);

              setShowPaymentModal(false);
              setPendingTemplate(null);
              setPaymentSuccess(true);
              setTimeout(() => setPaymentSuccess(false), 3000);
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            alert("Error verifying payment.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || ""
        },
        theme: {
          color: "#8b5cf6"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Razorpay templates checkout failed.");
      setIsProcessingPayment(false);
    }
  };

  const triggerDownload = (format) => {
    const isPremium = selectedTemplate !== 'classic';
    const isPurchased = purchasedTemplates.includes(selectedTemplate) || purchasedTemplates.includes('premium_all');

    if (isPremium && !isPurchased) {
      // Guard: require login before showing payment
      if (!user) {
        setDownloadModalOpen(false);
        setShowLoginPrompt(true);
        return;
      }
      setPendingTemplate(selectedTemplate);
      setShowPaymentModal(true);
      setDownloadModalOpen(false);
      return;
    }

    setDownloadFormat(format);
    setDownloading(true);

    setTimeout(() => {
      const element = document.createElement("a");
      let fileContent = `InternBRO Professional CV\n=========================\n\nCandidate: ${cvName}\nRole: ${cvTitle}\nEmail: ${cvEmail}\nSkills: ${cvSkills}\nBio: ${cvBio}\n\nEducation:\n- ${cvEduSchool} &bull; ${cvEduDegree} &bull; Year: ${cvEduYear}\n\nProject Work:\n- ${cvProjTitle}: ${cvProjDesc}\n\nFormat: Vector Export (ATS-friendly) / Generated via InternBRO Resume Engine\n`;
      let mimeType = format === 'pdf' ? 'application/pdf' : 'image/png';
      let extension = format === 'pdf' ? '.pdf' : '.png';

      const file = new Blob([fileContent], { type: mimeType });
      element.href = URL.createObjectURL(file);
      element.download = `${cvName.replace(/\s+/g, '_')}_Resume_${selectedTemplate}${extension}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setDownloading(false);
      setDownloadModalOpen(false);
      alert(`Resume successfully downloaded as ${format.toUpperCase()}!`);
    }, 2000);
  };

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'tech':
        return (
          <div className="bg-white text-gray-900 border border-gray-200 rounded-xl overflow-hidden shadow-xl w-full min-h-[550px] font-sans text-left flex flex-col justify-between">
            <div className="grid grid-cols-3 min-h-[500px]">
              {/* Left Sidebar */}
              <div className="col-span-1 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  {/* Profile Info */}
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden mb-2">
                      <img src={profile?.profile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cvName}`} alt="avatar" className="w-full h-full object-cover animate-fade-in" />
                    </div>
                    <h3 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wide truncate">{cvName || 'FULL NAME'}</h3>
                    <p className="text-[8px] font-semibold text-brand-600 truncate">{cvTitle || 'Target Role'}</p>
                    <p className="text-[8px] text-slate-500 truncate mt-1">{cvEmail || 'email@internbro.com'}</p>
                  </div>

                  {/* Competencies */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {cvSkills ? (
                        cvSkills.split(',').map((s, i) => (
                          <span key={i} className="text-[8px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-semibold">{s.trim()}</span>
                        ))
                      ) : (
                        <span className="text-[8px] text-slate-400">No skills added</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-1">Education</h4>
                  <div className="space-y-1 text-[8px] text-slate-600">
                    <strong className="text-slate-800 block truncate">{cvEduSchool || 'Delhi Technological University'}</strong>
                    <span className="block truncate">{cvEduDegree || 'B.Tech in Computer Science'}</span>
                    <span className="text-slate-400">{cvEduYear || '2027'}</span>
                  </div>
                </div>
              </div>

              {/* Right Main Panel */}
              <div className="col-span-2 p-6 space-y-5">
                {/* Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider border-l-2 border-brand-500 pl-2">Professional Summary</h4>
                  <p className="text-[9px] text-slate-500 leading-relaxed font-sans">{cvBio || 'A highly energetic and dedicated student builder seeking internship positions to deploy coding solutions.'}</p>
                </div>

                {/* Project */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider border-l-2 border-brand-500 pl-2">Featured Project</h4>
                  <div className="space-y-1 text-[9px] font-sans">
                    <div className="flex justify-between items-baseline">
                      <strong className="text-slate-800 text-[10px]">{cvProjTitle || 'InternBRO Matchmaker'}</strong>
                      <span className="text-[8px] font-medium text-slate-400">React & Express</span>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-relaxed">{cvProjDesc || 'Designed and developed an AI-powered internship matchmaking platform using React, Node, and Gemini AI APIs fallbacks.'}</p>
                  </div>
                </div>

                {/* Extra Section */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider border-l-2 border-brand-500 pl-2">Key Achievements</h4>
                  <ul className="space-y-1 text-[8px] text-slate-500 list-disc pl-4 font-sans">
                    <li>Participated in national level hackathons and developed front-end systems.</li>
                    <li>Completed vetted skill assessment credentials inside InternBRO platform.</li>
                    <li>Collaborated on team projects to implement full-stack code solutions.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 text-white text-center py-2 text-[8px] tracking-wide rounded-b-xl">
              Sleek Tech Premium Template powered by InternBRO Resume Engine
            </div>
          </div>
        );
      case 'indigo':
        return (
          <div className="bg-white text-gray-900 border border-gray-200 rounded-xl overflow-hidden shadow-xl w-full min-h-[550px] font-sans text-left flex flex-col justify-between">
            <div>
              {/* Premium Gradient Header Banner */}
              <div className="bg-gradient-to-r from-brand-600 to-violetAccent-500 p-6 text-white text-center space-y-1">
                <h2 className="text-xl font-extrabold tracking-wider uppercase">{cvName || 'FULL NAME'}</h2>
                <p className="text-[10px] font-bold text-violetAccent-100 uppercase tracking-widest">{cvTitle || 'Target Career Position'}</p>
                <div className="flex justify-center space-x-3 text-[8px] text-brand-100 font-sans pt-1">
                  <span>{cvEmail || 'email@internbro.com'}</span>
                  <span>&bull;</span>
                  <span>+91 XXXXX XXXXX</span>
                </div>
              </div>

              {/* Grid content */}
              <div className="p-6 grid grid-cols-2 gap-6">
                {/* Grid Left */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-extrabold text-violetAccent-600 uppercase tracking-widest border-b pb-1 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-violetAccent-500" />
                      <span>About Candidate</span>
                    </h4>
                    <p className="text-[9px] text-gray-500 leading-relaxed font-sans">{cvBio || 'A highly energetic and dedicated student builder seeking internship positions to deploy coding solutions.'}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[9px] font-extrabold text-violetAccent-600 uppercase tracking-widest border-b pb-1 flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-violetAccent-500" />
                      <span>Featured Project</span>
                    </h4>
                    <div className="space-y-1 text-[9px] font-sans">
                      <strong className="text-gray-800 block text-[10px]">{cvProjTitle || 'InternBRO platform'}</strong>
                      <p className="text-gray-500 leading-relaxed">{cvProjDesc || 'Designed and developed an AI-powered internship matchmaking platform using React, Node, and Gemini AI APIs fallbacks.'}</p>
                    </div>
                  </div>
                </div>

                {/* Grid Right */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-extrabold text-violetAccent-600 uppercase tracking-widest border-b pb-1 flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-violetAccent-500" />
                      <span>Academic Background</span>
                    </h4>
                    <div className="space-y-1 text-[9px] font-sans">
                      <strong className="text-gray-800 block">{cvEduSchool || 'Delhi Technological University'}</strong>
                      <span className="text-brand-600 block font-semibold text-[8px]">{cvEduDegree || 'B.Tech in Computer Science'}</span>
                      <span className="text-gray-400 block text-[8px]">Graduation: {cvEduYear || '2027'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[9px] font-extrabold text-violetAccent-600 uppercase tracking-widest border-b pb-1 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-violetAccent-500" />
                      <span>Core Competencies</span>
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {cvSkills ? (
                        cvSkills.split(',').map((s, i) => (
                          <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-violetAccent-50 border border-violetAccent-100 text-violetAccent-600 font-semibold">{s.trim()}</span>
                        ))
                      ) : (
                        <span className="text-[8px] text-gray-400 font-sans">Enter skills in input panel</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-[8px] text-gray-400 font-sans py-3 border-t border-gray-100">
              Indigo Executive Premium Template &bull; HR-Vetted Placement Format
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="bg-white text-gray-900 border border-gray-200 rounded-xl overflow-hidden shadow-xl w-full min-h-[550px] font-sans text-left flex flex-col justify-between p-6">
            <div className="space-y-5">
              {/* Clean asymmetrical header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-800">{cvName || 'FULL NAME'}</h2>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{cvTitle || 'TARGET POSITION TITLE'}</p>
                </div>
                <div className="text-right text-[8px] text-slate-400 font-mono">
                  <div>{cvEmail || 'your.email@internbro.com'}</div>
                  <div>+91 XXXXX XXXXX</div>
                </div>
              </div>

              {/* Bio summary */}
              <p className="text-[9px] text-slate-500 italic leading-relaxed">
                "{cvBio || 'A highly energetic and dedicated student builder seeking internship positions to deploy coding solutions.'}"
              </p>

              {/* Main content asymmetrical split */}
              <div className="grid grid-cols-3 gap-6 pt-2">
                <div className="col-span-1 space-y-4">
                  {/* Skills block */}
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider">Expertise</h4>
                    <div className="space-y-1 pt-1">
                      {cvSkills ? (
                        cvSkills.split(',').map((s, i) => (
                          <div key={i} className="flex items-center space-x-1.5 text-[8px] text-slate-600">
                            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full flex-shrink-0"></span>
                            <span>{s.trim()}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[8px] text-slate-400">No skills added</span>
                      )}
                    </div>
                  </div>

                  {/* Education block */}
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider">Academics</h4>
                    <div className="space-y-0.5 text-[8px] text-slate-600">
                      <strong className="text-slate-800 block truncate">{cvEduSchool || 'DTU University'}</strong>
                      <span className="block truncate">{cvEduDegree || 'B.Tech in CSE'}</span>
                      <span className="text-slate-400 block">{cvEduYear || '2027'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 space-y-4">
                  {/* Highlighted Project */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider">Highlighted Project Work</h4>
                    <div className="space-y-1 text-[9px] font-sans">
                      <strong className="text-slate-800 text-[10px]">{cvProjTitle || 'InternBRO platform'}</strong>
                      <p className="text-slate-500 leading-relaxed">{cvProjDesc || 'Designed and developed an AI-powered internship matchmaking platform using React, Node, and Gemini AI APIs fallbacks.'}</p>
                    </div>
                  </div>

                  {/* Core achievements list */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider">Achievements</h4>
                    <div className="space-y-1 text-[8px] text-slate-500 leading-relaxed font-sans">
                      <p>Completed and certified in React competence with score above 66%.</p>
                      <p>Developed robust reusable components utilizing Tailwind utility tokens.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-[7px] text-slate-400 font-mono tracking-wider pt-6 border-t border-slate-100">
              Creative Minimalist Premium Template powered by InternBRO Resume Builder
            </div>
          </div>
        );
      default:
        // 'classic'
        return (
          <div className="bg-white text-gray-900 border border-gray-300 rounded-xl p-8 space-y-6 shadow-xl w-full min-h-[550px] font-serif leading-relaxed text-left flex flex-col justify-between font-serif">
            <div>
              {/* CV Header */}
              <div className="text-center border-b border-gray-300 pb-4 space-y-1">
                <h2 className="text-2xl font-bold tracking-wide uppercase font-serif text-gray-900">{cvName || 'YOUR FULL NAME'}</h2>
                <p className="text-xs text-brand-600 font-semibold">{cvTitle || 'TARGET POSITION TITLE'}</p>
                <p className="text-[10px] text-gray-500 font-sans">{cvEmail || 'your.email@internbro.com'} &bull; +91 XXXXX XXXXX</p>
              </div>

              {/* Summary */}
              <div className="mt-5 space-y-1">
                <h4 className="text-[10px] font-bold tracking-wider uppercase border-b border-gray-200 text-gray-800 font-serif">Professional Summary</h4>
                <p className="text-[10px] text-gray-600 font-sans">{cvBio || 'A highly energetic and dedicated student builder seeking internship positions to deploy coding solutions.'}</p>
              </div>

              {/* Education */}
              <div className="mt-5 space-y-1.5">
                <h4 className="text-[10px] font-bold tracking-wider uppercase border-b border-gray-200 text-gray-800 font-serif">Academic Background</h4>
                <div className="flex justify-between text-[10px] font-sans">
                  <div>
                    <strong>{cvEduSchool || 'Delhi Technological University'}</strong>
                    <p className="text-gray-50">{cvEduDegree || 'B.Tech in Computer Science'}</p>
                  </div>
                  <span className="text-gray-400">{cvEduYear || '2027'}</span>
                </div>
              </div>

              {/* Projects */}
              <div className="mt-5 space-y-2">
                <h4 className="text-[10px] font-bold tracking-wider uppercase border-b border-gray-200 text-gray-800 font-serif">Highlighted Project Work</h4>
                <div className="space-y-1 text-[10px] font-sans">
                  <strong>{cvProjTitle || 'InternBRO platform'}</strong>
                  <p className="text-gray-600">{cvProjDesc || 'Designed and developed an AI-powered internship matchmaking platform using React, Node, and Gemini AI APIs fallbacks.'}</p>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="mt-5 space-y-2">
                <h4 className="text-[10px] font-bold tracking-wider uppercase border-b border-gray-200 text-gray-800 font-serif">Core Competencies</h4>
                <div className="flex flex-wrap gap-1">
                  {cvSkills ? (
                    cvSkills.split(',').map((s, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 bg-gray-100 rounded-md border text-gray-600 font-sans">{s.trim()}</span>
                    ))
                  ) : (
                    <span className="text-[9px] text-gray-400 font-sans">Enter skills separated by commas (e.g. React, CSS)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center text-[8px] text-gray-400 font-sans pt-6 border-t border-gray-100">
              Standardized Template powered by InternBRO Resume Engine.
            </div>
          </div>
        );
    }
  };

  return (
    <div className="page-transition min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Title */}
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/30 flex items-center justify-center shadow-sm shadow-brand-500/5">
            <Sparkles className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white leading-tight">AI Career Workspace</h1>
            <p className="text-xs text-gray-400 mt-0.5">Automated resume evaluation, direct PDF builders, and live chat guidance coached by Gemini.</p>
          </div>
        </div>

        {/* Workspace Toolbar Tabs */}
        <div className="flex space-x-2 border-b border-gray-200/60 dark:border-darkBorder/30 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'analyzer'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-darkCard hover:text-gray-900 dark:text-gray-200'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Resume Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'chat'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-darkCard hover:text-gray-900 dark:text-gray-200'
              }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>Interactive Coach</span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'builder'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-darkCard hover:text-gray-900 dark:text-gray-200'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF Resume Builder</span>
          </button>
        </div>

        {/* TAB WORKSPACE: RESUME ANALYZER */}
        {activeTab === 'analyzer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Input Panel */}
            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">Audit Fit Quotient</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Submit your resume to check your shortlist feasibility score.</p>
                </div>
                {user && (
                  <div className="px-3 py-1.5 rounded-xl text-xs font-bold border border-violetAccent-200 dark:border-violetAccent-800 bg-violetAccent-50/50 dark:bg-violetAccent-950/20 text-violetAccent-600 dark:text-violetAccent-400 flex items-center space-x-1.5">
                    <Star className="w-3.5 h-3.5 fill-violetAccent-500" />
                    <span>
                      {user.premium ? 'Premium' : `Credits: ${1 - (user.free_resume_used || 0)}/1`}
                    </span>
                  </div>
                )}
              </div>

              {/* Switch Input Mode */}
              <div className="flex rounded-xl bg-gray-100 dark:bg-darkBg p-1">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${inputMode === 'upload'
                    ? 'bg-brand-600 text-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${inputMode === 'text'
                    ? 'bg-brand-600 text-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                  Paste Text
                </button>
              </div>

              <form onSubmit={handleResumeAnalysis} className="space-y-4">

                {inputMode === 'upload' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Upload Resume (PDF/DOCX)</label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-darkBorder rounded-2xl p-6 text-center hover:border-brand-500 transition-colors relative cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {resumeFile ? (
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{resumeFile.name}</p>
                          <p className="text-[10px] text-gray-400">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Click or drag PDF/DOCX here</p>
                          <p className="text-[10px] text-gray-400">Max size: 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Paste Resume Text</label>
                    <textarea
                      rows="10"
                      placeholder="Paste the full text of your CV / resume..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      required={inputMode === 'text'}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl p-4 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white font-mono text-xs resize-none"
                    ></textarea>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/10"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating details...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Audit Resume</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results Display Panel */}
            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 min-h-[300px] flex flex-col justify-center">
              {analyzing ? (
                <div className="text-center space-y-3 py-20">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold text-gray-400">Gemini is auditing your skills overlapping structures...</p>
                </div>
              ) : !analysisResult ? (
                <div className="text-center py-20 text-gray-400 space-y-2">
                  <Sparkles className="w-12 h-12 text-gray-200 mx-auto" />
                  <h4 className="font-semibold text-sm">Waiting for Analysis</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">Upload or paste your text on the left to review your resume alignment results instantly.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">

                  {/* Best Fit Job Indicator */}
                  {analysisResult.bestFitJob && (
                    <div className="p-4 bg-emerald-50/65 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Best Fit Internship Match</span>
                      <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200">{analysisResult.bestFitJob.title}</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Company: {analysisResult.bestFitJob.company}</p>
                    </div>
                  )}

                  {/* Score circle/bar */}
                  <div className="flex items-center justify-between p-4 bg-brand-50/20 dark:bg-darkBg/60 border border-brand-200/40 rounded-2xl">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Shortlist Feasibility Score</h4>
                      <p className="text-xs text-gray-400">Benchmarked against target job keyword structures.</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center font-display font-extrabold text-xl shadow-md">
                      {analysisResult.matchPercentage}%
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key Strengths</h4>
                    <div className="space-y-2">
                      {analysisResult.strengths?.map((str, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{str}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvements */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Critical Improvements</h4>
                    <div className="space-y-2">
                      {analysisResult.improvements?.map((imp, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-violetAccent-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended skills */}
                  {analysisResult.recommendedSkills && analysisResult.recommendedSkills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recommended Skills to Add</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.recommendedSkills.map((sk, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-lg border border-brand-200/50 font-medium">{sk}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* General feedback */}
                  <div className="border-t border-gray-100 dark:border-darkBorder/40 pt-4 text-xs italic text-gray-500 leading-relaxed">
                    "{analysisResult.generalFeedback}"
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB WORKSPACE: INTERACTIVE CHAT COACH */}
        {activeTab === 'chat' && (
          <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl overflow-hidden h-[600px] flex flex-col justify-between shadow-sm">

            {/* Chat header */}
            <div className="bg-gray-50 dark:bg-darkBg px-6 py-4 border-b border-gray-200/60 dark:border-darkBorder/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                  <MessageSquareCode className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">AI Coach Workspace</h4>
                  <span className="text-[10px] text-emerald-500 font-semibold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span>Gemini Pro Chat Coach Online</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {user && (
                  <div className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-violetAccent-200 dark:border-violetAccent-800 bg-violetAccent-50/50 dark:bg-violetAccent-950/20 text-violetAccent-600 dark:text-violetAccent-400 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-violetAccent-500" />
                    <span>
                      {user.premium ? 'Premium' : `Credits: ${2 - (user.free_chat_used || 0)}/2`}
                    </span>
                  </div>
                )}

                {/* Chat starters dropdown shortcut */}
                <select
                  onChange={(e) => { setChatInput(e.target.value); }}
                  className="text-xs bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg px-2 py-1 w-44 focus:outline-none"
                >
                  <option value="">Choose a Starter...</option>
                  <option value="Provide a structured roadmap for learning full-stack Node.js React developer.">Learning Roadmap</option>
                  <option value="Review my B.Tech project plans. How do I make them look attractive on my resume?">Project Review</option>
                  <option value="Can we run a mock interview practice for a React intern position?">Mock Interview</option>
                </select>
              </div>
            </div>

            {/* Chat Messages flow */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/30 dark:bg-darkBg/10">
              {chatMessages.map((msg, index) => {
                const isCoach = msg.role === 'assistant';
                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-3.5 max-w-2xl ${isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse space-x-reverse'}`}
                  >
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 bg-white ${isCoach ? 'text-brand-600' : 'text-violetAccent-600'}`}>
                      {isCoach ? <Sparkles className="w-4 h-4 fill-brand-500/10 text-brand-500" /> : <Star className="w-4 h-4 text-violetAccent-500 fill-violetAccent-500/10" />}
                    </div>

                    <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${isCoach
                      ? 'bg-white border-gray-200/50 dark:bg-darkCard dark:border-darkBorder/40 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                      : 'bg-brand-600 border-brand-500 text-white rounded-tr-sm shadow-md shadow-brand-500/5'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {sendingChat && (
                <div className="flex items-start space-x-3 max-w-xl mr-auto animate-pulse">
                  <div className="w-8 h-8 rounded-full border bg-white flex items-center justify-center text-brand-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder/40 p-3 rounded-2xl text-xs text-gray-400 font-semibold">
                    Career Coach is analyzing answers...
                  </div>
                </div>
              )}
            </div>

            {/* Input field panel */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200/60 dark:border-darkBorder/30 bg-gray-50 dark:bg-darkBg/30 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask your career advisor anything (e.g. 'How do I explain closures?')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={sendingChat}
                className="flex-grow bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatInput.trim()}
                className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-colors flex-shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

        {/* TAB WORKSPACE: PDF RESUME BUILDER */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Input Form Panel */}
            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-3xl p-6 space-y-5">
              <div>
                <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">Professional CV Editor</h3>
                <p className="text-xs text-gray-400 mt-0.5">Input your professional details below to generate a standardized recruiter-friendly layout.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={cvName}
                      onChange={(e) => setCvName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Target Position Title</label>
                    <input
                      type="text"
                      value={cvTitle}
                      onChange={(e) => setCvTitle(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Candidate Email</label>
                  <input
                    type="email"
                    value={cvEmail}
                    onChange={(e) => setCvEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Core Skills (separated by commas)</label>
                  <input
                    type="text"
                    value={cvSkills}
                    onChange={(e) => setCvSkills(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Professional Summary Bio</label>
                  <textarea
                    rows="3"
                    value={cvBio}
                    onChange={(e) => setCvBio(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white resize-none"
                  ></textarea>
                </div>

                <div className="border-t border-gray-100 dark:border-darkBorder/40 pt-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Academic credentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="University name"
                      value={cvEduSchool}
                      onChange={(e) => setCvEduSchool(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2.5 focus:outline-none dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Degree / Course"
                      value={cvEduDegree}
                      onChange={(e) => setCvEduDegree(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2.5 focus:outline-none dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Graduation Year"
                      value={cvEduYear}
                      onChange={(e) => setCvEduYear(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2.5 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-darkBorder/40 pt-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Highlighted Project</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Project Name (e.g. InternBRO portal)"
                      value={cvProjTitle}
                      onChange={(e) => setCvProjTitle(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2.5 focus:outline-none dark:text-white"
                    />
                    <textarea
                      rows="2"
                      placeholder="Project description, outlines, tools used..."
                      value={cvProjDesc}
                      onChange={(e) => setCvProjDesc(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3 py-2.5 focus:outline-none dark:text-white resize-none"
                    ></textarea>
                  </div>
                </div>

                <button
                  onClick={handleSyncBuilder}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync & Publish to Student Profile</span>
                </button>
              </div>
            </div>            {/* REAL-TIME PREVIEW PANEL */}
            <div className="bg-gray-200/50 dark:bg-darkBg border border-gray-300 dark:border-darkBorder rounded-3xl p-6 min-h-[500px] flex flex-col justify-between animate-fade-in">
              <div className="space-y-4">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>Choose Layout Template</span>
                  {purchasedTemplates.length > 0 && (
                    <button
                      onClick={() => {
                        localStorage.removeItem('internbro_purchased_templates');
                        setPurchasedTemplates([]);
                        setSelectedTemplate('classic');
                        setPreviewTemplateId(null);
                        setPreviewTimer(0);
                        alert("Developer Mode: Purchases reset successfully! All premium templates are now locked.");
                      }}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-950/20 dark:border-red-900 text-red-500 rounded-lg text-[9px] font-bold transition-all"
                    >
                      Reset Purchases (Dev)
                    </button>
                  )}
                </div>

                {/* Template Selector Strip */}
                <div className="flex space-x-2.5 overflow-x-auto pb-2">
                  <button
                    onClick={() => handleTemplateSelect('classic')}
                    className={`flex-grow px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${selectedTemplate === 'classic'
                      ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                      : 'bg-white dark:bg-darkCard border-gray-200 dark:border-darkBorder text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Classic (Free)
                  </button>

                  <button
                    onClick={() => handleTemplateSelect('tech')}
                    className={`flex-grow px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${selectedTemplate === 'tech'
                      ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                      : 'bg-white dark:bg-darkCard border-gray-200 dark:border-darkBorder text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <span>Sleek Tech</span>
                    {purchasedTemplates.includes('tech') ? (
                      <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">UNLOCKED</span>
                    ) : (
                      <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold">₹19</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleTemplateSelect('indigo')}
                    className={`flex-grow px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${selectedTemplate === 'indigo'
                      ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                      : 'bg-white dark:bg-darkCard border-gray-200 dark:border-darkBorder text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <span>Indigo Grad</span>
                    {purchasedTemplates.includes('indigo') ? (
                      <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">UNLOCKED</span>
                    ) : (
                      <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold">₹19</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleTemplateSelect('creative')}
                    className={`flex-grow px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${selectedTemplate === 'creative'
                      ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                      : 'bg-white dark:bg-darkCard border-gray-200 dark:border-darkBorder text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <span>Creative Min</span>
                    {purchasedTemplates.includes('creative') ? (
                      <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">UNLOCKED</span>
                    ) : (
                      <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold">₹19</span>
                    )}
                  </button>
                </div>

                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>Real-Time Template Preview</span>

                  {/* Download Trigger Button */}
                  <button
                    onClick={() => {
                      const isPremium = selectedTemplate !== 'classic';
                      const isPurchased = purchasedTemplates.includes(selectedTemplate);
                      if (isPremium && !isPurchased) {
                        // Guard: require login before payment
                        if (!user) {
                          setShowLoginPrompt(true);
                          return;
                        }
                        setPendingTemplate(selectedTemplate);
                        setShowPaymentModal(true);
                      } else {
                        setDownloadModalOpen(true);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow transition-all active:scale-95 ${(selectedTemplate !== 'classic' && !purchasedTemplates.includes(selectedTemplate))
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white animate-pulse'
                      }`}
                  >
                    {(selectedTemplate !== 'classic' && !purchasedTemplates.includes(selectedTemplate)) ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock to Download (₹19)</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download CV</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Countdown banner for active trials */}
                {previewTimer > 0 && selectedTemplate === previewTemplateId && (
                  <div className="bg-gradient-to-r from-brand-600 to-violetAccent-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-pulse shadow-sm border border-brand-500/20 mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-300" />
                      <span>Premium Preview Active</span>
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Locking in: <strong>{previewTimer}s</strong></span>
                  </div>
                )}

                {/* Preview renderer with blur logic */}
                {selectedTemplate !== 'classic' && !purchasedTemplates.includes(selectedTemplate) && previewTemplateId === selectedTemplate && previewTimer === 0 ? (
                  <div className="relative rounded-xl overflow-hidden border border-red-200/40">
                    <div className="blur-md select-none pointer-events-none filter">
                      {renderTemplate()}
                    </div>

                    {/* Blurred checkout gate overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-xl">
                      <div className="w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center border border-white/20 shadow-md">
                        <Lock className="w-5 h-5 text-amber-300" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white">Preview Period Expired</h4>
                        <p className="text-[10px] text-gray-300 max-w-xs leading-relaxed">
                          Unlock the premium layout to customize, sync with profile, and download in print-ready PDF/Image formats.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!user) {
                            setShowLoginPrompt(true);
                            return;
                          }
                          setPendingTemplate(selectedTemplate);
                          setShowPaymentModal(true);
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95"
                      >
                        Unlock Layout for ₹19
                      </button>
                    </div>
                  </div>
                ) : (
                  renderTemplate()
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* LOGIN REQUIRED MODAL */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up text-left">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-600 to-violetAccent-500 p-6 text-white relative">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white text-xl font-bold bg-white/10 w-8 h-8 rounded-full flex items-center justify-center focus:outline-none"
              >
                &times;
              </button>
              <div className="flex items-center space-x-2.5">
                <Lock className="w-5 h-5 text-amber-300" />
                <h3 className="font-display font-extrabold text-lg">Login Required</h3>
              </div>
              <p className="text-xs text-brand-100 mt-1">You need to be logged in to access premium templates.</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="p-4 bg-violetAccent-50/50 dark:bg-violetAccent-950/15 border border-violetAccent-100 dark:border-violetAccent-900/30 rounded-2xl space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Premium resume templates and payment options are only available to registered users. Please log in or create a free account to continue.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate('/login');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Continue</span>
                </button>

                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full py-2.5 border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-gray-400 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-darkBg/40 transition-all"
                >
                  Continue Browsing
                </button>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Your data is safe. We never share your information.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM TEMPLATE CHECKOUT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up text-left">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-600 to-violetAccent-500 p-6 text-white relative">
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPendingTemplate(null);
                  }}
                  className="text-white/80 hover:text-white text-xl font-bold bg-white/10 w-8 h-8 rounded-full flex items-center justify-center focus:outline-none"
                >
                  &times;
                </button>
              </div>
              <div className="flex items-center space-x-2.5">
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                <h3 className="font-display font-extrabold text-lg">Unlock Premium Layout</h3>
              </div>
              <p className="text-xs text-brand-100 mt-1">Supercharge your interview calls with our elite recruiter templates.</p>
            </div>

            {/* Modal Body */}
            {paymentSuccess ? (
              <div className="p-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-display font-extrabold text-lg text-gray-900 dark:text-white">Payment Received!</h4>
                <p className="text-xs text-gray-400 leading-relaxed">₹19 paid successfully. Your premium template has been unlocked for lifetime access.</p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Pitch card */}
                <div className="p-4 bg-violetAccent-50/50 dark:bg-violetAccent-950/15 border border-violetAccent-100 dark:border-violetAccent-900/30 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-violetAccent-600 dark:text-violetAccent-400 uppercase tracking-wider">Premium Layout License</span>
                    <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">₹19 only</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Unlock lifetime access to this recruiter-approved CV layout to download your resume instantly.
                  </p>
                </div>

                {/* Payment Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select Payment Method</label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedPaymentMethod('upi')}
                      className={`p-3 border rounded-xl flex flex-col items-center justify-center space-y-1 transition-all ${selectedPaymentMethod === 'upi'
                        ? 'border-brand-500 bg-brand-50/20 text-brand-600 dark:text-brand-400 font-semibold'
                        : 'border-gray-200 dark:border-darkBorder text-gray-500 dark:text-gray-400 hover:bg-gray-55'
                        }`}
                    >
                      <Zap className="w-4 h-4 text-brand-500 mx-auto" />
                      <span className="text-[10px]">UPI (GPay/PhonePe)</span>
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`p-3 border rounded-xl flex flex-col items-center justify-center space-y-1 transition-all ${selectedPaymentMethod === 'card'
                        ? 'border-brand-500 bg-brand-50/20 text-brand-600 dark:text-brand-400 font-semibold'
                        : 'border-gray-200 dark:border-darkBorder text-gray-500 dark:text-gray-400 hover:bg-gray-55'
                        }`}
                    >
                      <CreditCard className="w-4 h-4 text-brand-500 mx-auto" />
                      <span className="text-[10px]">Credit / Debit Card</span>
                    </button>
                  </div>
                </div>

                {/* Form Inputs based on payment method */}
                {selectedPaymentMethod === 'upi' ? (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">UPI ID / Phone Number</label>
                    <input
                      type="text"
                      placeholder="username@okaxis or 9876543210"
                      className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:text-white"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Card Number</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:text-white"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Secure Badge */}
                <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Secure 256-Bit SSL Encrypted Checkout</span>
                </div>

                {/* Action button */}
                <button
                  onClick={handleUnlockTemplate}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing Payment secure...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Unlock Template (Pay ₹19)</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* DOWNLOAD FORMAT OPTIONS MODAL */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up text-left">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-600 to-violetAccent-500 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-extrabold text-base flex items-center space-x-1.5">
                  <Download className="w-4 h-4 text-brand-100" />
                  <span>Export Resume File</span>
                </h3>
                <p className="text-[10px] text-brand-100 mt-0.5">Select your preferred high-resolution format.</p>
              </div>
              <button
                onClick={() => setDownloadModalOpen(false)}
                className="text-white/80 hover:text-white text-xl font-bold bg-white/10 w-7 h-7 rounded-full flex items-center justify-center focus:outline-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            {downloading ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h4 className="font-semibold text-sm dark:text-white">Generating Print Vector Layouts...</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Converting {cvName || 'Resume'} into standardized {downloadFormat?.toUpperCase()} format.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Both formats are fully optimized for recruiter review, standard paper sizes, and automated resume analyzers (ATS-friendly).
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* PDF option */}
                  <button
                    onClick={() => triggerDownload('pdf')}
                    className="p-4 border border-gray-200 dark:border-darkBorder rounded-2xl hover:border-brand-500 hover:bg-brand-50/15 dark:hover:bg-darkCard/40 transition-all flex flex-col items-center justify-center space-y-2 text-center bg-white dark:bg-darkCard"
                  >
                    <FileText className="w-7 h-7 text-brand-500" />
                    <div className="space-y-0.5">
                      <strong className="text-xs text-gray-800 dark:text-gray-200 block">Save as PDF</strong>
                      <span className="text-[8px] text-gray-400">Standard Vector Print</span>
                    </div>
                  </button>

                  {/* PNG option */}
                  <button
                    onClick={() => triggerDownload('png')}
                    className="p-4 border border-gray-200 dark:border-darkBorder rounded-2xl hover:border-brand-500 hover:bg-brand-50/15 dark:hover:bg-darkCard/40 transition-all flex flex-col items-center justify-center space-y-2 text-center bg-white dark:bg-darkCard"
                  >
                    <Image className="w-7 h-7 text-brand-500" />
                    <div className="space-y-0.5">
                      <strong className="text-xs text-gray-800 dark:text-gray-200 block">Save as Image</strong>
                      <span className="text-[8px] text-gray-400">High-Res PNG</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      {/* PREMIUM UPGRADE MODAL */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up text-left">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-600 to-violetAccent-500 p-6 text-white relative">
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="text-white/80 hover:text-white text-xl font-bold bg-white/10 w-8 h-8 rounded-full flex items-center justify-center focus:outline-none"
                >
                  &times;
                </button>
              </div>
              <div className="flex items-center space-x-2.5">
                <Star className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                <h3 className="font-display font-extrabold text-lg">Upgrade to Premium</h3>
              </div>
              <p className="text-xs text-brand-100 mt-1">Unlock unlimited access to all AI features and resume templates.</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="p-4 bg-violetAccent-50/50 dark:bg-violetAccent-950/15 border border-violetAccent-100 dark:border-violetAccent-900/30 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-violetAccent-600 dark:text-violetAccent-400 uppercase tracking-wider">Premium Lifetime Access</span>
                  <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">₹99 only</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Get lifetime access to the AI Resume Analyzer, Interactive Chat Coach, and all premium PDF Resume Builder templates.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-300">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited AI Resume Audits & Shortlist Feasibility Scores</span>
                </div>
                <div className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-300">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited Chat Interactions with Gemini Pro Career Coach</span>
                </div>
                <div className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-300">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Full access to all Creative & Tech Resume Layouts</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Secure Payments via Razorpay Checkout</span>
              </div>

              <button
                onClick={handleBuyPremium}
                className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-violetAccent-500 hover:from-brand-700 hover:to-violetAccent-600 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buy Premium Now (Pay ₹99)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
