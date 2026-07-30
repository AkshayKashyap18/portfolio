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
  /** Neutral positioning line — this is a portfolio, not a job application. */
  focus: "AI · Backend · LLM Systems",
  pitch:
    "I build the backend and the intelligence behind it — production FastAPI services, and the LLM systems that make them think.",
  bio: [
    "I'm an AI-focused CS undergraduate who ended up spending most of my time where the model meets the machine: designing backend services that are fast and secure, then wiring real language-model intelligence into them.",
    "Day to day I ship production Python and FastAPI against Supabase and PostgreSQL — auth, role-based access, query paths that hold up under load — and build the AI layer on top: agentic workflows, LLM document extraction, embeddings and semantic search across OpenAI, Anthropic and Google models. Alongside that I've shipped three AI products of my own, end to end.",
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

export type ProjectKind = "production" | "personal";

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  hook: string;
  problem: string;
  approach: string;
  outcome: string;
  /** Which group the card belongs to — drives the Work section tabs. */
  kind: ProjectKind;
  period?: string;
  /**
   * What Akshay personally owned, stated honestly. On team projects this is the
   * most important thing on the card: an interviewer's first question is always
   * "which part did you build?"
   */
  role?: string;
  /**
   * Outcomes delivered by the whole team. Rendered under an explicit "Team
   * outcome" label so these are never mistaken for personal claims.
   */
  teamMetrics?: { label: string; value: string }[];
  bullets: string[];
  stack: string[];
  /** Set these once the repo exists — the card renders real buttons automatically. */
  repo?: string;
  demo?: string;
  /** Nodes → edges for the scroll-drawn architecture diagram. */
  architecture: { nodes: { id: string; label: string; x: number; y: number }[]; edges: [string, string][] };
  accent: "violet" | "cyan" | "lime";
};

export const KIND_LABEL: Record<ProjectKind, string> = {
  production: "Production",
  personal: "Personal",
};

export const projects: Project[] = [
  /* ── Production work ────────────────────────────────────
     Deliberately de-identified: no client, employer, colleague or internal
     system names. Every metric below traces to a real artifact; team outcomes
     are labelled as such and never presented as personal achievements.
     ─────────────────────────────────────────────────────── */
  {
    slug: "llm-extraction-pipeline",
    kind: "production",
    period: "2026",
    name: "LLM Extraction Pipeline",
    tagline: "Document extraction with measured guardrails",
    hook:
      "The model was right and the pipeline still corrupted the database: the term “9-18” went unquoted into a numeric SQL column, where it evaluated to −9.",
    problem:
      "Read hundreds of financial rate pages per run and emit structured offer records. The four-model LSTM/NER stack it replaced scored F1 0.25 — almost everything it produced was wrong. The hard part isn't parsing; it's judging whether a row is a real promotional offer or just a high rung on an ordinary rate ladder.",
    approach:
      "Claude via Bedrock at temperature 0, reproducing the retired model's exact output shape so nothing downstream changed. An HTML cleaner falls back to density-based extraction on huge pages, treating tables as atomic — the old rule was collapsing a 116k-character page to 124. Each prompt is bound to its paired hallucination filter, so rollback is config.",
    outcome:
      "F1 0.846 on a 118-page human gold set — against 0.25 for the system replaced, and 0.668 for the same model on raw HTML, which is what makes the cleaner defensible rather than assumed. 600 pages ran with zero errors at $0.0117 each.",
    role:
      "Sole author of the extraction module — prompts, guards, fallback, SQL-safety layer, service and alerting. Two boundaries: the definition of a valid offer came from the rule owner, and the cleaner concept from a reference script; the table-atomicity fix and guards were mine.",
    teamMetrics: [
      { label: "F1, shipped version", value: "0.846" },
      { label: "F1, system replaced", value: "0.25" },
    ],
    bullets: [
      "Prompts and their hallucination filters versioned as immutable pairs — rollback is one env variable.",
      "Traced a term-corruption bug across four systems to unquoted SQL formatting downstream.",
      "Downgraded my own 98% headline to 88–92% after finding the audit methodology inconsistent.",
    ],
    stack: [
      "Python",
      "AWS Bedrock",
      "Anthropic Claude",
      "BeautifulSoup",
      "FastAPI",
      "Docker",
      "Selenium",
      "CloudWatch",
    ],
    architecture: {
      nodes: [
        { id: "fetch", label: "Fetch Pages", x: 7, y: 50 },
        { id: "clean", label: "HTML Cleaner", x: 29, y: 50 },
        { id: "llm", label: "LLM Extract", x: 51, y: 50 },
        { id: "guards", label: "Guards", x: 73, y: 50 },
        { id: "store", label: "Store+Review", x: 93, y: 50 },
        { id: "bench", label: "Gold Bench", x: 51, y: 12 },
      ],
      edges: [
        ["fetch", "clean"],
        ["clean", "llm"],
        ["llm", "guards"],
        ["guards", "store"],
        ["guards", "clean"],
        ["bench", "llm"],
      ],
    },
    accent: "cyan",
  },
  {
    slug: "lakehouse-migration",
    kind: "production",
    period: "2026",
    name: "Lakehouse Migration Platform",
    tagline: "Client-governed ERP migration",
    hook:
      "The source ERP had no usable change-data-capture, so every insert, update and delete had to be derived from scratch.",
    problem:
      "A large ERP estate had to move onto a lakehouse table by table, with the business signing off exactly which columns survived and in what order. Tables ran to hundreds of columns and millions of rows, many mostly empty.",
    approach:
      "A rules engine where a returned sign-off sheet drives keep, drop, rename, cast and column order — onboarding becomes data entry, not code. Around it, an orchestrator where one control-table row adds, pauses or reschedules a table. Where no change feed existed, a row-hash three-way merge derives inserts, updates and deletes — including deletes the source cannot report.",
    outcome:
      "The first table went live end to end — 3.9M rows cut from 180 columns to the 22 signed off — and became the template for every table after. A key-uniqueness gate I made mandatory caught four tables silently corrupted by duplicate keys.",
    role:
      "I own the rules engine and column ordering, the type dictionary and cast reconciliation, the sign-off generator, the production worker notebook and the orchestrator. The audit notebook and warehouse bridge were another engineer's build — I ran, debugged, extended and directed those.",
    teamMetrics: [
      { label: "Rows, first table live", value: "3.9M" },
      { label: "Columns after sign-off", value: "180→22" },
    ],
    bullets: [
      "A returned tick-sheet drives keep/drop/rename/cast/order for 13 tables — onboarding is data entry, not code.",
      "Made key-uniqueness the mandatory first gate after finding append-mode duplicates corrupting four tables.",
      "Specced a hash/timestamp diff engine because the source exposed no trustworthy change feed.",
    ],
    stack: [
      "Microsoft Fabric",
      "Delta Lake",
      "PySpark",
      "Spark SQL",
      "T-SQL",
      "Python",
      "Medallion Architecture",
    ],
    architecture: {
      nodes: [
        { id: "src", label: "ERP Source", x: 6, y: 50 },
        { id: "raw", label: "Raw + CDF", x: 28, y: 50 },
        { id: "bronze", label: "Bronze", x: 50, y: 50 },
        { id: "silver", label: "Silver", x: 71, y: 50 },
        { id: "wh", label: "Serving WH", x: 92, y: 50 },
        { id: "rules", label: "Rules Table", x: 60, y: 12 },
      ],
      edges: [
        ["src", "raw"],
        ["raw", "bronze"],
        ["bronze", "silver"],
        ["silver", "wh"],
        ["rules", "bronze"],
        ["rules", "silver"],
      ],
    },
    accent: "violet",
  },
  {
    slug: "agentic-quote-engine",
    kind: "production",
    period: "2026",
    name: "Agentic Quote Engine",
    tagline: "Conversation in, priced quote out",
    hook:
      "A salesperson describes a process in plain English; an agent reasons about it, validates the physics, prices it and returns a branded quote.",
    problem:
      "Quoting industrial instrumentation meant driving a manual configurator through hundreds of interdependent options, applying engineering rules by hand. Turnaround ran to a full day, and the expertise lived in people's heads rather than the system.",
    approach:
      "A LangGraph agent replaces the configurator: it extracts parameters from a plain-English brief, infers what it can and asks only what it cannot deduce, validates feasibility against operating conditions, then applies engineering rules before writing a fully specified PDF quote.",
    outcome:
      "The agent is in daily production use, handling multiple configurations in a single quote and explaining every flagged issue in plain language rather than failing silently.",
    teamMetrics: [
      { label: "Time to quote", value: "24h → 4min" },
      { label: "First-pass accuracy", value: "95%" },
    ],
    bullets: [
      "Agentic graph reasons over a plain-English brief, asking only what it cannot infer.",
      "Real-time feasibility validation against operating conditions, with plain-language explanations.",
      "Rule-driven pricing and configuration, output as a fully specified branded PDF.",
    ],
    stack: ["LangGraph", "Google Gemini", "FastAPI", "React", "Supabase", "AWS", "Python"],
    architecture: {
      nodes: [
        { id: "brief", label: "Plain English", x: 7, y: 50 },
        { id: "agent", label: "Agent Graph", x: 30, y: 50 },
        { id: "physics", label: "Feasibility", x: 53, y: 20 },
        { id: "rules", label: "Rules Engine", x: 53, y: 80 },
        { id: "price", label: "Pricing", x: 75, y: 50 },
        { id: "pdf", label: "PDF Quote", x: 94, y: 50 },
      ],
      edges: [
        ["brief", "agent"],
        ["agent", "physics"],
        ["agent", "rules"],
        ["physics", "price"],
        ["rules", "price"],
        ["price", "pdf"],
      ],
    },
    accent: "lime",
  },
  {
    slug: "mindmate",
    kind: "personal",
    period: "2025",
    repo: "https://github.com/AkshayKashyap18/Mindmate",
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
    kind: "personal",
    period: "2025",
    repo: "https://github.com/AkshayKashyap18/edumorph",
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
    kind: "personal",
    period: "2025",
    repo: "https://github.com/AkshayKashyap18/Mcp-todo",
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

/**
 * Every entry here is something used in real shipped work — the professional
 * projects, the personal ones, or both. Nothing aspirational.
 */
export const skills: SkillCategory[] = [
  {
    key: "languages",
    label: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "SQL", "Java", "C"],
  },
  {
    key: "llm",
    label: "AI & LLM Systems",
    items: [
      "LangGraph",
      "AWS Bedrock",
      "Anthropic Claude",
      "OpenAI API",
      "Google Gemini",
      "Prompt Engineering",
      "LLM Evaluation",
      "Embeddings & Semantic Search",
      "MCP",
      "PyTorch",
      "Transformers",
      "Hugging Face",
    ],
  },
  {
    key: "backend",
    label: "Backend",
    items: [
      "FastAPI",
      "Django",
      "REST APIs",
      "Supabase",
      "PostgreSQL",
      "Auth & RBAC",
      "Firebase",
    ],
  },
  {
    key: "data",
    label: "Data Engineering",
    items: [
      "Microsoft Fabric",
      "Delta Lake",
      "PySpark",
      "Medallion Architecture",
      "Change Data Capture",
      "Data Quality Profiling",
      "NumPy",
      "Power BI",
    ],
  },
  {
    key: "cloud",
    label: "Cloud & DevOps",
    items: ["AWS Lambda", "AWS S3", "AWS EC2", "Docker", "Terraform", "Git"],
  },
  {
    key: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS", "Framer Motion"],
  },
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
