import { db } from './db.js';

const mockJobs = [
  {
    title: "Software Engineering Intern (Frontend)",
    company: "Google",
    logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200&auto=format&fit=crop&q=60",
    location: "Bangalore, India",
    type: "Hybrid",
    duration: "6 Months",
    stipend: "₹85,000 / month",
    skillsRequired: ["React.js", "JavaScript", "TypeScript", "HTML/CSS", "Data Structures"],
    description: "Google's software engineers develop the next-generation technologies that change how billions of users connect, explore, and interact with information. As an engineering intern, you will work on core projects critical to Google's needs and collaborate closely with seasoned developers.",
    requirements: [
      "Currently pursuing a Bachelor's, Master's, or PhD in Computer Science or a related technical field.",
      "Experience with JavaScript/TypeScript and front-end framework libraries, preferably React.",
      "Solid knowledge of basic data structures and algorithmic problem solving."
    ],
    responsibilities: [
      "Write clean, maintainable, and well-tested code for front-end web client services.",
      "Collaborate with UX/UI designers and product managers to prototype new user-facing features.",
      "Participate in design reviews and code reviews to improve product quality."
    ],
    deadline: "2026-06-30",
    status: "Approved",
    postedBy: "recruiter-1",
    isFeatured: true
  },
  {
    title: "UI/UX Design Intern",
    company: "Figma",
    logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=60",
    location: "Remote",
    type: "Remote",
    duration: "3 Months",
    stipend: "$3,000 / month",
    skillsRequired: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"],
    description: "Join Figma's design team to shape the future of collaborative design tools. You'll work closely with senior designers, engineers, and product managers to research user behaviors, define user flows, and construct pixel-perfect designs.",
    requirements: [
      "Pursuing a degree in Design, HCI, Cognitive Science, or equivalent practical experience.",
      "Strong portfolio demonstrating process, typography, visual design, and user-centered focus.",
      "Familiarity with collaborative design paradigms."
    ],
    responsibilities: [
      "Create wireframes, user flows, mockups, and interactive prototypes.",
      "Assist in conducting user research interviews and synthesizing feedback.",
      "Contribute assets and definitions to our central design system."
    ],
    deadline: "2026-06-25",
    status: "Approved",
    postedBy: "recruiter-2",
    isFeatured: true
  },
  {
    title: "Backend Engineering Intern",
    company: "Stripe",
    logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&auto=format&fit=crop&q=60",
    location: "San Francisco, USA",
    type: "Hybrid",
    duration: "6 Months",
    stipend: "$5,500 / month",
    skillsRequired: ["Node.js", "Express", "REST APIs", "SQL", "Redis"],
    description: "Stripe builds the economic infrastructure for the internet. As a backend intern, you will help design, build, and maintain the server-side API systems that process billions of dollars in global digital transactions daily.",
    requirements: [
      "Enrolled in a Computer Science or related engineering degree program.",
      "Experience building backend services in Node.js, Ruby, Python, or Go.",
      "Strong understanding of relational databases and system modularity."
    ],
    responsibilities: [
      "Develop high-performance, robust API endpoints for our merchant dashboard.",
      "Optimize database queries and storage structures for scalability.",
      "Write unit tests and integration tests to ensure 99.99% system availability."
    ],
    deadline: "2026-07-15",
    status: "Approved",
    postedBy: "recruiter-3",
    isFeatured: true
  },
  {
    title: "Data Science & AI Intern",
    company: "Meta",
    logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&auto=format&fit=crop&q=60",
    location: "London, UK",
    type: "On-site",
    duration: "4 Months",
    stipend: "£3,800 / month",
    skillsRequired: ["Python", "SQL", "Pandas", "Scikit-Learn", "Machine Learning"],
    description: "Meta is looking for Data Scientist Interns to help turn data into insights and direct decisions. You will work on some of the largest data ecosystems in the world to help identify user trends, improve recommendations, and run complex analyses.",
    requirements: [
      "Currently in a Master's or PhD program in Data Science, Statistics, Mathematics, or similar quantitative field.",
      "Highly proficient in Python and structured database queries (SQL).",
      "Familiar with standard statistical models, testing frameworks, and ML regression algorithms."
    ],
    responsibilities: [
      "Analyze behavioral metrics to recommend features for Instagram and Facebook.",
      "Construct robust dashboards tracking core service KPIs.",
      "Perform A/B testing and statistical analysis to validate feature launches."
    ],
    deadline: "2026-06-20",
    status: "Approved",
    postedBy: "recruiter-1",
    isFeatured: false
  },
  {
    title: "Full-Stack Web Intern",
    company: "Vercel",
    logo: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=200&auto=format&fit=crop&q=60",
    location: "Remote",
    type: "Remote",
    duration: "6 Months",
    stipend: "$4,500 / month",
    skillsRequired: ["Next.js", "React.js", "Tailwind CSS", "TypeScript", "Node.js"],
    description: "Vercel provides the developer platform to deploy web applications. Work as a Full-Stack developer intern directly on our developer portal dashboard, integrating rich client components and scalable serverless routes.",
    requirements: [
      "Proficient in React, TypeScript, and modern styling architectures.",
      "Personal projects demonstrating knowledge of Next.js server actions and API routing.",
      "Passionate about developer experience and clean code."
    ],
    responsibilities: [
      "Build dynamic interface pages that load with extreme speed.",
      "Connect client pages to telemetry and backend endpoints.",
      "Participate in resolving developer issues on GitHub."
    ],
    deadline: "2026-07-10",
    status: "Approved",
    postedBy: "recruiter-2",
    isFeatured: true
  },
  {
    title: "Product Management Intern",
    company: "Stripe",
    logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&auto=format&fit=crop&q=60",
    location: "Remote",
    type: "Remote",
    duration: "3 Months",
    stipend: "$4,000 / month",
    skillsRequired: ["Product Strategy", "User Interviews", "Market Analysis", "Agile Roadmap"],
    description: "As a Product Management Intern, you will work at the intersection of design, engineering, and business. Help Stripe understand user pain points, define product roadmaps, and ship crucial features that ease digital payments.",
    requirements: [
      "Pursuing an MBA or equivalent business/technical hybrid degree.",
      "Prior tech experience (e.g. software engineer, analyst) is highly valued.",
      "Excellent communication and collaboration skills."
    ],
    responsibilities: [
      "Conduct customer feedback sessions to collect feature requests.",
      "Write detailed PRDs (Product Requirement Documents) for the developers.",
      "Coordinate with marketing on product launch playbooks."
    ],
    deadline: "2026-06-28",
    status: "Approved",
    postedBy: "recruiter-3",
    isFeatured: false
  },
  {
    title: "Mobile App Developer (React Native)",
    company: "Airbnb",
    logo: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&auto=format&fit=crop&q=60",
    location: "Mumbai, India",
    type: "Hybrid",
    duration: "6 Months",
    stipend: "₹50,000 / month",
    skillsRequired: ["React Native", "JavaScript", "iOS/Android", "Redux Toolkit"],
    description: "Airbnb is looking for a mobile app developer intern to join our core mobile engineering group. You will help build seamless travel experiences on both iOS and Android platforms.",
    requirements: [
      "Enrolled in Computer Engineering or related streams.",
      "Hands-on experience building mobile apps, preferably using React Native.",
      "Familiarity with native device APIs, push notifications, and App store guidelines."
    ],
    responsibilities: [
      "Implement beautiful mobile transitions and reusable mobile elements.",
      "Optimize local storage and caching profiles on user handsets.",
      "Integrate mapping APIs and geolocation features."
    ],
    deadline: "2026-06-18",
    status: "Approved",
    postedBy: "recruiter-1",
    isFeatured: false
  },
  {
    title: "Cloud Support Associate",
    company: "Amazon Web Services (AWS)",
    logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=200&auto=format&fit=crop&q=60",
    location: "Pune, India",
    type: "On-site",
    duration: "6 Months",
    stipend: "₹45,000 / month",
    skillsRequired: ["Linux", "Networking", "AWS", "Bash Scripting", "Troubleshooting"],
    description: "AWS cloud is growing exponentially. Work in our Enterprise support desk helping cloud architects build robust networks, troubleshoot container deployment failures, and monitor cloud computing metrics.",
    requirements: [
      "Degree in IT, Systems Engineering, or Networking.",
      "Basic understanding of Linux system commands and HTTP configurations.",
      "AWS Cloud Practitioner certification is a huge plus."
    ],
    responsibilities: [
      "Review client configurations and analyze resource monitoring logs.",
      "Automate repetitive diagnosis steps using Bash or Python scripts.",
      "Contribute explanations to standard operating procedure databases."
    ],
    deadline: "2026-07-22",
    status: "Pending",
    postedBy: "recruiter-4",
    isFeatured: false
  }
];

export const seedDB = async () => {
  try {
    const existingJobs = await db.jobs.find();
    if (existingJobs.length === 0) {
      console.log('🌱 Database is empty. Seeding mock jobs...');
      for (const job of mockJobs) {
        await db.jobs.create(job);
      }
      console.log(`✅ Seeded ${mockJobs.length} mock jobs successfully!`);
    } else {
      console.log('Database already has data. Skipping seeder.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};
