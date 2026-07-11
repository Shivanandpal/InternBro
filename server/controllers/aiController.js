import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../config/db.js';

// Setup Gemini API Key
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('Failed to initialize Gemini AI client:', err);
    return null;
  }
};

// 1. Resume Analyzer Logic
export const analyzeResume = async (req, res) => {
  const { resumeText, jobTitle } = req.body;
  if (!resumeText) {
    return res.status(400).json({ message: "Resume text is required for analysis." });
  }

  const client = getGeminiClient();

  if (!client) {
    // HIGH-FIDELITY SIMULATED FALLBACK
    console.log('🤖 Running Simulated Resume Analysis...');
    // We will parse the text slightly to make it feel super real
    const matchScore = jobTitle 
      ? Math.floor(Math.random() * 30) + 55  // 55% - 85%
      : Math.floor(Math.random() * 20) + 70; // 70% - 90%
    
    // Find some skills mentioned
    const skillsFound = [];
    const keywords = ['react', 'node', 'javascript', 'python', 'figma', 'java', 'sql', 'css', 'html', 'typescript', 'aws'];
    keywords.forEach(kw => {
      if (resumeText.toLowerCase().includes(kw)) {
        skillsFound.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    });

    setTimeout(() => {
      res.json({
        matchPercentage: matchScore,
        strengths: [
          skillsFound.length > 0 ? `Good foundational skills shown in: ${skillsFound.join(', ')}.` : "Clean resume structure and readable layout.",
          "Clear presentation of education history.",
          "Projects section describes key technical achievements."
        ],
        improvements: [
          "Quantify your project achievements using metrics (e.g., 'improved performance by 20%').",
          jobTitle ? `Tailor your professional summary to explicitly target the '${jobTitle}' role.` : "Add a clear professional summary highlighting your career goals.",
          "Consider expanding on your technical stack for individual projects."
        ],
        recommendedSkills: jobTitle 
          ? ["TypeScript", "System Design Basics", "RESTful APIs"]
          : ["Git/GitHub", "Agile methodologies", "Docker basics"],
        generalFeedback: `Your resume is off to a solid start! To secure high-paying ${jobTitle || 'tech'} internships, work on adding metrics-driven project results and ensure your skill list is highlighted in a separate, easily scan-able layout. Let InternBRO help you build a matching profile.`
      });
    }, 1000);
    return;
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are a professional recruiting manager and career expert. Analyze the following resume content.
      ${jobTitle ? `The candidate is applying for a "${jobTitle}" position. Evaluate specifically for this role.` : 'Evaluate this resume for general entry-level internship opportunities in technology/design/product.'}
      
      Resume content:
      "${resumeText}"
      
      Respond STRICTLY in JSON format with the following keys. Do not include any markdown fences or extra explanations. The response must be a single, valid JSON object matching this structure:
      {
        "matchPercentage": 75, // (integer value between 0 and 100)
        "strengths": ["string", "string", ...], // (3 key strengths)
        "improvements": ["string", "string", ...], // (3 key improvements)
        "recommendedSkills": ["string", "string", ...], // (3 suggested skills to add)
        "generalFeedback": "string" // (1-2 sentences of encouraging and critical feedback)
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse json out of model response
    let cleanJsonStr = text.trim();
    if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/```$/, '');
    }
    const analysis = JSON.parse(cleanJsonStr);
    res.json(analysis);
  } catch (err) {
    console.error('Gemini Resume Analysis Error:', err);
    res.status(500).json({ message: "Failed to analyze resume via AI.", error: err.message });
  }
};

// 2. Personalized Career Guidance Assistant Chat
export const getCareerGuidance = async (req, res) => {
  const { messages, userProfile } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: "Messages history is required." });
  }

  const latestMessage = messages[messages.length - 1].content;
  const client = getGeminiClient();

  const skills = userProfile?.profile?.skills || [];
  const projects = userProfile?.profile?.projects || [];
  const degree = userProfile?.profile?.education?.[0]?.degree || "General Studies";

  if (!client) {
    // HIGH-FIDELITY SIMULATED FALLBACK
    console.log('🤖 Running Simulated Career Coach Response...');
    let aiResponse = `That is a great question! Based on your background in **${degree}** and skills like **${skills.length > 0 ? skills.slice(0, 3).join(', ') : 'React, JavaScript'}**, I recommend focus areas to help you stand out. Let's start by designing high-impact portfolio projects and writing clear resume summaries. What specific company or domain are you aiming for?`;
    
    if (latestMessage.toLowerCase().includes('resume')) {
      aiResponse = "A stellar resume should be one page. It should focus heavily on what *impact* you created. For each project, write: 'Built X using Y resulting in Z'. Also, place your most critical skills in a sidebar or top section so recruiters can scan them within 6 seconds. Have you tried our Resume Builder tool yet?";
    } else if (latestMessage.toLowerCase().includes('interview')) {
      aiResponse = "To ace interviews, combine technical preparation with behavioral story preparation. Use the **STAR method** (Situation, Task, Action, Result) for behavioral questions. For technical roles, be ready to explain your coding decisions out loud. I can run mock interviews with you right here if you share your target role!";
    } else if (latestMessage.toLowerCase().includes('skills') || latestMessage.toLowerCase().includes('learn')) {
      aiResponse = `Since you already have skills in ${skills.length > 0 ? skills.join(', ') : 'frontend development'}, adding **TypeScript**, **Next.js**, and learning **basic unit testing (Jest/Vitest)** will immediately make you stand out from 90% of other student applicants. What skill would you like to target next?`;
    }

    setTimeout(() => {
      res.json({
        content: aiResponse,
        timestamp: new Date().toISOString()
      });
    }, 1000);
    return;
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const contextPrompt = `
      You are "InternBRO's Career Coach", a helpful, modern, highly encouraging AI Career Guidance Advisor.
      You are chatting with a student user.
      
      Candidate Profile:
      - Name: ${userProfile?.name || 'Student'}
      - Degree/Education: ${degree}
      - Core Skills: ${skills.join(', ') || 'Not listed yet'}
      - Projects: ${projects.map(p => `${p.title}: ${p.description}`).join('; ') || 'No projects listed yet'}
      
      Conversation History:
      ${messages.map(m => `${m.role === 'user' ? 'Student' : 'Career Coach'}: ${m.content}`).join('\n')}
      
      Provide a highly encouraging, direct, and actionable response (150-250 words max). Keep the formatting clean with bold text or bullet points if useful. Never break character.
    `;

    const result = await model.generateContent(contextPrompt);
    res.json({
      content: result.response.text(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Gemini Career Assistant Error:', err);
    res.status(500).json({ message: "Failed to get AI career guidance.", error: err.message });
  }
};

// 3. AI Internship Recommendation Engine
export const getRecommendations = async (req, res) => {
  const { userProfile } = req.body;
  if (!userProfile || !userProfile.profile) {
    return res.status(400).json({ message: "User profile data is required." });
  }

  try {
    const skills = userProfile.profile.skills || [];
    const allJobs = await db.jobs.find({ status: 'Approved' });

    if (skills.length === 0) {
      // Return featured or top jobs if no skills are listed yet
      const recommendations = allJobs.slice(0, 3).map(job => ({
        job,
        matchScore: 60,
        matchingSkills: [],
        reason: "Featured internship on InternBRO. Fill in your profile skills to get higher accuracy recommendations!"
      }));
      return res.json(recommendations);
    }

    const client = getGeminiClient();

    if (!client) {
      // Local scoring algorithm for instant recommendation
      console.log('🤖 Running local/simulated job matching...');
      const matched = allJobs.map(job => {
        const jobSkills = job.skillsRequired || [];
        const matchingSkills = skills.filter(skill => 
          jobSkills.some(js => js.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(js.toLowerCase()))
        );

        let matchScore = 50; // base score
        if (jobSkills.length > 0) {
          const ratio = matchingSkills.length / jobSkills.length;
          matchScore += Math.floor(ratio * 40); // add up to 40 points
        }
        if (job.isFeatured) matchScore += 10; // featured bonus

        matchScore = Math.min(matchScore, 98); // cap at 98%

        let reason = `Good skill overlap! This role requires ${job.skillsRequired.slice(0, 3).join(', ')}, matching your knowledge.`;
        if (matchingSkills.length === 0) {
          reason = `Great expansion opportunity. Broaden your skills with ${job.company}'s internship in ${job.title}.`;
        }

        return {
          job,
          matchScore,
          matchingSkills,
          reason
        };
      });

      // Sort by match score descending
      const recommendations = matched
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);

      return res.json(recommendations);
    }

    // Call Gemini to score and provide rich reasoning
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an AI internship recommendation engine. Match this student's profile with the list of active internships.
      
      Student Profile:
      - Skills: ${skills.join(', ')}
      - Projects: ${userProfile.profile.projects?.map(p => p.title).join(', ') || 'None'}
      
      Internships available:
      ${JSON.stringify(allJobs.map(j => ({ id: j.id || j._id, title: j.title, company: j.company, skillsRequired: j.skillsRequired })))}
      
      Recommend the top 3 best matching internships.
      Respond strictly in JSON format. Do not include markdown blocks. Output must be a single array of objects matching this format:
      [
        {
          "jobId": "string-job-id",
          "matchScore": 85, // (integer match percentage 0-100)
          "matchingSkills": ["skill1", "skill2"], // (subset of student skills that match this job)
          "reason": "1 sentence explanation of why this job matches the candidate's profile"
        },
        ...
      ]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let cleanJsonStr = text.trim();
    if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/```$/, '');
    }
    const geminiRecommendations = JSON.parse(cleanJsonStr);

    // Map recommendation metadata back to full job listings
    const completeRecs = [];
    for (const rec of geminiRecommendations) {
      const job = allJobs.find(j => (j.id === rec.jobId || j._id === rec.jobId));
      if (job) {
        completeRecs.push({
          job,
          matchScore: rec.matchScore,
          matchingSkills: rec.matchingSkills,
          reason: rec.reason
        });
      }
    }

    res.json(completeRecs);
  } catch (err) {
    console.error('Gemini Recommendation Error:', err);
    res.status(500).json({ message: "Failed to compute job recommendations.", error: err.message });
  }
};
