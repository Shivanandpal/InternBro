import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, '../db.json');

// Mongoose Schemas (used if MongoDB is active)
const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  logo: String,
  location: String,
  type: String, // 'Remote', 'On-site', 'Hybrid'
  duration: String,
  stipend: String,
  skillsRequired: [String],
  description: String,
  requirements: [String],
  responsibilities: [String],
  deadline: String,
  status: { type: String, default: 'Pending' }, // 'Pending', 'Approved', 'Rejected'
  postedBy: String, // Recruiter ID
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  applicationsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  uid: String, // auth ID (local or firebase)
  email: String,
  role: String, // 'student', 'recruiter', 'admin'
  name: String,
  profile: {
    title: String,
    skills: [String],
    education: [{ school: String, degree: String, year: String }],
    projects: [{ title: String, description: String, link: String }],
    experience: [{ company: String, role: String, duration: String }],
    resumeUrl: String,
    bio: String,
    avatar: String,
    phone: String,
    savedJobs: [String], // Array of Job IDs
    certificates: [{ testName: String, score: String, date: String }],
    // Extended real-time student attributes
    dob: String,
    collegeId: String,
    branch: String,
    graduationYear: String,
    experienceText: String,
    mobile_no: String,
    collegeName: String,
    currentYear: String
  },
  company: {
    name: String,
    logo: String,
    website: String,
    industry: String,
    size: String,
    bio: String
  },
  createdAt: { type: Date, default: Date.now }
});

const ApplicationSchema = new mongoose.Schema({
  jobId: String,
  studentId: String,
  studentName: String,
  studentEmail: String,
  resumeUrl: String,
  skills: [String],
  status: { type: String, default: 'Applied' }, // 'Applied', 'Shortlisted', 'Rejected'
  appliedAt: { type: Date, default: Date.now }
});

const DiscussionSchema = new mongoose.Schema({
  channel: String, // 'Engineering', 'Design', 'General'
  title: String,
  content: String,
  author: String,
  replies: [{ author: String, content: String, date: Date }],
  createdAt: { type: Date, default: Date.now }
});

const BlogSchema = new mongoose.Schema({
  title: String,
  category: String,
  content: String,
  author: String,
  readTime: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

// Models mapping
let JobModel, UserModel, ApplicationModel, DiscussionModel, BlogModel;
let useMongoDB = false;

// Initial local DB structure
const initialLocalDB = {
  jobs: [],
  users: [],
  applications: [],
  discussions: [
    {
      id: "disc-1",
      channel: "Engineering",
      title: "How to prepare for Frontend React internships?",
      content: "Hi all! I am looking for tips on what topics recruiters ask in frontend developer internships. Should I focus on Redux or custom React hooks?",
      author: "Raj Sharma",
      replies: [
        { author: "Amit Verma", content: "Focus heavily on JavaScript fundamentals (closures, event loop) and React hooks like useEffect and custom hooks!", date: new Date() }
      ],
      createdAt: new Date()
    },
    {
      id: "disc-2",
      channel: "General",
      title: "Tell me about InternBRO referral program",
      content: "Does InternBRO have a referral system? How does it benefit us?",
      author: "Sneha Patel",
      replies: [
        { author: "Admin", content: "Yes! You can invite your college mates using your referral code in the student dashboard and earn premium career resources!", date: new Date() }
      ],
      createdAt: new Date()
    }
  ],
  blogs: [
    {
      id: "blog-1",
      title: "10 Resume Tips to Ace Your First Tech Internship",
      category: "Resume Tips",
      content: "Your resume is your ticket to the first round of interviews. Here are 10 core checklist tips including listing projects with direct links, using action words, and tailoring skills to the job description...",
      author: "Meera Nair",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=60",
      createdAt: new Date()
    },
    {
      id: "blog-2",
      title: "Mastering the Technical Interview: A Complete Prep Guide",
      category: "Interview Prep",
      content: "Technical interviews can be daunting. Start by brushing up on core DSA concepts (Arrays, Strings, HashMaps, Trees). Practice mock interview talking points, and always explain your code out loud...",
      author: "Karan Johar",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60",
      createdAt: new Date()
    }
  ]
};

// Local JSON file DB helper
const readLocalDB = () => {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialLocalDB, null, 2));
      return initialLocalDB;
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON DB:', err);
    return initialLocalDB;
  }
};

const writeLocalDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local JSON DB:', err);
  }
};

// Connect database
export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    try {
      await mongoose.connect(mongoURI);
      console.log('✅ Connected to MongoDB via Mongoose!');
      useMongoDB = true;
      JobModel = mongoose.model('Job', JobSchema);
      UserModel = mongoose.model('User', UserSchema);
      ApplicationModel = mongoose.model('Application', ApplicationSchema);
      DiscussionModel = mongoose.model('Discussion', DiscussionSchema);
      BlogModel = mongoose.model('Blog', BlogSchema);
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed. Falling back to local JSON database.');
    }
  }

  // Fallback Setup
  console.log('💻 Using High-Fidelity Local JSON File Database:', DB_FILE_PATH);
  useMongoDB = false;
  readLocalDB(); // initialize file if not present
};

// DB API Layer (Acts as Unified interface)
export const db = {
  isMock: () => !useMongoDB,

  jobs: {
    find: async (query = {}) => {
      if (useMongoDB) return JobModel.find(query);
      const data = readLocalDB();
      return data.jobs.filter(job => {
        for (let key in query) {
          if (query[key] !== undefined && job[key] !== query[key]) return false;
        }
        return true;
      });
    },
    findById: async (id) => {
      if (useMongoDB) return JobModel.findById(id);
      const data = readLocalDB();
      return data.jobs.find(job => job.id === id || job._id === id) || null;
    },
    create: async (jobData) => {
      if (useMongoDB) {
        const item = new JobModel(jobData);
        return item.save();
      }
      const data = readLocalDB();
      const newJob = {
        id: 'job-' + Date.now() + Math.floor(Math.random() * 1000),
        _id: 'job-' + Date.now() + Math.floor(Math.random() * 1000),
        ...jobData,
        status: jobData.status || 'Pending',
        views: 0,
        applicationsCount: 0,
        createdAt: new Date().toISOString()
      };
      data.jobs.push(newJob);
      writeLocalDB(data);
      return newJob;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) return JobModel.findByIdAndUpdate(id, updateData, { new: true });
      const data = readLocalDB();
      const idx = data.jobs.findIndex(job => job.id === id || job._id === id);
      if (idx === -1) return null;
      data.jobs[idx] = { ...data.jobs[idx], ...updateData };
      writeLocalDB(data);
      return data.jobs[idx];
    },
    findByIdAndDelete: async (id) => {
      if (useMongoDB) return JobModel.findByIdAndDelete(id);
      const data = readLocalDB();
      const initialLength = data.jobs.length;
      data.jobs = data.jobs.filter(job => job.id !== id && job._id !== id);
      writeLocalDB(data);
      return data.jobs.length < initialLength;
    }
  },

  users: {
    findOne: async (query = {}) => {
      if (useMongoDB) return UserModel.findOne(query);
      const data = readLocalDB();
      return data.users.find(user => {
        for (let key in query) {
          if (user[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    create: async (userData) => {
      if (useMongoDB) {
        const item = new UserModel(userData);
        return item.save();
      }
      const data = readLocalDB();
      const newUser = {
        id: 'user-' + Date.now(),
        _id: 'user-' + Date.now(),
        profile: {
          title: '',
          skills: [],
          education: [],
          projects: [],
          experience: [],
          resumeUrl: '',
          bio: '',
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userData.name || 'user'}`,
          phone: '',
          savedJobs: [],
          certificates: [],
          // Extended real-time student attributes
          dob: '',
          collegeId: '',
          branch: '',
          graduationYear: '',
          experienceText: '',
          mobile_no: '',
          collegeName: '',
          currentYear: ''
        },
        company: {
          name: '',
          logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=60',
          website: '',
          industry: '',
          size: '',
          bio: ''
        },
        ...userData,
        createdAt: new Date().toISOString()
      };
      data.users.push(newUser);
      writeLocalDB(data);
      return newUser;
    },
    findOneAndUpdate: async (query, updateData) => {
      if (useMongoDB) return UserModel.findOneAndUpdate(query, updateData, { new: true, upsert: true });
      const data = readLocalDB();
      let user = data.users.find(u => {
        for (let key in query) {
          if (u[key] !== query[key]) return false;
        }
        return true;
      });
      if (!user) {
        user = await db.users.create({ ...query, ...updateData });
        return user;
      }
      const idx = data.users.indexOf(user);
      // Handle nested structures properly
      data.users[idx] = {
        ...data.users[idx],
        ...updateData,
        profile: {
          ...data.users[idx].profile,
          ...(updateData.profile || {})
        },
        company: {
          ...data.users[idx].company,
          ...(updateData.company || {})
        }
      };
      writeLocalDB(data);
      return data.users[idx];
    }
  },

  applications: {
    find: async (query = {}) => {
      if (useMongoDB) return ApplicationModel.find(query);
      const data = readLocalDB();
      return data.applications.filter(app => {
        for (let key in query) {
          if (app[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: async (appData) => {
      if (useMongoDB) {
        const item = new ApplicationModel(appData);
        const saved = await item.save();
        // Update applicationsCount
        await JobModel.findByIdAndUpdate(appData.jobId, { $inc: { applicationsCount: 1 } });
        return saved;
      }
      const data = readLocalDB();
      const newApp = {
        id: 'app-' + Date.now(),
        _id: 'app-' + Date.now(),
        status: 'Applied',
        ...appData,
        appliedAt: new Date().toISOString()
      };
      data.applications.push(newApp);
      
      // Update applicationsCount
      const jobIdx = data.jobs.findIndex(j => j.id === appData.jobId || j._id === appData.jobId);
      if (jobIdx !== -1) {
        data.jobs[jobIdx].applicationsCount = (data.jobs[jobIdx].applicationsCount || 0) + 1;
      }
      
      writeLocalDB(data);
      return newApp;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) return ApplicationModel.findByIdAndUpdate(id, updateData, { new: true });
      const data = readLocalDB();
      const idx = data.applications.findIndex(app => app.id === id || app._id === id);
      if (idx === -1) return null;
      data.applications[idx] = { ...data.applications[idx], ...updateData };
      writeLocalDB(data);
      return data.applications[idx];
    }
  },

  discussions: {
    find: async (query = {}) => {
      if (useMongoDB) return DiscussionModel.find(query).sort({ createdAt: -1 });
      const data = readLocalDB();
      return data.discussions
        .filter(disc => {
          for (let key in query) {
            if (disc[key] !== query[key]) return false;
          }
          return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    create: async (discData) => {
      if (useMongoDB) {
        const item = new DiscussionModel(discData);
        return item.save();
      }
      const data = readLocalDB();
      const newDisc = {
        id: 'disc-' + Date.now(),
        _id: 'disc-' + Date.now(),
        replies: [],
        ...discData,
        createdAt: new Date().toISOString()
      };
      data.discussions.push(newDisc);
      writeLocalDB(data);
      return newDisc;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) return DiscussionModel.findByIdAndUpdate(id, updateData, { new: true });
      const data = readLocalDB();
      const idx = data.discussions.findIndex(disc => disc.id === id || disc._id === id);
      if (idx === -1) return null;
      data.discussions[idx] = { ...data.discussions[idx], ...updateData };
      writeLocalDB(data);
      return data.discussions[idx];
    }
  },

  blogs: {
    find: async (query = {}) => {
      if (useMongoDB) return BlogModel.find(query).sort({ createdAt: -1 });
      const data = readLocalDB();
      return data.blogs
        .filter(blog => {
          for (let key in query) {
            if (blog[key] !== query[key]) return false;
          }
          return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
};
