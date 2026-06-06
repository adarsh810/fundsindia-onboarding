import type { L1Track, Week } from './types';

export const TOPICS: L1Track[] = [
  {
    id: 'l1', label: 'AI Native PM', hours: 35, color: '#2D6A4F', accent: '#B7E4C7',
    categories: [
      {
        name: 'AI Tech', topics: [
          { id: '1.1', title: 'AI Fundamentals', desc: 'LLMs, tokens, context windows, temperature, fine-tuning vs prompting', hours: 4, week: 'W1',
            done: 'Explain to a non-technical stakeholder how an LLM works without hand-waving',
            resources: ['Andrej Karpathy — Intro to LLMs (YouTube)', 'Chip Huyen — Building LLM Apps (blog)', 'Jay Alammar — The Illustrated Transformer', 'Stephen Wolfram — What is ChatGPT Doing'],
            artifact: 'One-pager: How LLMs work — explainer for a non-engineer' },
          { id: '1.2', title: 'Transformers 101', desc: 'Vectors, embeddings, attention mechanism, FFNN', hours: 5, week: 'W1–2',
            done: 'Draw the transformer architecture from memory and explain each component',
            resources: ['Jay Alammar — The Illustrated Transformer (deep read)', '3Blue1Brown — Attention in transformers (YouTube)', '3Blue1Brown — But what is a GPT? (YouTube)', 'Andrej Karpathy — Let\'s build GPT from scratch (YouTube, first 45min)', 'Sebastian Raschka — Understanding LLMs (free PDF)'],
            artifact: 'Hand-drawn transformer diagram with annotations on each block' },
          { id: '1.3', title: 'Prompt Engineering', desc: 'Structured prompts, chain of thought, few-shot, tool use patterns', hours: 4, week: 'W2',
            done: 'Write production-grade prompts with system messages, structured output, tool definitions',
            resources: ['Anthropic — Prompt Engineering docs (docs.anthropic.com)', 'OpenAI — Prompt Engineering Guide', 'DAIR.AI — Prompt Engineering Guide (GitHub)', 'Anthropic cookbook (GitHub)'],
            artifact: 'Prompt library: 5 production-grade prompts for FI use cases' },
          { id: '1.4', title: 'RAG Deep Dive', desc: 'Chunking, vector databases, embedding models, reranking, hybrid search', hours: 5, week: 'W3',
            done: 'Spec a RAG pipeline for FI RM briefing system end to end',
            resources: ['Pinecone — What is RAG + Chunking strategies', 'LangChain docs — RAG tutorial', 'Weaviate — Vector databases explained', 'Anthropic — Contextual Retrieval (blog)', 'Cohere — Reranking for RAG (blog)', 'LangChain — RAG From Scratch YouTube series (first 5 eps)'],
            artifact: 'RAG architecture diagram for FI RM briefing' },
          { id: '1.5', title: 'Agents', desc: 'Tool use, MCP, memory, multi-step planning, evaluation', hours: 5, week: 'W3–4',
            done: 'Build a working agent and explain when agents are overkill vs useful',
            resources: ['Anthropic — Tool use docs + Building agents guide', 'Anthropic — Model Context Protocol docs (modelcontextprotocol.io)', 'Lilian Weng — LLM Powered Autonomous Agents (blog)', 'Andrew Ng — Agentic Design Patterns (DeepLearning.AI)', 'Simon Willison — MCP explainer blogs'],
            artifact: 'Decision framework: when to use agents vs RAG vs simple prompt' },
          { id: '1.8', title: 'Hands-on Build', desc: 'Portfolio goal monitor agent — Claude API + Supabase + Vercel', hours: 5, week: 'W7–8',
            done: 'Deployed working app that monitors a portfolio goal and surfaces alerts',
            resources: ['Anthropic API docs — messages, tool use, streaming', 'Supabase docs — database, auth, edge functions', 'Vercel docs — deployment, serverless functions', 'Your existing BookMind/JobSwitch code as reference'],
            artifact: 'Deployed app at a Vercel URL that actually works end to end' },
        ],
      },
      {
        name: 'AI in Business', topics: [
          { id: '1.6', title: 'AI Product Sense', desc: 'When to use AI vs not, hallucination mgmt, eval frameworks, cost/latency tradeoffs', hours: 4, week: 'W4',
            done: 'Make product calls on AI features with engineering-level reasoning',
            resources: ['Hamel Husain — Your AI Product Needs Evals (blog)', 'Eugene Yan — Patterns for Building LLM-based Systems (blog)', 'Shreya Shankar — ML Eng vs LLM Eng (blog)', 'Anthropic — Evaluating AI Systems (docs)'],
            artifact: 'Evaluation framework for one FI AI feature: metrics, test cases, failure modes' },
          { id: '1.7', title: 'AI in Business Ops', desc: 'AI for internal tools, support, operations, analytics', hours: 3, week: 'W5',
            done: 'Identify 5 AI opportunities in FI operations beyond product features',
            resources: ['McKinsey — The State of AI 2025', 'a16z — AI in the Enterprise (blog series)', 'Ethan Mollick — Co-Intelligence (book, chapters 3–5)', 'Real examples: Klarna AI support, Stripe Radar, Notion AI'],
            artifact: 'FI internal AI opportunity map: 5 use cases with effort/impact matrix' },
        ],
      },
    ],
  },
  {
    id: 'l2', label: 'Finance 101–103', hours: 41, color: '#1B4F72', accent: '#AED6F1',
    categories: [
      {
        name: 'Domain', topics: [
          { id: '2.1', title: 'Finance Fundamentals', desc: 'TVM, compounding, risk-return, diversification, asset classes', hours: 5, week: 'W1–2',
            done: 'Hold a conversation with an RM about investment basics without faking it',
            resources: ['Khan Academy — Finance & Capital Markets (Core Finance section)', 'Zerodha Varsity — Module 1: Intro to Stock Markets', 'MIT OCW 15.401 — Finance Theory I (first 4 lectures)', 'The Plain Bagel — YouTube channel (TVM, compounding, risk explainers)'],
            artifact: 'Cheat sheet: key finance concepts with formulas and real Indian examples' },
          { id: '2.3', title: 'Mutual Funds Deep Dive', desc: 'SEBI categories, NAV, expense ratio, direct vs regular, SIP/SWP/STP, taxation', hours: 6, week: 'W2–3',
            done: 'Explain any MF scheme to a client the way an IFA would',
            resources: ['Zerodha Varsity — Module 12: Mutual Funds', 'AMFI — Learning Center (all modules)', 'SEBI Circular on MF categorization (Oct 2017) — read original', 'Value Research — MF 101 articles', 'Freefincal — Mutual Fund taxation guide', 'ET Money — YouTube MF explainers'],
            artifact: 'MF product cheat sheet: every SEBI category with example, use case, tax, risk' },
          { id: '2.5', title: 'Wealth Products', desc: 'PMS, AIF (Cat I/II/III), structured products, bonds, G-Secs, NPS', hours: 5, week: 'W4–5',
            done: 'Know which products are Tier 1/2/3 in the blueprint and why',
            resources: ['Zerodha Varsity — Bonds + NPS sections', 'SEBI — AIF regulations overview', 'PMS Bazaar — What is PMS? explainer', 'RBI Retail Direct — G-Sec buying guide', 'Capitalmind — AIF vs PMS vs MF comparison'],
            artifact: 'Product comparison matrix: MF vs PMS vs AIF — fees, liquidity, target investor' },
          { id: '2.6', title: 'Insurance & Tax Planning', desc: 'Term life, health, 80C/80D, new vs old regime, capital gains', hours: 4, week: 'W5',
            done: 'Understand cross-sell opportunities in wealth-tech',
            resources: ['Zerodha Varsity — Personal Finance module', 'Freefincal — Insurance planning articles', 'ClearTax — Tax planning guides (80C, 80D)', 'ET Wealth — Capital gains taxation guide 2025'],
            artifact: 'Tax-optimised investment flowchart for a salaried ₹80L CTC employee' },
          { id: '2.7', title: 'Goal-Based Financial Planning', desc: 'Risk profiling, rebalancing, how RMs/IFAs think about client portfolios', hours: 5, week: 'W6',
            done: 'Think like the user (investor + RM) not just the builder',
            resources: ['CFA Institute — Fundamentals of Financial Planning (free module)', 'Kuvera — Goal-based investing blog series', 'Freefincal — Goal-based portfolio construction articles', 'FundsIndia blog — existing goal planning content'],
            artifact: 'Sample financial plan for fictional client: 3 goals, allocation, product selection' },
        ],
      },
      {
        name: 'Tech', topics: [
          { id: '2.2', title: 'Indian Financial Markets', desc: 'SEBI structure, BSE/NSE, CDSL/NSDL, clearing corporations', hours: 5, week: 'W1–2',
            done: 'Draw the money flow diagram from investor to market and back',
            resources: ['Zerodha Varsity — Module 1 + Module 7 (Markets + Clearing)', 'SEBI website — About SEBI + org structure', 'NSE — How trading works (nseindia.com)', 'Nithin Kamath — Indian markets explained (YouTube)'],
            artifact: 'End-to-end diagram: investor → broker → exchange → clearing → depository → settlement' },
          { id: '2.4', title: 'Distribution Economics', desc: 'Trail commission, ARN, distributor vs RIA, how distributors make money', hours: 6, week: 'W3–4',
            done: 'Understand FundsIndia\'s revenue model from first principles',
            resources: ['AMFI — Distributor registration + commission disclosure norms', 'SEBI — Regulation of Investment Advisers (RIA framework)', 'Freefincal — Direct vs Regular plans: real cost difference', 'Subramoney — MF distribution business economics', 'NJ/Prudent annual reports — distribution revenue breakdown'],
            artifact: 'FI revenue model diagram: AMC trail → FI → across B2C/B2B/Wealth tiers' },
          { id: '2.8', title: 'Regulatory Landscape', desc: 'SEBI circulars, KYC norms, AMFI guidelines, RIA vs MFD, DPDP', hours: 5, week: 'W6',
            done: 'Understand compliance as a design constraint not a blocker',
            resources: ['SEBI — Key circulars on MF distribution (2018 TER, 2020 KYC)', 'AMFI — Code of Conduct for Intermediaries', 'CKYCRR — KYC Registration Agency process flow', 'MeitY — DPDP Act 2023 summary for fintech', 'iSPIRT — Account Aggregator framework explainer'],
            artifact: 'Regulatory constraint map: which rules affect which FI product decisions' },
        ],
      },
    ],
  },
  {
    id: 'l3', label: 'FundsIndia 101', hours: 29, color: '#6B3FA0', accent: '#D7BDE2',
    categories: [
      {
        name: 'Domain', topics: [
          { id: '3.1', title: 'FI Business Model', desc: 'B2C, B2B IFA, private wealth RM — revenue per tier', hours: 3, week: 'W4',
            done: 'Explain FI\'s business model to a new hire in 5 minutes',
            resources: ['FundsIndia website — all product pages, pricing', 'Blueprint exec summary — re-read for business context', 'LinkedIn — FundsIndia company page, recent posts'],
            artifact: 'FI business model one-pager: 3 tiers, revenue per tier, growth lever per tier' },
          { id: '3.2', title: 'Competitive Landscape', desc: 'Groww, Zerodha, NJ, Prudent, Anand Rathi, IIFL Wealth', hours: 3, week: 'W4',
            done: 'Draw a competitive positioning map with conviction',
            resources: ['Groww, Zerodha, Kuvera — download apps, use them', 'NJ Wealth, Prudent — IFA platform pages', 'Anand Rathi, IIFL Wealth — wealth management offerings', 'Tracxn/Crunchbase — funding data'],
            artifact: 'Competitive 2x2 matrix: self-serve vs advised × mass market vs HNI' },
          { id: '3.3', title: 'WestBridge Thesis', desc: 'Acquisition story, AUM growth, private wealth launch, exit thesis', hours: 3, week: 'W5',
            done: 'Understand the investor\'s perspective and what success means',
            resources: ['Your financial model spreadsheet (re-read)', 'WestBridge Capital website — portfolio, investment philosophy', 'Livemint/ET — WestBridge FundsIndia acquisition articles'],
            artifact: 'WestBridge thesis one-pager: why they invested, exit shape, key milestones' },
        ],
      },
      {
        name: 'Tech', topics: [
          { id: '3.5', title: 'Tech Stack & Vendors', desc: 'Fintech Primitives, BSE StAR, CAMS/KFintech, KYC/KRA stack', hours: 4, week: 'W5–6',
            done: 'Map what FI builds vs what it buys',
            resources: ['Fintech Primitives / Cybrilla — API documentation (public)', 'BSE StAR MF — platform overview', 'CAMS, KFintech — RTA service descriptions', 'Blueprint Section 7 — Integration spine'],
            artifact: 'Build vs buy map: FI in-house vs vendor for every major capability' },
          { id: '3.8', title: 'Transaction Lifecycle', desc: 'Order → BSE StAR → RTA → settlement → reconciliation', hours: 4, week: 'W6',
            done: 'Trace a single SIP transaction end to end through the entire system',
            resources: ['BSE StAR MF — order flow documentation', 'CAMS — Transaction processing overview', 'Blueprint Section 6 — Transaction core', 'NACH/NPCI — mandate creation flow docs'],
            artifact: 'Transaction lifecycle diagram: ₹10K SIP from bank to units — every step, every system' },
        ],
      },
      {
        name: 'Product Sense', topics: [
          { id: '3.4', title: 'Blueprint Deep Read', desc: '3 passes: strategy → architecture → 20 Day-1 questions for Avijit', hours: 5, week: 'W1,3,7',
            done: '20 Day-1 questions for Avijit, entity model redrawn in your own words',
            resources: ['Blueprint original + revised (you have both)', 'Blueprint diff (from analysis)', 'Phase success signals section', 'Glossary section'],
            artifact: 'Pass 1: strategy one-pager | Pass 2: entity diagram | Pass 3: 20 Day-1 questions' },
          { id: '3.6', title: 'Wealth-Tech Product Sense', desc: 'Compliance as design constraint, user trust in financial products', hours: 4, week: 'W6–7',
            done: 'Make product calls that don\'t get vetoed by compliance',
            resources: ['Wealthfront, Betterment — US robo UX for contrast', 'Scripbox, Kuvera — Indian goal-based UX', 'SEBI — Suitability guidelines for advisers', 'Blueprint — What FundsIndia is not section'],
            artifact: 'Product decision framework: compliance + trust checklist for any FI feature' },
          { id: '3.7', title: 'User Personas', desc: 'B2C investor, IFA, RM, ops — pain points, workflows, what they wish existed', hours: 3, week: 'W7',
            done: 'Empathise with the humans in the system not just the architecture',
            resources: ['FundsIndia app — use it as a B2C investor', 'IFA forums — Subramoney, ARIA, IFA Galaxy', 'LinkedIn — search for FI RMs, read their posts', 'Blueprint Section 5 — Experience layers'],
            artifact: 'Persona cards: 4 personas with goals, pain points, current tools, wish list' },
        ],
      },
    ],
  },
  {
    id: 'l4', label: 'AI SDLC 101–201', hours: 39, color: '#B7410E', accent: '#FAD7A0',
    categories: [
      {
        name: 'CS & Architecture', topics: [
          { id: '4.1', title: 'CS Primitives', desc: 'APIs, databases, data structures, how a web app works end to end', hours: 5, week: 'W1–2',
            done: 'Not afraid when engineers say REST API, Postgres, Redis, queue',
            resources: ['freeCodeCamp — APIs for Beginners (YouTube, 2hrs)', 'Fireship — 100+ Computer Science Concepts (YouTube)', 'ByteByteGo — System Design 101 (blog + YouTube)', 'Zerodha tech blog — How we handle X posts', 'Hussein Nasser — Backend Engineering Fundamentals (YouTube)'],
            artifact: 'Glossary card: 30 CS terms with one-line definitions and PM-relevant context' },
          { id: '4.2', title: 'Architecture Patterns', desc: 'Microservices, event-driven, DDD, bounded contexts, anti-corruption layers', hours: 5, week: 'W3',
            done: 'Read FI blueprint architecture sections and actually understand them',
            resources: ['Martin Fowler — Microservices (blog, original article)', 'Martin Fowler — Event-Driven Architecture (blog)', 'Eric Evans — DDD (book, Part 1 + 2 only)', 'ByteByteGo — Microservices vs Monolith (YouTube)', 'Blueprint Sections 1–2 — Domain model + Event spine'],
            artifact: 'FI architecture diagram: bounded contexts, how they communicate, where ACL sits' },
          { id: '4.3', title: 'Event Sourcing & Streaming', desc: 'Kafka, event stores, bitemporality, CQRS', hours: 5, week: 'W3–4',
            done: 'Understand why FI chose this pattern and what tradeoffs it creates',
            resources: ['Martin Fowler — Event Sourcing (blog)', 'Confluent — What is Apache Kafka? (docs + YouTube)', 'Greg Young — CQRS and Event Sourcing (YouTube talk)', 'Martin Kleppmann — Designing Data-Intensive Applications (Ch 11)', 'Blueprint Section 2 — Event spine'],
            artifact: 'Event sourcing explainer: why FI uses it, problems it solves, what it costs' },
        ],
      },
      {
        name: 'SDLC Practice', topics: [
          { id: '4.4', title: 'SDLC Fundamentals', desc: 'Git, PRs, CI/CD, testing (unit/integration/e2e), deployment, monitoring', hours: 5, week: 'W4',
            done: 'Follow an engineer\'s workflow from ticket to production',
            resources: ['GitHub — Git Handbook (docs)', 'Atlassian — CI/CD Pipeline explainer', 'Fireship — CI/CD in 100 Seconds + DevOps Explained (YouTube)', 'Martin Fowler — Continuous Integration + Continuous Delivery (blogs)', 'Google SRE book — Ch 1–3 (free online)'],
            artifact: 'SDLC lifecycle diagram: ticket → branch → PR → CI → staging → deploy → monitor' },
          { id: '4.5', title: 'AI-Augmented SDLC', desc: 'Claude Code, Cursor, Copilot, AI code review, AI testing', hours: 5, week: 'W5',
            done: 'Use AI dev tools daily and understand how they change engineering velocity',
            resources: ['Anthropic — Claude Code docs', 'Cursor — docs + Getting Started guide', 'GitHub Copilot — official docs', 'Pragmatic Engineer — AI tools in software development (newsletter)', 'Your own BookMind/JobSwitch experience with Claude Code'],
            artifact: 'AI dev tools comparison: Claude Code vs Cursor vs Copilot — when to use which' },
        ],
      },
      {
        name: 'Data & Infrastructure', topics: [
          { id: '4.6', title: 'Data Infrastructure', desc: 'Data lakes, lakehouses, ETL/ELT, dbt, data lineage, observability', hours: 5, week: 'W5–6',
            done: 'Understand FI\'s data foundation section in the blueprint',
            resources: ['Databricks — What is a Lakehouse? (blog)', 'dbt Labs — What is dbt? + Analytics Engineering guide', 'ByteByteGo — ETL vs ELT (YouTube)', 'Blueprint Section 8 — Data foundation', 'Atlan — Data Lineage 101 + Data Observability (blogs)'],
            artifact: 'FI data architecture: operational DB → event store → lakehouse → analytics → ML' },
          { id: '4.7', title: 'Security & Compliance in SDLC', desc: 'Auth, encryption, DPDP, audit logging, pen testing', hours: 4, week: 'W6',
            done: 'Ask the right security questions in design reviews',
            resources: ['OWASP — Top 10 Web Application Security Risks (2025)', 'Auth0 — Authentication vs Authorization (blog)', 'MeitY — DPDP Act 2023 summary for tech teams', 'Blueprint Section 10 — Security, compliance & regulatory'],
            artifact: 'Security checklist for any new FI feature: auth, PII, audit trail, DPDP' },
          { id: '4.8', title: 'LLM Deployment & Ops', desc: 'Hosting, inference costs, latency, guardrails, eval pipelines, A/B testing AI', hours: 5, week: 'W7–8',
            done: 'Bridge the gap between AI prototype and production AI',
            resources: ['Anthropic — API docs (rate limits, pricing, batching)', 'Hamel Husain — Your AI Product Needs Evals (blog)', 'Eugene Yan — LLM Patterns (blog)', 'Guardrails AI — docs + examples', 'Langfuse — LLM observability docs (open source)'],
            artifact: 'Production AI checklist: cost model, latency budget, guardrails spec, eval pipeline' },
        ],
      },
    ],
  },
];

export const WEEKS: Week[] = [
  { week: 'W1', weekday: 'AI Fundamentals (1.1) + Transformers start (1.2) + Blueprint Pass 1 (3.4)', weekend: 'Finance Fundamentals (2.1) + Indian Markets (2.2) + CS Primitives (4.1)', artifacts: 'LLM one-pager, Blueprint strategy summary' },
  { week: 'W2', weekday: 'Transformers complete (1.2) + Prompt Engineering (1.3)', weekend: 'MF Deep Dive (2.3) + CS Primitives contd (4.1)', artifacts: 'Transformer diagram, Prompt library, CS glossary' },
  { week: 'W3', weekday: 'RAG Deep Dive (1.4) + Agents start (1.5) + Blueprint Pass 2 (3.4)', weekend: 'Distribution Economics (2.4) + Architecture Patterns (4.2) + Event Sourcing (4.3)', artifacts: 'RAG architecture diagram, FI entity model, Revenue model diagram' },
  { week: 'W4', weekday: 'Agents complete (1.5) + AI Product Sense (1.6)', weekend: 'SDLC Fundamentals (4.4) + FI Business Model (3.1) + Competitive Landscape (3.2)', artifacts: 'Agent decision framework, Eval framework, FI business model one-pager' },
  { week: 'W5', weekday: 'AI in Business Ops (1.7) + AI SDLC Tools (4.5) + WestBridge Thesis (3.3)', weekend: 'Wealth Products (2.5) + Insurance & Tax (2.6) + FI Tech Stack (3.5)', artifacts: 'AI ops map, Product comparison matrix, Build vs buy map' },
  { week: 'W6', weekday: 'Data Infra (4.6) + Security (4.7) + Transaction Lifecycle (3.8)', weekend: 'Financial Planning (2.7) + Regulatory Landscape (2.8) + Wealth-Tech Product Sense (3.6)', artifacts: 'Transaction lifecycle diagram, Regulatory constraint map, Security checklist' },
  { week: 'W7', weekday: 'LLM Deployment (4.8) + User Personas (3.7) + Blueprint Pass 3 (3.4)', weekend: 'Hands-on Build start (1.8)', artifacts: '20 Day-1 questions, Persona cards, Production AI checklist' },
  { week: 'W8', weekday: 'Hands-on Build complete (1.8)', weekend: 'Final review + gap assessment + all artifacts compiled', artifacts: 'Deployed portfolio goal monitor, Master artifact folder' },
];

export const ALL_TOPICS = TOPICS.flatMap(l1 => l1.categories.flatMap(c => c.topics));
export const TOTAL_HOURS = TOPICS.reduce((a, l) => a + l.hours, 0);

export function findTopicById(id: string) {
  return ALL_TOPICS.find(t => t.id === id) ?? null;
}

export function findTrackForTopic(topicId: string) {
  return TOPICS.find(l => l.categories.some(c => c.topics.some(t => t.id === topicId))) ?? null;
}
