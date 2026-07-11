import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, db } from './config/db.js';
import { seedDB } from './config/seeder.js';
import { analyzeResume, getCareerGuidance, getRecommendations } from './controllers/aiController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize database connection
await connectDB();
await seedDB();

// ----------------------------------------------------
// JOB ROUTING (/api/jobs)
// ----------------------------------------------------

// Get all jobs (with query / filters)
app.get('/api/jobs', async (req, res) => {
  try {
    const { status, type, search, postedBy } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (postedBy) query.postedBy = postedBy;

    let jobs = await db.jobs.find(query);

    // Dynamic text filtering
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.skillsRequired.some(s => s.toLowerCase().includes(q))
      );
    }

    if (type) {
      jobs = jobs.filter(job => job.type === type);
    }

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching jobs", error: err.message });
  }
});

// Get single job details
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await db.jobs.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Increment views safely
    const currentViews = job.views || 0;
    await db.jobs.findByIdAndUpdate(req.params.id, { views: currentViews + 1 });
    job.views = currentViews + 1;

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Error fetching job", error: err.message });
  }
});

// Create new internship posting
app.post('/api/jobs', async (req, res) => {
  try {
    const jobData = req.body;
    if (!jobData.title || !jobData.company || !jobData.postedBy) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    // Auto-approve postings for instant student discovery feed updates
    const newJob = await db.jobs.create({
      ...jobData,
      status: 'Approved'
    });
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ message: "Error posting internship", error: err.message });
  }
});

// Update internship details (shortlisting or admin approval)
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const updated = await db.jobs.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Job not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating job details", error: err.message });
  }
});

// Delete job listing
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const deleted = await db.jobs.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting job", error: err.message });
  }
});


// ----------------------------------------------------
// APPLICATION ROUTING (/api/applications)
// ----------------------------------------------------

// Get applications based on filters
app.get('/api/applications', async (req, res) => {
  try {
    const { studentId, jobId, recruiterId } = req.query;
    let query = {};
    
    if (studentId) query.studentId = studentId;
    if (jobId) query.jobId = jobId;

    let applications = await db.applications.find(query);

    // Attach full job metadata to each application for dashboards
    let enrichedApps = [];
    for (const app of applications) {
      let job = await db.jobs.findById(app.jobId);
      if (!job) {
        try {
          const pyRes = await fetch(`http://localhost:8000/internships/${app.jobId}`);
          if (pyRes.ok) {
            const pyJob = await pyRes.json();
            job = {
              id: pyJob.id,
              _id: pyJob.id,
              title: pyJob.title,
              company: pyJob.company,
              location: pyJob.location,
              stipend: pyJob.stipend,
              duration: pyJob.duration,
              description: pyJob.description,
              skillsRequired: pyJob.skills ? pyJob.skills.split(',').map(s => s.trim()) : [],
              postedBy: pyJob.recruiter_id,
              status: pyJob.status
            };
          }
        } catch (err) {
          console.warn(`Could not fetch job metadata from Python API for jobId: ${app.jobId}`, err.message);
        }
      }
      enrichedApps.push({
        ...app,
        jobDetails: job || null
      });
    }

    // If filtered by recruiter, check recruiterId, jobDetails.postedBy, or jobDetails.recruiter_id
    if (recruiterId) {
      enrichedApps = enrichedApps.filter(app => 
        app.recruiterId === recruiterId || 
        (app.jobDetails && (app.jobDetails.postedBy === recruiterId || app.jobDetails.recruiter_id === recruiterId))
      );
    }

    res.json(enrichedApps);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving applications", error: err.message });
  }
});

// Submit a job application
app.post('/api/applications', async (req, res) => {
  try {
    const { jobId, studentId, studentName, studentEmail, resumeUrl, skills, recruiterId } = req.body;
    if (!jobId || !studentId) {
      return res.status(400).json({ message: "Job ID and Student ID are required." });
    }

    // Check for duplicate application
    const existing = await db.applications.find({ jobId, studentId });
    if (existing.length > 0) {
      return res.status(400).json({ message: "You have already applied to this internship." });
    }

    const appCreated = await db.applications.create({
      jobId,
      studentId,
      studentName,
      studentEmail,
      resumeUrl,
      skills: skills || [],
      status: 'Applied',
      recruiterId: recruiterId || ''
    });

    res.status(201).json(appCreated);
  } catch (err) {
    res.status(500).json({ message: "Error submitting application", error: err.message });
  }
});

// Shortlist/Reject applicants
app.put('/api/applications/:id', async (req, res) => {
  try {
    const { status } = req.body; // 'Shortlisted', 'Rejected', etc.
    const updated = await db.applications.findByIdAndUpdate(req.params.id, { status });
    if (!updated) return res.status(404).json({ message: "Application not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating application status", error: err.message });
  }
});


// ----------------------------------------------------
// USER PROFILE ROUTING (/api/users)
// ----------------------------------------------------

// Register a new user with full details
app.post('/api/users/register', async (req, res) => {
  try {
    const { uid, email, name, role, profileData } = req.body;
    if (!uid || !email || !name || !role) {
      return res.status(400).json({ message: "Missing uid, email, name, or role." });
    }

    const existing = await db.users.findOne({ uid });
    if (existing) {
      return res.status(400).json({ message: "User account already exists." });
    }

    const newUser = await db.users.create({
      uid,
      email,
      name,
      role,
      profile: profileData || {}
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: "Error registering user profile", error: err.message });
  }
});

// Get all user profiles
app.get('/api/users', async (req, res) => {
  try {
    const list = await db.users.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error getting all user profiles", error: err.message });
  }
});

// Get user profile
app.get('/api/users/:uid', async (req, res) => {
  try {
    let user = await db.users.findOne({ uid: req.params.uid });
    if (!user) {
      // Fallback create basic user if profile doesn't exist yet (auto registration)
      user = await db.users.create({
        uid: req.params.uid,
        email: req.query.email || '',
        name: req.query.name || 'User',
        role: req.query.role || 'student'
      });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error getting user profile", error: err.message });
  }
});

// Update profile details (skills, projects, company bio, etc.)
app.put('/api/users/:uid', async (req, res) => {
  try {
    const updated = await db.users.findOneAndUpdate({ uid: req.params.uid }, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating user profile", error: err.message });
  }
});


// ----------------------------------------------------
// COMMUNITY DISCUSSION FORUM (/api/discussions)
// ----------------------------------------------------

// Get discussion list
app.get('/api/discussions', async (req, res) => {
  try {
    const { channel } = req.query;
    const query = channel ? { channel } : {};
    const list = await db.discussions.find(query);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving discussions", error: err.message });
  }
});

// Post discussion
app.post('/api/discussions', async (req, res) => {
  try {
    const { channel, title, content, author } = req.body;
    if (!title || !content || !author) {
      return res.status(400).json({ message: "Missing title, content, or author." });
    }
    const newDisc = await db.discussions.create({ channel: channel || 'General', title, content, author });
    res.status(201).json(newDisc);
  } catch (err) {
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
});

// Reply to discussion
app.post('/api/discussions/:id/replies', async (req, res) => {
  try {
    const { author, content } = req.body;
    if (!author || !content) {
      return res.status(400).json({ message: "Author and content are required." });
    }
    const disc = await db.discussions.find({ id: req.params.id });
    const realDisc = disc[0] || (await db.discussions.find({ _id: req.params.id }))[0];
    
    if (!realDisc) return res.status(404).json({ message: "Discussion thread not found" });

    const replies = realDisc.replies || [];
    replies.push({
      author,
      content,
      date: new Date().toISOString()
    });

    const idToUpdate = realDisc.id || realDisc._id;
    const updated = await db.discussions.findByIdAndUpdate(idToUpdate, { replies });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error posting reply", error: err.message });
  }
});


// ----------------------------------------------------
// CAREER BLOG ROUTING (/api/blogs)
// ----------------------------------------------------
app.get('/api/blogs', async (req, res) => {
  try {
    const list = await db.blogs.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error getting blogs", error: err.message });
  }
});


// ----------------------------------------------------
// PLATFORM ANALYTICS ROUTING (/api/analytics)
// ----------------------------------------------------
app.get('/api/analytics', async (req, res) => {
  try {
    const allJobs = await db.jobs.find();
    const approvedJobs = allJobs.filter(j => j.status === 'Approved');
    const pendingJobs = allJobs.filter(j => j.status === 'Pending');
    const allApps = await db.applications.find();
    
    // Simulating user totals based on our data size + some active counts for display
    const studentsCount = 342;
    const recruitersCount = 48;
    const totalApplications = allApps.length + 152; // active tracker representation

    res.json({
      activeInternships: approvedJobs.length,
      pendingApproval: pendingJobs.length,
      totalStudents: studentsCount,
      totalRecruiters: recruitersCount,
      totalApplications: totalApplications,
      featuredInternships: approvedJobs.filter(j => j.isFeatured).length,
      // Aggregates for charting
      byCategory: {
        Engineering: approvedJobs.filter(j => j.title.toLowerCase().includes('engineer') || j.title.toLowerCase().includes('stack') || j.title.toLowerCase().includes('backend') || j.title.toLowerCase().includes('frontend')).length,
        Design: approvedJobs.filter(j => j.title.toLowerCase().includes('design') || j.title.toLowerCase().includes('ui') || j.title.toLowerCase().includes('ux')).length,
        Product: approvedJobs.filter(j => j.title.toLowerCase().includes('product') || j.title.toLowerCase().includes('manager')).length,
        Others: approvedJobs.filter(j => !j.title.toLowerCase().includes('engineer') && !j.title.toLowerCase().includes('stack') && !j.title.toLowerCase().includes('design') && !j.title.toLowerCase().includes('product') && !j.title.toLowerCase().includes('backend') && !j.title.toLowerCase().includes('frontend')).length
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating analytics summaries", error: err.message });
  }
});


// ----------------------------------------------------
// AI ROUTES (Gemini Integrations)
// ----------------------------------------------------
app.post('/api/ai/analyze-resume', analyzeResume);
app.post('/api/ai/career-guidance', getCareerGuidance);
app.post('/api/ai/recommendations', getRecommendations);


// Start server listener
app.listen(PORT, () => {
  console.log(`🚀 InternBRO Backend running at http://localhost:${PORT}`);
});
