/**
 * Single source of truth for every piece of content on the site.
 * Edit here — never in JSX.
 */

export const profile = {
  name: "Akshay Kashyap M",
  firstName: "Akshay",
  lastName: "Kashyap",
  roles: ["AI Developer", "Backend Engineer", "LLM Systems Builder"],
  title: "AI Developer @ Alrium",
  location: "Bangalore, India",
  email: "kishanakshu67@gmail.com",
  phone: "+91 9886056948",
  github: "https://github.com/AkshayKashyap18",
  githubHandle: "AkshayKashyap18",
  resume: "/Akshay-Kashyap-Resume.pdf",
  available: true,
  pitch:
    "I build the backend and the intelligence behind it — production FastAPI services, and the LLM systems that make them think.",
  bio: [
    "I'm an AI-focused CS undergraduate who ended up spending most of my time where the model meets the machine: designing backend services that are fast and secure, then wiring real language-model intelligence into them.",
    "At Alrium I ship production Python and FastAPI against Supabase and PostgreSQL — auth, role-based access, query paths that hold up under load — and build the AI layer on top: embeddings, semantic search, and generative workflows using OpenAI and Google models. Outside work I've shipped three of my own AI products, from a mental-health assessment platform to an MCP-based task orchestrator.",
  ],
} as const;

export const metrics = [
  { value: 9.58, suffix: "", label: "CGPA", detail: "B.E. AI & Data Science" },
  { value: 3, suffix: "+", label: "AI products shipped", detail: "End to end, solo" },
  { value: 2025, suffix: "", label: "Joined Alrium", detail: "AI Developer", raw: true },
  { value: 3, suffix: "rd", label: "SIT Hackathon 2025", detail: "Out of a national field" },
] as const;

/* ── Experience ───────────────────────────────────────── */

export type Job = {
  company: string;
  role: string;
  start: string;
  end: string;
  summary: string;
  bullets: string[];
  stack: string[];
};

export const experience: Job[] = [
  {
    company: "Alrium",
    role: "AI Developer",
    start: "Sep 2025",
    end: "Present",
    summary:
      "Building production backend services and the AI systems layered on top of them.",
    bullets: [
      "Developed and maintained scalable backend services with Python, FastAPI, Supabase, PostgreSQL and REST APIs — implementing secure authentication, role-based access control, and optimized database operations for high-performance applications.",
      "Designed and integrated AI-powered systems using Python, PyTorch and Transformer architectures, leveraging OpenAI and Google models for intelligent automation, embeddings, semantic search, and generative AI workflows.",
      "Collaborated with frontend and product teams to translate business requirements into reliable backend solutions with seamless API integration, validation, and robust error handling.",
      "Worked with Dockerized deployments and containerized applications, contributing to API design and system workflow optimization.",
    ],
    stack: ["Python", "FastAPI", "Supabase", "PostgreSQL", "PyTorch", "Docker", "OpenAI API"],
  },
];

/* ── Projects ─────────────────────────────────────────── */

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  hook: string;
  problem: string;
  approach: string;
  outcome: string;
  bullets: string[];
  stack: string[];
  /** Set these once the repo exists — the card renders real buttons automatically. */
  repo?: string;
  demo?: string;
  /** Nodes → edges for the scroll-drawn architecture diagram. */
  architecture: { nodes: { id: string; label: string; x: number; y: number }[]; edges: [string, string][] };
  accent: "violet" | "cyan" | "lime";
};

export const projects: Project[] = [
  {
    slug: "mindmate",
    name: "MindMate",
    tagline: "AI Mental Health Companion",
    hook: "Clinical-grade self-assessment, made approachable by voice and avatar.",
    problem:
      "Standard mental-health screeners like PHQ-9 and GAD-7 are clinically validated but cold — a wall of radio buttons is the worst possible interface for someone already struggling.",
    approach:
      "I built a full-stack platform that runs the real instruments, scores them with a Random Forest model trained on assessment data, then wraps the whole flow in something human: a Botpress chatbot for guided intake, a Vapi voice bot so users can simply talk, and a D-ID avatar giving the responses a face.",
    outcome:
      "A complete assessment-to-guidance loop with authenticated user history via Clerk — the screener stays clinically faithful while the experience stops feeling like a form.",
    bullets: [
      "Full-stack platform for mental health assessments via PHQ-9, GAD-7 and a Random Forest classifier.",
      "Integrated Botpress chatbot, Vapi voice bot, Clerk authentication and D-ID avatar support.",
      "Persisted per-user assessment history with trend tracking over time.",
    ],
    stack: ["React", "Django", "Firebase", "Scikit-learn", "Vapi", "Botpress", "Clerk", "D-ID"],
    architecture: {
      nodes: [
        { id: "user", label: "User", x: 8, y: 50 },
        { id: "voice", label: "Vapi Voice", x: 30, y: 18 },
        { id: "chat", label: "Botpress", x: 30, y: 82 },
        { id: "api", label: "Django API", x: 54, y: 50 },
        { id: "ml", label: "Random Forest", x: 78, y: 22 },
        { id: "db", label: "Firebase", x: 78, y: 78 },
      ],
      edges: [
        ["user", "voice"],
        ["user", "chat"],
        ["voice", "api"],
        ["chat", "api"],
        ["api", "ml"],
        ["api", "db"],
      ],
    },
    accent: "violet",
  },
  {
    slug: "edumorph",
    name: "EduMorph",
    tagline: "Personalized AI Learning System",
    hook: "Drop in a PDF, get back the study material you'd have made yourself — if you had the time.",
    problem:
      "Students drown in dense source material. Turning a 200-page PDF into flashcards and practice questions is exactly the mechanical work that stops people from actually studying.",
    approach:
      "EduMorph ingests a PDF, chunks it, and generates flashcards, quizzes and layered summaries through Groq and OpenAI models. A chatbot tutor answers follow-ups grounded in the uploaded document, and learning-preference settings shape output depth and tone per user.",
    outcome:
      "An upload-to-study-set pipeline that runs in seconds, with a tutor that stays anchored to the user's own material instead of hallucinating around it.",
    bullets: [
      "AI assistant converting PDFs into flashcards, quizzes and multi-level summaries.",
      "Chatbot tutor grounded in the uploaded document, with per-user learning preferences.",
      "Dual-provider inference through Groq for speed and OpenAI for depth.",
    ],
    stack: ["Next.js", "Tailwind CSS", "Firebase", "Groq API", "OpenAI API"],
    architecture: {
      nodes: [
        { id: "pdf", label: "PDF Upload", x: 8, y: 50 },
        { id: "parse", label: "Parse + Chunk", x: 30, y: 50 },
        { id: "llm", label: "Groq / OpenAI", x: 54, y: 26 },
        { id: "tutor", label: "Tutor Chat", x: 54, y: 74 },
        { id: "out", label: "Cards + Quiz", x: 80, y: 26 },
        { id: "store", label: "Firebase", x: 80, y: 74 },
      ],
      edges: [
        ["pdf", "parse"],
        ["parse", "llm"],
        ["parse", "tutor"],
        ["llm", "out"],
        ["tutor", "store"],
        ["llm", "store"],
      ],
    },
    accent: "cyan",
  },
  {
    slug: "mcp-todo",
    name: "MCP Todo",
    tagline: "AI Task Management System",
    hook: "A task manager an agent can actually operate — built on Model Context Protocol.",
    problem:
      "Most 'AI to-do apps' bolt a chat box onto a CRUD app. The model can talk about your tasks but can't reliably act on them, because it has no structured contract with the system.",
    approach:
      "I built the task platform around Model Context Protocol from the start: tasks, context and actions are exposed as MCP primitives, so a model can query state and invoke operations through a typed interface rather than guessing at an API. FastAPI handles the backend, with contextual execution driving the automation workflows.",
    outcome:
      "An orchestration layer where AI-driven workflows are first-class — the agent reads real state and takes real actions, with the protocol enforcing the boundary.",
    bullets: [
      "AI-powered task management built on Model Context Protocol architecture for intelligent workflow orchestration.",
      "Scalable backend APIs for task management, contextual execution and AI-driven automation.",
      "Typed tool surface so model actions are validated rather than free-form.",
    ],
    stack: ["Python", "FastAPI", "MCP", "REST APIs", "Git"],
    architecture: {
      nodes: [
        { id: "agent", label: "AI Agent", x: 8, y: 50 },
        { id: "mcp", label: "MCP Server", x: 32, y: 50 },
        { id: "tools", label: "Tool Registry", x: 56, y: 22 },
        { id: "api", label: "FastAPI", x: 56, y: 78 },
        { id: "ctx", label: "Context Store", x: 82, y: 22 },
        { id: "db", label: "Task DB", x: 82, y: 78 },
      ],
      edges: [
        ["agent", "mcp"],
        ["mcp", "tools"],
        ["mcp", "api"],
        ["tools", "ctx"],
        ["api", "db"],
        ["ctx", "db"],
      ],
    },
    accent: "lime",
  },
];

/* ── Skills ───────────────────────────────────────────── */

export type SkillCategory = { key: string; label: string; items: string[] };

export const skills: SkillCategory[] = [
  { key: "languages", label: "Languages", items: ["Python", "Java", "C", "JavaScript"] },
  { key: "web", label: "Web & Cloud", items: ["React", "FastAPI", "AWS", "Docker"] },
  { key: "aiml", label: "AI / ML", items: ["Hugging Face", "OpenAI API", "Transformers", "PyTorch"] },
  { key: "tools", label: "Tools", items: ["Firebase", "Git", "Jupyter", "Google Colab", "Botpress"] },
  { key: "data", label: "Data", items: ["SQL", "NumPy", "Power BI", "Excel"] },
];

/* ── Education ────────────────────────────────────────── */

export const education = [
  {
    degree: "B.E. — AI & Data Science",
    institution: "REVA University, Bangalore",
    period: "2022 – 2026",
    score: "9.58 CGPA",
  },
  {
    degree: "XII — Computer Science",
    institution: "Vidya Mandir, Bangalore",
    period: "2022",
    score: "93.83%",
  },
  {
    degree: "X — CBSE",
    institution: "Air Force School Hebbal, Bangalore",
    period: "2020",
    score: "90.33%",
  },
] as const;

/* ── Achievements ─────────────────────────────────────── */

export const achievements = [
  {
    title: "3rd Place — SIT Hackathon 2025",
    detail: "Placed third building under competition time pressure.",
    icon: "trophy",
    featured: true,
  },
  {
    title: "Core Member — AIverse Club",
    detail: "2023–Present. Led workshops and AI learning events.",
    icon: "users",
    featured: false,
  },
  {
    title: "Event Manager — AI-Fest 2024",
    detail: "Organized AI-themed fests with 100+ participants.",
    icon: "calendar",
    featured: false,
  },
  {
    title: "Devtrack Club Member",
    detail: "Contributed to collaborative app development sprints.",
    icon: "code",
    featured: false,
  },
] as const;

export const certifications = [
  { name: "AI Fundamentals", issuer: "IBM" },
  { name: "Big Data 101", issuer: "IBM" },
  { name: "Java Programming", issuer: "Udemy" },
] as const;

/* ── Navigation ───────────────────────────────────────── */

export const navSections = [
  { id: "about", label: "Who" },
  { id: "work", label: "Work" },
  { id: "stack", label: "Craft" },
  { id: "playground", label: "Playground" },
  { id: "contact", label: "Contact" },
] as const;
