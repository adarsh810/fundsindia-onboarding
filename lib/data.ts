import type { L1Track, Week } from './types';

export const TOPICS: L1Track[] = [
  {
    id: 'l1', label: 'AI Native PM', hours: 50, color: '#2D6A4F', accent: '#B7E4C7',
    categories: [
      {
        name: 'AI Tech', topics: [
          {
            id: '1.1', title: 'AI Fundamentals', desc: 'LLMs, tokens, context windows, temperature, fine-tuning vs prompting', hours: 4, week: 'W1',
            done: 'Explain to a non-technical stakeholder how an LLM works without hand-waving',
            resources: [
              { label: 'Andrej Karpathy — Intro to LLMs (YouTube)', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g' },
              { label: 'Chip Huyen — Building LLM Applications', url: 'https://huyenchip.com/2023/04/11/llm-engineering.html' },
              { label: 'Jay Alammar — The Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/' },
              { label: 'Stephen Wolfram — What is ChatGPT Doing', url: 'https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/' },
            ],
            artifact: 'One-pager: How LLMs work — explainer for a non-engineer',
          },
          {
            id: '1.2', title: 'Transformers 101', desc: 'Vectors, embeddings, attention mechanism, FFNN', hours: 6, week: 'W1–2',
            done: 'Draw the transformer architecture from memory and explain each component',
            resources: [
              { label: 'Jay Alammar — The Illustrated Transformer (deep read)', url: 'https://jalammar.github.io/illustrated-transformer/' },
              { label: '3Blue1Brown — Attention in transformers (YouTube)', url: 'https://www.youtube.com/watch?v=eMlx5fFNoYc' },
              { label: '3Blue1Brown — But what is a GPT? (YouTube)', url: 'https://www.youtube.com/watch?v=wjZofJX0v4M' },
              { label: 'Andrej Karpathy — Let\'s build GPT from scratch (YouTube)', url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY' },
              { label: 'Sebastian Raschka — Understanding and Coding Transformers', url: 'https://sebastianraschka.com/blog/2023/self-attention-from-scratch.html' },
            ],
            artifact: 'Hand-drawn transformer diagram with annotations on each block',
          },
          {
            id: '1.3', title: 'Prompt Engineering', desc: 'Structured prompts, chain of thought, few-shot, tool use patterns', hours: 4, week: 'W2',
            done: 'Write production-grade prompts with system messages, structured output, tool definitions',
            resources: [
              { label: 'Anthropic — Prompt Engineering docs', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' },
              { label: 'OpenAI — Prompt Engineering Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering' },
              { label: 'DAIR.AI — Prompt Engineering Guide (GitHub)', url: 'https://github.com/dair-ai/Prompt-Engineering-Guide' },
              { label: 'Anthropic Cookbook (GitHub)', url: 'https://github.com/anthropics/anthropic-cookbook' },
            ],
            artifact: 'Prompt library: 5 production-grade prompts for FI use cases',
          },
          {
            id: '1.4', title: 'RAG Deep Dive', desc: 'Chunking, vector databases, embedding models, reranking, hybrid search', hours: 5, week: 'W3',
            done: 'Spec a RAG pipeline for FI RM briefing system end to end',
            resources: [
              { label: 'Pinecone — What is RAG + Chunking strategies', url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/' },
              { label: 'LangChain docs — RAG tutorial', url: 'https://python.langchain.com/docs/tutorials/rag/' },
              { label: 'Weaviate — What is a vector database?', url: 'https://weaviate.io/blog/what-is-a-vector-database' },
              { label: 'Anthropic — Contextual Retrieval (blog)', url: 'https://www.anthropic.com/news/contextual-retrieval' },
              { label: 'Cohere — Reranking for RAG', url: 'https://cohere.com/blog/rerank' },
              { label: 'LangChain — RAG From Scratch (YouTube series)', url: 'https://www.youtube.com/playlist?list=PLfaIDFEXuae2LXbO1_PKyVJiQ23ZztA0x' },
            ],
            artifact: 'RAG architecture diagram for FI RM briefing',
          },
          {
            id: '1.5', title: 'Agents', desc: 'Tool use, MCP, memory, multi-step planning, evaluation', hours: 6, week: 'W3–4',
            done: 'Build a working agent and explain when agents are overkill vs useful',
            resources: [
              { label: 'Anthropic — Tool use docs', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use' },
              { label: 'Anthropic — Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents' },
              { label: 'Model Context Protocol — official docs', url: 'https://modelcontextprotocol.io/' },
              { label: 'Lilian Weng — LLM Powered Autonomous Agents', url: 'https://lilianweng.github.io/posts/2023-06-23-agent/' },
              { label: 'Andrew Ng — Agentic Design Patterns (DeepLearning.AI)', url: 'https://www.deeplearning.ai/the-batch/how-agents-can-improve-llm-performance/' },
            ],
            artifact: 'Decision framework: when to use agents vs RAG vs simple prompt',
          },
          {
            id: '1.9', title: 'Multimodal & Document AI', desc: 'Vision models, document intelligence, OCR, layout extraction — beyond text LLMs', hours: 4, week: 'W5',
            done: 'Spec a KYC document extraction pipeline and identify the right model for each document type (PAN, Aadhaar, bank statement, ITR, CAS)',
            resources: [
              { label: 'Anthropic — Claude Vision (docs)', url: 'https://docs.anthropic.com/en/docs/build-with-claude/vision' },
              { label: 'Google Cloud — Document AI overview', url: 'https://cloud.google.com/document-ai/docs/overview' },
              { label: 'OpenAI — Vision guide', url: 'https://platform.openai.com/docs/guides/vision' },
              { label: 'Nanonets — Document AI in practice', url: 'https://nanonets.com/blog/document-ai/' },
              { label: 'Microsoft — LayoutLM: document understanding at scale (GitHub)', url: 'https://github.com/microsoft/unilm/tree/master/layoutlm' },
            ],
            artifact: 'Document AI use case map for FundsIndia: 5 documents (KYC/PAN/bank statement/ITR/CAS) — what to extract, which model, expected accuracy, key failure modes',
          },
          {
            id: '1.8', title: 'Hands-on Build', desc: 'Portfolio goal monitor agent — Claude API + Supabase + Vercel', hours: 6, week: 'W8',
            done: 'Deployed working app that monitors a portfolio goal and surfaces alerts',
            resources: [
              { label: 'Anthropic API docs — messages, tool use, streaming', url: 'https://docs.anthropic.com/en/api/getting-started' },
              { label: 'Supabase docs', url: 'https://supabase.com/docs' },
              { label: 'Vercel docs', url: 'https://vercel.com/docs' },
              { label: 'Next.js App Router docs', url: 'https://nextjs.org/docs/app' },
            ],
            artifact: 'Deployed app at a Vercel URL that actually works end to end',
          },
        ],
      },
      {
        name: 'AI in Business', topics: [
          {
            id: '1.6', title: 'AI Product Sense', desc: 'When to use AI vs not, hallucination mgmt, eval frameworks, cost/latency tradeoffs', hours: 4, week: 'W4',
            done: 'Make product calls on AI features with engineering-level reasoning',
            resources: [
              { label: 'Hamel Husain — Your AI Product Needs Evals', url: 'https://hamel.dev/blog/posts/evals/' },
              { label: 'Eugene Yan — Patterns for Building LLM-based Systems', url: 'https://eugeneyan.com/writing/llm-patterns/' },
              { label: 'Shreya Shankar — Rethinking ML Monitoring', url: 'https://www.shreya-shankar.com/rethinking-ml-monitoring/' },
              { label: 'Anthropic — Model evaluation overview', url: 'https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool' },
              { label: 'Ethan Mollick — AI in Organizations: Some Tactics (essay)', url: 'https://www.oneusefulthing.org/p/ai-in-organizations-some-tactics' },
              { label: 'a16z — Emerging Architectures for LLM Applications (Bornstein & Radovanovic)', url: 'https://a16z.com/emerging-architectures-for-llm-applications/' },
            ],
            artifact: 'Evaluation framework for one FI AI feature: metrics, test cases, failure modes',
          },
          {
            id: '1.7', title: 'AI in Business Ops', desc: 'AI for internal tools, support, operations, analytics', hours: 3, week: 'W6',
            done: 'Identify 5 AI opportunities in FI operations beyond product features',
            resources: [
              { label: 'McKinsey — The State of AI 2025', url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai' },
              { label: 'a16z — AI in the Enterprise', url: 'https://a16z.com/ai/' },
              { label: 'Ethan Mollick — Co-Intelligence (book)', url: 'https://www.amazon.com/Co-Intelligence-Living-Working-Artificial-Intelligence/dp/0593716744' },
              { label: 'Klarna AI support case study', url: 'https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/' },
            ],
            artifact: 'FI internal AI opportunity map: 5 use cases with effort/impact matrix',
          },
          {
            id: '1.10', title: 'Responsible AI in Regulated Products', desc: 'Explainability, hallucination risk in financial advice, AI liability, DPDP, guardrails as product features', hours: 4, week: 'W7',
            done: 'Identify every liability and compliance risk in a proposed AI feature before engineering writes a line of code',
            resources: [
              { label: 'Google PAIR — People + AI Guidebook', url: 'https://pair.withgoogle.com/guidebook/' },
              { label: 'NIST — AI Risk Management Framework', url: 'https://airc.nist.gov/RMF_Overview' },
              { label: 'EU AI Act — official summary', url: 'https://artificialintelligenceact.eu/' },
              { label: 'Anthropic — Responsible Scaling Policy', url: 'https://www.anthropic.com/news/anthropics-responsible-scaling-policy' },
              { label: 'MeitY — DPDP Act 2023 (AI + data privacy)', url: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023' },
            ],
            artifact: 'Responsible AI checklist for FI: for any AI feature — liability owner, explainability approach, consent mechanism, audit trail, SEBI compliance touchpoints, DPDP obligations',
          },
          {
            id: '1.11', title: 'AI Product Metrics & Feedback Loops', desc: 'Acceptance rate, override rate, trust calibration, AI A/B testing pitfalls, data flywheel, drift monitoring', hours: 4, week: 'W7',
            done: 'Define what "working" means for an AI feature before it ships — metrics, thresholds, monitoring plan, and how you will iterate',
            resources: [
              { label: 'Chip Huyen — Designing Machine Learning Systems (book)', url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/' },
              { label: 'Google — Rules of ML (43 rules for production ML products)', url: 'https://developers.google.com/machine-learning/guides/rules-of-ml' },
              { label: 'Andrej Karpathy — Software 2.0', url: 'https://karpathy.medium.com/software-2-0-a64152b37c35' },
              { label: 'Evidently AI — ML monitoring guide', url: 'https://www.evidentlyai.com/ml-monitoring' },
              { label: 'Shreya Shankar — Data Distribution Shifts and Monitoring', url: 'https://www.shreya-shankar.com/data-distribution-shifts/' },
            ],
            artifact: 'AI metrics spec for one FI feature: success definition, acceptance/override rate targets, A/B test design, monitoring alerts, drift detection approach',
          },
        ],
      },
    ],
  },
  {
    id: 'l2', label: 'Finance 101–103', hours: 44, color: '#1B4F72', accent: '#AED6F1',
    categories: [
      {
        name: 'Domain', topics: [
          {
            id: '2.1', title: 'Finance Fundamentals', desc: 'TVM, compounding, risk-return, diversification, asset classes', hours: 6, week: 'W1–2',
            done: 'Hold a conversation with an RM about investment basics without faking it',
            resources: [
              { label: 'Khan Academy — Finance & Capital Markets', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance' },
              { label: 'Zerodha Varsity — Module 1: Intro to Stock Markets', url: 'https://zerodha.com/varsity/module/introduction-to-stock-markets/' },
              { label: 'MIT OCW 15.401 — Finance Theory I', url: 'https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/' },
              { label: 'The Plain Bagel — YouTube (TVM, compounding, risk)', url: 'https://www.youtube.com/@ThePlainBagel' },
              { label: 'Zerodha Varsity — Modules 1, 3, 13, 15: Markets Intro, Equity Valuation, Financial Modelling & Sector Analysis', url: 'https://zerodha.com/varsity/modules/' },
            ],
            artifact: 'Cheat sheet: key finance concepts with formulas and real Indian examples',
          },
          {
            id: '2.3', title: 'Mutual Funds Deep Dive', desc: 'SEBI categories, NAV, expense ratio, direct vs regular, SIP/SWP/STP, taxation', hours: 6, week: 'W3',
            done: 'Explain any MF scheme to a client the way an IFA would',
            resources: [
              { label: 'Zerodha Varsity — Module 12: Mutual Funds', url: 'https://zerodha.com/varsity/module/personalfinance/' },
              { label: 'AMFI — Learning Center', url: 'https://www.amfiindia.com/investor-corner/education/education-corner.html' },
              { label: 'SEBI Circular — MF categorization (Oct 2017)', url: 'https://www.sebi.gov.in/legal/circulars/oct-2017/categorization-and-rationalization-of-mutual-fund-schemes_36132.html' },
              { label: 'Value Research — Mutual Funds', url: 'https://www.valueresearchonline.com/funds/selector/' },
              { label: 'Freefincal — Mutual Fund taxation guide', url: 'https://freefincal.com/mutual-fund-taxation/' },
              { label: 'ET Money — YouTube (MF explainers)', url: 'https://www.youtube.com/@ETMoneyPersonalFinance' },
              { label: 'Zerodha Varsity — Modules 11, 12: Mutual Funds & Investor Psychology', url: 'https://zerodha.com/varsity/module/personalfinance/' },
            ],
            artifact: 'MF product cheat sheet: every SEBI category with example, use case, tax, risk',
          },
          {
            id: '2.5', title: 'Wealth Products', desc: 'PMS, AIF (Cat I/II/III), structured products, bonds, G-Secs, NPS', hours: 6, week: 'W5',
            done: 'Know which products are Tier 1/2/3 in the blueprint and why',
            resources: [
              { label: 'Zerodha Varsity — Bonds module', url: 'https://zerodha.com/varsity/module/markets-and-taxation/' },
              { label: 'SEBI — AIF regulations overview', url: 'https://www.sebi.gov.in/legal/regulations/may-2012/securities-and-exchange-board-of-india-alternative-investment-funds-regulations-2012_27488.html' },
              { label: 'PMS Bazaar — What is PMS?', url: 'https://www.pmsbazaar.com/blog/what-is-portfolio-management-service/' },
              { label: 'RBI Retail Direct — G-Sec buying guide', url: 'https://rbiretaildirect.org.in/' },
              { label: 'Capitalmind — AIF vs PMS vs MF comparison', url: 'https://capitalmind.in/category/investingresearch/' },
              { label: 'Zerodha Varsity — Modules 7, 8, 16, 17: Tax Compliance, G-Secs, Social Stock Exchanges & NPS', url: 'https://zerodha.com/varsity/module/markets-and-taxation/' },
            ],
            artifact: 'Product comparison matrix: MF vs PMS vs AIF — fees, liquidity, target investor',
          },
          {
            id: '2.6', title: 'Insurance & Tax Planning', desc: 'Term life, health, 80C/80D, new vs old regime, capital gains', hours: 4, week: 'W7',
            done: 'Understand cross-sell opportunities in wealth-tech',
            resources: [
              { label: 'Zerodha Varsity — Personal Finance module', url: 'https://zerodha.com/varsity/module/personalfinance/' },
              { label: 'Freefincal — Insurance planning articles', url: 'https://freefincal.com/category/insurance/' },
              { label: 'ClearTax — Tax planning guide (80C, 80D)', url: 'https://cleartax.in/guide/taxes' },
              { label: 'ET Wealth — Capital gains taxation guide 2025', url: 'https://economictimes.indiatimes.com/wealth/tax/capital-gains' },
            ],
            artifact: 'Tax-optimised investment flowchart for a salaried ₹80L CTC employee',
          },
          {
            id: '2.7', title: 'Goal-Based Financial Planning', desc: 'Risk profiling, rebalancing, how RMs/IFAs think about client portfolios', hours: 5, week: 'W7',
            done: 'Think like the user (investor + RM) not just the builder',
            resources: [
              { label: 'CFA Institute — Fundamentals of Financial Planning', url: 'https://www.cfainstitute.org/en/programs/investment-foundations/overview' },
              { label: 'Kuvera — Goal-based investing blog', url: 'https://kuvera.in/blog/' },
              { label: 'Freefincal — Goal-based portfolio construction', url: 'https://freefincal.com/category/goal-based-investing/' },
              { label: 'FundsIndia — Learn section', url: 'https://www.fundsindia.com/learn/' },
              { label: 'Zerodha Varsity — Modules 9, 14: Risk Management & Insurance in Financial Planning', url: 'https://zerodha.com/varsity/module/risk-management/' },
            ],
            artifact: 'Sample financial plan for fictional client: 3 goals, allocation, product selection',
          },
        ],
      },
      {
        name: 'Tech', topics: [
          {
            id: '2.2', title: 'Indian Financial Markets', desc: 'SEBI structure, BSE/NSE, CDSL/NSDL, clearing corporations', hours: 6, week: 'W1–2',
            done: 'Draw the money flow diagram from investor to market and back',
            resources: [
              { label: 'Zerodha Varsity — Module 1 + Module 7 (Markets + Clearing)', url: 'https://zerodha.com/varsity/module/introduction-to-stock-markets/' },
              { label: 'SEBI — About SEBI + org structure', url: 'https://www.sebi.gov.in/about-sebi.html' },
              { label: 'NSE — How trading works', url: 'https://www.nseindia.com/products-services/equities-overview' },
              { label: 'Zerodha YouTube — Indian markets explained', url: 'https://www.youtube.com/@ZerodhaOnline' },
              { label: 'Zerodha Varsity — Modules 2, 4, 5, 6, 10: Technical Analysis, Derivatives & Trading Systems', url: 'https://zerodha.com/varsity/module/technical-analysis/' },
            ],
            artifact: 'End-to-end diagram: investor → broker → exchange → clearing → depository → settlement',
          },
          {
            id: '2.4', title: 'Distribution Economics', desc: 'Trail commission, ARN, distributor vs RIA, how distributors make money', hours: 6, week: 'W4',
            done: 'Understand FundsIndia\'s revenue model from first principles',
            resources: [
              { label: 'AMFI — Distributor registration + commission norms', url: 'https://www.amfiindia.com/distributor-corner' },
              { label: 'SEBI — Investment Advisers regulations', url: 'https://www.sebi.gov.in/legal/regulations/nov-2020/securities-and-exchange-board-of-india-investment-advisers-regulations-2013-last-amended-on-november-06-2020-_48220.html' },
              { label: 'Freefincal — Direct vs Regular plans: real cost', url: 'https://freefincal.com/direct-plan-vs-regular-plan-mutual-fund/' },
              { label: 'Subramoney — MF distribution business economics', url: 'https://www.subramoney.com/' },
              { label: 'NJ Wealth — IFA platform', url: 'https://njwealth.in/' },
            ],
            artifact: 'FI revenue model diagram: AMC trail → FI → across B2C/B2B/Wealth tiers',
          },
          {
            id: '2.8', title: 'Regulatory Landscape', desc: 'SEBI circulars, KYC norms, AMFI guidelines, RIA vs MFD, DPDP', hours: 5, week: 'W9',
            done: 'Understand compliance as a design constraint not a blocker',
            resources: [
              { label: 'SEBI — Circulars (MF distribution, KYC)', url: 'https://www.sebi.gov.in/legal/circulars.html' },
              { label: 'AMFI — Code of Conduct for Intermediaries', url: 'https://www.amfiindia.com/distributor-corner' },
              { label: 'CERSAI / CKYCR — KYC Registration', url: 'https://www.ckycrr.com/' },
              { label: 'MeitY — DPDP Act 2023', url: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023' },
              { label: 'Sahamati — Account Aggregator explainer', url: 'https://sahamati.org.in/what-is-account-aggregator/' },
            ],
            artifact: 'Regulatory constraint map: which rules affect which FI product decisions',
          },
        ],
      },
    ],
  },
  {
    id: 'l3', label: 'FundsIndia 101', hours: 47, color: '#6B3FA0', accent: '#D7BDE2',
    categories: [
      {
        name: 'Domain', topics: [
          {
            id: '3.1', title: 'Wealthtech Overview + FI Business Model', desc: 'India wealthtech context, SEBI/RBI structure, PMS/AIF space, and FI\'s B2C / IFA / private-wealth business model — revenue per tier', hours: 6, week: 'W7',
            done: 'Explain both the India wealthtech landscape AND FI\'s business model to a new hire in 5 minutes',
            resources: [
              { label: 'FundsIndia — website (all product pages)', url: 'https://www.fundsindia.com/' },
              { label: 'FundsIndia — LinkedIn (recent posts)', url: 'https://www.linkedin.com/company/fundsindia/' },
              { label: 'Tracxn — FundsIndia profile', url: 'https://tracxn.com/d/companies/fundsindia/__bCcETYLf8eH0gIqLz_xByqiO-6cZQ3BVEM4_WcSXO-M' },
              { label: 'WealthTech Primer', url: '/reading-material/A-WealthTech-Primer.html' },
              { label: 'SEBI Survey — FundsIndia Brief', url: '/reading-material/C-sebi_survey_fundsindia_brief.html' },
              { label: 'India Wealthtech Landscape', url: '/reading-material/B-India_wealthtech_landscape.html' },
              { label: 'PMS & AIF Landscape (India)', url: '/reading-material/E-india_pms_aif_landscape.html' },
              { label: 'FundsIndia Strategy Deck (high level)', url: '/reading-material/4_FundsIndia_Strategy_Deck.html' },
            ],
            artifact: 'Two-part one-pager: (1) India wealthtech landscape — key players, regulators, PMS/AIF space; (2) FI business model — 3 tiers, revenue per tier, growth lever per tier',
          },
          {
            id: '3.2', title: 'Competitive Landscape', desc: 'Indian competitors + global robo-UX for contrast + SEBI suitability rules + investor lifecycle view', hours: 6, week: 'W7',
            done: 'Draw a competitive positioning map with conviction AND identify product-UX + compliance patterns',
            resources: [
              { label: 'Groww — app/website', url: 'https://groww.in/' },
              { label: 'Kuvera — goal-based investing platform', url: 'https://kuvera.in/' },
              { label: 'NJ Wealth — IFA platform', url: 'https://njwealth.in/' },
              { label: 'Anand Rathi Wealth', url: 'https://www.anandrathiwealth.in/' },
              { label: 'IIFL Wealth', url: 'https://www.iiflwealth.com/' },
              { label: 'Crunchbase — India wealthtech', url: 'https://www.crunchbase.com/hub/india-financial-services-companies' },
              { label: 'Wealthfront — US robo UX (for contrast)', url: 'https://www.wealthfront.com/' },
              { label: 'Betterment — US robo UX (for contrast)', url: 'https://www.betterment.com/' },
              { label: 'Scripbox — Indian goal-based UX', url: 'https://scripbox.com/' },
              { label: 'SEBI — Suitability guidelines for advisers', url: 'https://www.sebi.gov.in/legal/regulations/nov-2020/securities-and-exchange-board-of-india-investment-advisers-regulations-2013-last-amended-on-november-06-2020-_48220.html' },
              { label: 'Investor Playbook — Product View of Investor Lifecycle', url: '/reading-material/Investor-Playbook-FundsIndia-Product-View-of-Investor-Lifecycle.docx' },
            ],
            artifact: 'Competitive 2x2 matrix (self-serve vs advised × mass vs HNI) + product-UX comparison table + compliance checklist',
          },
          {
            id: '3.3', title: 'WestBridge Thesis', desc: 'Acquisition story, AUM growth, private wealth launch, exit thesis', hours: 3, week: 'W7',
            done: 'Understand the investor\'s perspective and what success means',
            resources: [
              { label: 'WestBridge Capital — website', url: 'https://westbridge.com/' },
              { label: 'Livemint — WestBridge FundsIndia articles', url: 'https://www.livemint.com/Search/Link/Keyword/fundsindia' },
              { label: 'Economic Times — FundsIndia news', url: 'https://economictimes.indiatimes.com/topic/fundsindia' },
            ],
            artifact: 'WestBridge thesis one-pager: why they invested, exit shape, key milestones',
          },
        ],
      },
      {
        name: 'Tech', topics: [
          {
            id: '3.5', title: 'Tech Stack & Vendors', desc: 'Fintech Primitives, BSE StAR, CAMS/KFintech, KYC/KRA stack', hours: 4, week: 'W7',
            done: 'Map what FI builds vs what it buys',
            resources: [
              { label: 'Fintech Primitives / Cybrilla — API docs', url: 'https://fintechprimitives.com/' },
              { label: 'BSE StAR MF — platform overview', url: 'https://www.bsestarmf.in/' },
              { label: 'CAMS — RTA services', url: 'https://www.camsonline.com/' },
              { label: 'KFintech — RTA services', url: 'https://www.kfintech.com/' },
            ],
            artifact: 'Build vs buy map: FI in-house vs vendor for every major capability',
          },
          {
            id: '3.8', title: 'Transaction Lifecycle', desc: 'Order → BSE StAR → RTA → settlement → reconciliation', hours: 4, week: 'W8',
            done: 'Trace a single SIP transaction end to end through the entire system',
            resources: [
              { label: 'BSE StAR MF — order flow documentation', url: 'https://www.bsestarmf.in/' },
              { label: 'CAMS — transaction processing overview', url: 'https://www.camsonline.com/InvestorServices/CAMSOnline-Services' },
              { label: 'NPCI — NACH mandate creation flow', url: 'https://www.npci.org.in/what-we-do/nach/product-overview' },
            ],
            artifact: 'Transaction lifecycle diagram: ₹10K SIP from bank to units — every step, every system',
          },
          {
            id: '3.9', title: 'FI Entities (E1–E5)', desc: 'Investor, Instruments, Order, Folio, Rails — the 5 core domain nouns every downstream doc references', hours: 5, week: 'W7',
            done: 'Draw the entity model from memory: relationships between Investor, Instruments, Order, Folio, Rails',
            resources: [
              { label: 'E1 — Investor', url: '/reading-material/E1-Investor.html' },
              { label: 'E2 — Instruments', url: '/reading-material/E2-Instruments.html' },
              { label: 'E3 — Order', url: '/reading-material/E3-Order.html' },
              { label: 'E4 — Folio', url: '/reading-material/E4-Folio.html' },
              { label: 'E5 — Rails', url: '/reading-material/E5-Rails.html' },
            ],
            artifact: 'Entity relationship diagram: all 5 entities + their relationships redrawn in your own words',
          },
        ],
      },
      {
        name: 'Product Sense', topics: [
          {
            id: '3.4', title: 'Blueprint Deep Read', desc: '3 passes: strategy → architecture → 20 Day-1 questions for Avijit', hours: 6, week: 'W8',
            done: '20 Day-1 questions for Avijit, entity model redrawn in your own words',
            resources: [
              { label: 'Blueprint original + revised (internal)' },
              { label: 'Blueprint diff analysis (internal)' },
              { label: 'Blueprint Executive Summary v2.1', url: '/reading-material/1.1_FundsIndia_Blueprint_Executive_Summary_v2_1.html' },
            ],
            artifact: 'Pass 1: strategy one-pager | Pass 2: entity diagram | Pass 3: 20 Day-1 questions',
          },
          {
            id: '3.10', title: 'Investor Journeys (J0–J14)', desc: '15 end-to-end flows: onboarding, KYC, folio, mandates, orders, SIP, redemption, transmission', hours: 8, week: 'W8',
            done: 'Explain how a first-time investor goes from signup to first settled order — every step, every system',
            resources: [
              { label: 'J0 — Journey Index', url: '/reading-material/J0-A-Journey-Index.html' },
              { label: 'J1 — Investor Onboarding & KYC', url: '/reading-material/J1-Investor-Onboarding-and-KYC.html' },
              { label: 'J2 — KYC Lifecycle Events', url: '/reading-material/J2-KYC-Lifecycle-Events.html' },
              { label: 'J3 — Folio Creation', url: '/reading-material/J3-Folio-Creation.html' },
              { label: 'J4 — Nomination Capture & Update', url: '/reading-material/J4-Nomination-Capture-and-Update.html' },
              { label: 'J5 — Mandate Registration', url: '/reading-material/J5-Mandate-Registration.html' },
              { label: 'J6 — Order Lifecycle Spine', url: '/reading-material/J6-Order-Lifecycle-Spine.html' },
              { label: 'J7 — Onboard → First Settled Order', url: '/reading-material/J7-Onboard-to-First-Settled-Order.html' },
              { label: 'J8 — Systematic Investment Plan', url: '/reading-material/J8-Systematic-Investment-Plan.html' },
              { label: 'J9 — Redemption', url: '/reading-material/J9-Redemption.html' },
              { label: 'J10 — Switch & STP', url: '/reading-material/J10-Switch-and-STP.html' },
              { label: 'J11 — Systematic Withdrawal Plan', url: '/reading-material/J11-Systematic-Withdrawal-Plan.html' },
              { label: 'J12 — Transmission', url: '/reading-material/J12-Transmission.html' },
              { label: 'J13 — Financial Picture Aggregation', url: '/reading-material/J13-Financial-Picture-Aggregation.html' },
              { label: 'J14 — V1 Journey Flowcharts (rendered)', url: '/reading-material/J14-FundsIndia-V1-Journey-Flowcharts-RENDERED.html' },
            ],
            artifact: 'Journey map: 15 flows summarised — happy path + top 2 edge cases per flow',
          },
          {
            id: '3.11', title: 'V1 Build Strategy & Open Decisions', desc: 'The Key Calls, lock list, build strategy, block map, tech strategy view, open decisions register', hours: 5, week: 'W8',
            done: 'Know what FI is building in V1, what\'s locked, what\'s still open — questions ready for Day 1',
            resources: [
              { label: 'V1-0 — The Key Calls', url: '/reading-material/V1-0-FundsIndia_The_Key_Calls_V1.html' },
              { label: 'V1-1 — Stage 0 Lock List', url: '/reading-material/V1-1-FundsIndia_V1_Stage0_LockList.html' },
              { label: 'V1-2 — Build Strategy', url: '/reading-material/V1-2-FundsIndia_V1_Build_Strategy_v2_1.html' },
              { label: 'V1-3 — Big Block Map', url: '/reading-material/V1-3-FundsIndia-V1-Big-Block-Map-v2.html' },
              { label: 'V1-4 — Documentation Index', url: '/reading-material/V1-4-FundsIndia_V1_Documentation_Index.html' },
              { label: 'V1-5 — Technical Strategy View', url: '/reading-material/V1-5-FundsIndia-V1-Technical-Strategy-View.html' },
              { label: 'V1-6 — Technical Architecture View', url: '/reading-material/V1-6-FundsIndia-V1-Technical-Architecture-View.html' },
              { label: 'V1-8 — Open Decisions Register', url: '/reading-material/V1-8-Open-Decisions-Register-v0_16.html' },
            ],
            artifact: 'V1 open-decisions one-pager: your take on 3–5 decisions ready to discuss with Avijit',
          },
        ],
      },
    ],
  },
  {
    id: 'l4', label: 'AI SDLC 101–201', hours: 69, color: '#B7410E', accent: '#FAD7A0',
    categories: [
      {
        name: 'CS & Architecture', topics: [
          {
            id: '4.1', title: 'CS Primitives', desc: 'APIs, databases, data structures, how a web app works end to end', hours: 6, week: 'W1–2',
            done: 'Not afraid when engineers say REST API, Postgres, Redis, queue',
            resources: [
              { label: 'freeCodeCamp — APIs for Beginners (YouTube, 2hrs)', url: 'https://www.youtube.com/watch?v=GZvSYJDk-us' },
              { label: 'Fireship — 100+ CS Concepts Explained (YouTube)', url: 'https://www.youtube.com/watch?v=-uleG_Vecis' },
              { label: 'ByteByteGo — System Design 101 (YouTube)', url: 'https://www.youtube.com/@ByteByteGo' },
              { label: 'Zerodha Tech Blog', url: 'https://zerodha.tech/' },
              { label: 'Hussein Nasser — Backend Engineering (YouTube)', url: 'https://www.youtube.com/@hnasr' },
            ],
            artifact: 'Glossary card: 30 CS terms with one-line definitions and PM-relevant context',
          },
          {
            id: '4.2', title: 'Architecture Patterns', desc: 'Microservices, event-driven, DDD, bounded contexts, anti-corruption layers', hours: 5, week: 'W3–4',
            done: 'Read FI blueprint architecture sections and actually understand them',
            resources: [
              { label: 'Martin Fowler — Microservices (original article)', url: 'https://martinfowler.com/articles/microservices.html' },
              { label: 'Martin Fowler — Event-Driven Architecture', url: 'https://martinfowler.com/articles/201701-event-driven.html' },
              { label: 'Eric Evans — Domain-Driven Design (book)', url: 'https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215' },
              { label: 'ByteByteGo — Microservices vs Monolith (YouTube)', url: 'https://www.youtube.com/watch?v=lTAcCNbJ7KE' },
              { label: 'Martin Fowler — Bounded Context (article)', url: 'https://martinfowler.com/bliki/BoundedContext.html' },
              { label: 'DDD Europe — Eric Evans: "What is DDD?" (YouTube)', url: 'https://www.youtube.com/watch?v=pMuiVlnGqjk' },
              { label: 'GOTO — Sam Newman: "When To Use Microservices (And When Not To!)" (YouTube)', url: 'https://www.youtube.com/watch?v=GBTdnfD6s5Q' },
            ],
            artifact: 'FI architecture diagram: bounded contexts, how they communicate, where ACL sits',
          },
          {
            id: '4.9', title: 'API Design & Contracts', desc: 'REST vs GraphQL vs gRPC, versioning, backward compatibility, OpenAPI, rate limiting, vendor SLA contracts', hours: 4, week: 'W8',
            done: 'Design a vendor API integration spec and identify breaking vs non-breaking changes without asking engineering',
            resources: [
              { label: 'Stripe — API design best practices (docs)', url: 'https://stripe.com/docs/api' },
              { label: 'Martin Fowler — Richardson Maturity Model', url: 'https://martinfowler.com/articles/richardsonMaturityModel.html' },
              { label: 'Swagger / OpenAPI — Getting Started', url: 'https://swagger.io/docs/specification/about/' },
              { label: 'ByteByteGo — REST vs GraphQL vs gRPC (YouTube)', url: 'https://www.youtube.com/watch?v=4vLxWqE94l4' },
              { label: 'Fintech Primitives — API docs (real vendor example)', url: 'https://fintechprimitives.com/' },
              { label: 'AWS — What is an API Gateway? (article)', url: 'https://aws.amazon.com/what-is/api-gateway/' },
            ],
            artifact: 'API integration spec for one FI vendor (BSE StAR or FTP): endpoints, versioning strategy, error handling, rate limits, SLA contract',
          },
          {
            id: '4.3', title: 'Event Sourcing & Streaming', desc: 'Kafka, event stores, bitemporality, CQRS', hours: 6, week: 'W4–5',
            done: 'Understand why FI chose this pattern and what tradeoffs it creates',
            resources: [
              { label: 'Martin Fowler — Event Sourcing', url: 'https://martinfowler.com/eaaDev/EventSourcing.html' },
              { label: 'Confluent — What is Apache Kafka?', url: 'https://developer.confluent.io/what-is-apache-kafka/' },
              { label: 'Greg Young — CQRS and Event Sourcing (YouTube)', url: 'https://www.youtube.com/watch?v=JHGkaShoyNs' },
              { label: 'Martin Kleppmann — Designing Data-Intensive Applications', url: 'https://dataintensive.net/' },
              { label: 'Enterprise Integration Patterns — Messaging Patterns catalog (Gregor Hohpe)', url: 'https://www.enterpriseintegrationpatterns.com/patterns/messaging/' },
              { label: 'Better Stack — Logging Best Practices: The 13 You Should Know (article)', url: 'https://betterstack.com/community/guides/logging/logging-best-practices/' },
              { label: 'Uber Engineering — Real-Time Push Platform (blog)', url: 'https://www.uber.com/blog/real-time-push-platform/' },
            ],
            artifact: 'Event sourcing explainer: why FI uses it, problems it solves, what it costs',
          },
          {
            id: '4.13', title: 'CS Primitives 2.0', desc: 'Databases (SQL/NoSQL, indexes, transactions), backend/frontend language & framework choices, distributed systems (CAP, consistency, consensus), caching & scale', hours: 6, week: 'W5',
            done: 'Reason about why FI picked Postgres over Mongo for a given service; explain caching layers and consistency tradeoffs without engineering hand-holding',
            resources: [
              { label: 'Hussein Nasser — Fundamentals of Database Engineering (YouTube course, ~9h)', url: 'https://www.youtube.com/playlist?list=PLQnljOFTspQXjD0HOzN7P2tgzu7scWpl2' },
              { label: 'Use The Index, Luke! — SQL indexing tutorial (article)', url: 'https://use-the-index-luke.com/' },
              { label: 'ByteByteGo — System Design videos (YouTube)', url: 'https://www.youtube.com/@ByteByteGo/videos' },
              { label: 'Jepsen — Consistency Models (interactive article)', url: 'https://jepsen.io/consistency' },
              { label: 'Distributed Systems for Fun and Profit (mixu.net, free online book)', url: 'http://book.mixu.net/distsys/' },
              { label: 'Google SRE Book — Handling Overload + Load Balancing (free online)', url: 'https://sre.google/sre-book/handling-overload/' },
              { label: 'Dan Pritchett — BASE: An ACID Alternative (ACM Queue article)', url: 'https://queue.acm.org/detail.cfm?id=1394128' },
              { label: 'Redis — Introduction to Redis Data Types (docs)', url: 'https://redis.io/docs/latest/develop/data-types/' },
              { label: 'Discord Engineering — How Discord Stores Trillions of Messages (blog)', url: 'https://discord.com/blog/how-discord-stores-trillions-of-messages' },
              { label: 'Confluent — What is Change Data Capture? (article)', url: 'https://www.confluent.io/learn/change-data-capture/' },
              { label: 'PortSwigger Web Security Academy — Cross-site request forgery (CSRF, cookies, CORS)', url: 'https://portswigger.net/web-security/csrf' },
            ],
            artifact: 'FI backend cheatsheet: which service uses which DB, why; where caching sits; consistency guarantees for money movement vs KYC vs analytics',
          },
          {
            id: '4.14', title: 'Frontend & Mobile 101', desc: 'SPA vs SSR vs MPA, React/Next.js, state, PWA, native vs React Native/Flutter, mobile release cadence', hours: 5, week: 'W6',
            done: 'Read a frontend PR or mobile release plan and understand the tradeoffs; know when a PWA suffices vs when native is needed',
            resources: [
              { label: 'patterns.dev — Rendering Patterns (article)', url: 'https://www.patterns.dev/react/rendering-patterns' },
              { label: 'Next.js — "React Foundations" course (interactive)', url: 'https://nextjs.org/learn/react-foundations' },
              { label: 'Josh W. Comeau — Modern SPA alternatives (article)', url: 'https://www.joshwcomeau.com/react/modern-spa-alternatives/' },
              { label: 'Theo (t3.gg) — You should probably use React Server Components (YouTube)', url: 'https://www.youtube.com/watch?v=63S4VCn8FKI' },
              { label: 'web.dev — Progressive Web Apps overview (article)', url: 'https://web.dev/explore/progressive-web-apps' },
              { label: 'React Native — Introduction (docs)', url: 'https://reactnative.dev/docs/getting-started' },
            ],
            artifact: 'FI frontend map: web (SSR/SPA?), mobile (native/RN/PWA?), where state lives, offline requirements for transactions vs discovery',
          },
        ],
      },
      {
        name: 'SDLC Practice', topics: [
          {
            id: '4.4', title: 'SDLC Fundamentals', desc: 'Git, PRs, CI/CD, testing (unit/integration/e2e), deployment, monitoring', hours: 5, week: 'W5',
            done: 'Follow an engineer\'s workflow from ticket to production',
            resources: [
              { label: 'GitHub — Git Handbook', url: 'https://docs.github.com/en/get-started/using-git/about-git' },
              { label: 'Atlassian — CI/CD Pipeline explained', url: 'https://www.atlassian.com/continuous-delivery/ci-vs-ci-vs-cd' },
              { label: 'Fireship — CI/CD in 100 Seconds (YouTube)', url: 'https://www.youtube.com/watch?v=scEDHsr3APg' },
              { label: 'Martin Fowler — Continuous Integration', url: 'https://martinfowler.com/articles/continuousIntegration.html' },
              { label: 'Google SRE Book — Ch 1–3 (free online)', url: 'https://sre.google/sre-book/table-of-contents/' },
              { label: 'Learn Git Branching (interactive tutorial)', url: 'https://learngitbranching.js.org/' },
              { label: 'Oh Shit, Git!?! — recovery from common git mistakes', url: 'https://ohshitgit.com/' },
              { label: 'Google Engineering Practices — Code Review Developer Guide', url: 'https://google.github.io/eng-practices/review/' },
              { label: 'Dave Farley — What is Continuous Delivery? (YouTube, ~20 min)', url: 'https://www.youtube.com/watch?v=lNKcXdY5aOw' },
            ],
            artifact: 'SDLC lifecycle diagram: ticket → branch → PR → CI → staging → deploy → monitor',
          },
          {
            id: '4.5', title: 'AI-Augmented SDLC', desc: 'Claude Code, Cursor, Copilot, AI code review, AI testing', hours: 5, week: 'W6',
            done: 'Use AI dev tools daily and understand how they change engineering velocity',
            resources: [
              { label: 'Anthropic — Claude Code docs', url: 'https://docs.anthropic.com/en/docs/claude-code' },
              { label: 'Cursor — Getting Started', url: 'https://docs.cursor.com/get-started/introduction' },
              { label: 'GitHub Copilot — official docs', url: 'https://docs.github.com/en/copilot' },
              { label: 'The Pragmatic Engineer newsletter', url: 'https://newsletter.pragmaticengineer.com/' },
            ],
            artifact: 'AI dev tools comparison: Claude Code vs Cursor vs Copilot — when to use which',
          },
          {
            id: '4.12', title: 'Feature Flags & Gradual Rollouts', desc: 'Feature flags, canary releases, dark launches, A/B testing infra, gradual rollout strategies for AI features', hours: 3, week: 'W9',
            done: 'Design a rollout strategy for any AI feature that is safe, reversible, and measurable — before engineering asks',
            resources: [
              { label: 'Martin Fowler — Feature Toggles (Feature Flags)', url: 'https://martinfowler.com/articles/feature-toggles.html' },
              { label: 'LaunchDarkly — Feature flags best practices', url: 'https://launchdarkly.com/blog/feature-flag-best-practices/' },
              { label: 'Netflix Tech Blog — Canary deployments', url: 'https://netflixtechblog.com/automated-canary-analysis-at-netflix-with-kayenta-3260bc7acc69' },
              { label: 'Stripe Engineering — Gradual rollouts', url: 'https://stripe.com/blog/game-day' },
            ],
            artifact: 'Release plan for one FI AI feature: flag taxonomy, rollout cohorts (% of users), success metrics, rollback trigger criteria',
          },
        ],
      },
      {
        name: 'Data & Infrastructure', topics: [
          {
            id: '4.10', title: 'Cloud & Infrastructure Basics', desc: 'AWS/GCP/Azure, containers (Docker), orchestration (K8s basics), serverless vs containers, IaaS/PaaS/SaaS', hours: 4, week: 'W6',
            done: 'Reason about FI\'s infrastructure choices and cost/reliability/scalability tradeoffs without relying on engineering to explain everything',
            resources: [
              { label: 'AWS — Well-Architected Framework (white paper)', url: 'https://aws.amazon.com/architecture/well-architected/' },
              { label: 'Fireship — Docker in 100 Seconds (YouTube)', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ' },
              { label: 'Fireship — Kubernetes in 100 Seconds (YouTube)', url: 'https://www.youtube.com/watch?v=PziYflu8cB8' },
              { label: 'ByteByteGo — Cloud providers comparison (YouTube)', url: 'https://www.youtube.com/@ByteByteGo' },
              { label: 'The Cloud Resume Challenge — hands-on cloud primer', url: 'https://cloudresumechallenge.dev/' },
              { label: 'TechWorld with Nana — Docker Tutorial for Beginners (YouTube, ~3h)', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE' },
              { label: 'TechWorld with Nana — Kubernetes Tutorial for Beginners (YouTube, ~4h)', url: 'https://www.youtube.com/watch?v=X48VuDVv0do' },
            ],
            artifact: 'FI infrastructure map: what FI likely runs on, cost/reliability/scalability implication for each major component',
          },
          {
            id: '4.6', title: 'Data Infrastructure', desc: 'Data lakes, lakehouses, ETL/ELT, dbt, data lineage, observability', hours: 6, week: 'W7',
            done: 'Understand FI\'s data foundation section in the blueprint',
            resources: [
              { label: 'Databricks — What is a Lakehouse?', url: 'https://www.databricks.com/glossary/data-lakehouse' },
              { label: 'dbt Labs — What is dbt?', url: 'https://docs.getdbt.com/docs/introduction' },
              { label: 'ByteByteGo — ETL vs ELT (YouTube)', url: 'https://www.youtube.com/watch?v=VtzvF17ysbc' },
              { label: 'Atlan — Data Lineage 101', url: 'https://atlan.com/data-lineage/' },
              { label: 'AWS — OLAP vs OLTP: What\'s the difference? (article)', url: 'https://aws.amazon.com/compare/the-difference-between-olap-and-oltp/' },
            ],
            artifact: 'FI data architecture: operational DB → event store → lakehouse → analytics → ML',
          },
          {
            id: '4.7', title: 'Security & Compliance in SDLC', desc: 'Auth, encryption, DPDP, audit logging, pen testing', hours: 4, week: 'W6',
            done: 'Ask the right security questions in design reviews',
            resources: [
              { label: 'OWASP — Top 10 Web Application Security Risks', url: 'https://owasp.org/www-project-top-ten/' },
              { label: 'Auth0 — Authentication vs Authorization', url: 'https://auth0.com/docs/get-started/identity-fundamentals/authentication-and-authorization' },
              { label: 'MeitY — DPDP Act 2023 summary', url: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023' },
              { label: 'Nate Barbettini — OAuth 2.0 & OpenID Connect in Plain English (YouTube, 60 min)', url: 'https://www.youtube.com/watch?v=996OiexHze0' },
            ],
            artifact: 'Security checklist for any new FI feature: auth, PII, audit trail, DPDP',
          },
          {
            id: '4.11', title: 'Observability & SRE', desc: 'SLOs/SLIs/error budgets, three pillars (logs/metrics/traces), alerting, on-call, incident response', hours: 4, week: 'W8',
            done: 'Define SLOs for any FI feature and write an alerting strategy before the engineering team asks you what success looks like',
            resources: [
              { label: 'Google SRE Book — Ch 4–5: SLOs and Error Budgets (free online)', url: 'https://sre.google/sre-book/service-level-objectives/' },
              { label: 'Honeycomb — Observability vs monitoring (blog)', url: 'https://www.honeycomb.io/blog/observability-vs-monitoring' },
              { label: 'ByteByteGo — Logging vs Tracing vs Metrics (YouTube)', url: 'https://www.youtube.com/@ByteByteGo' },
              { label: 'Grafana Labs — The three pillars of observability', url: 'https://grafana.com/blog/2019/10/21/whats-next-for-observability/' },
              { label: 'PagerDuty — Incident Response guide', url: 'https://response.pagerduty.com/' },
              { label: 'OpenTelemetry — Concepts of Instrumentation (docs)', url: 'https://opentelemetry.io/docs/concepts/instrumentation/' },
              { label: 'TechWorld with Nana — Prometheus & Grafana Monitoring Tutorial (YouTube)', url: 'https://www.youtube.com/watch?v=h4Sl21AKiDg' },
            ],
            artifact: 'SLO spec for one FI feature: SLI definition, error budget, alert thresholds, on-call runbook outline',
          },
          {
            id: '4.8', title: 'LLM Deployment & Ops', desc: 'Hosting, inference costs, latency, guardrails, eval pipelines, A/B testing AI', hours: 6, week: 'W8',
            done: 'Bridge the gap between AI prototype and production AI',
            resources: [
              { label: 'Anthropic — API reference (rate limits, pricing)', url: 'https://docs.anthropic.com/en/api/getting-started' },
              { label: 'Hamel Husain — Your AI Product Needs Evals', url: 'https://hamel.dev/blog/posts/evals/' },
              { label: 'Eugene Yan — LLM Patterns in Production', url: 'https://eugeneyan.com/writing/llm-patterns/' },
              { label: 'Guardrails AI — docs', url: 'https://www.guardrailsai.com/docs' },
              { label: 'Langfuse — LLM observability (open source)', url: 'https://langfuse.com/' },
            ],
            artifact: 'Production AI checklist: cost model, latency budget, guardrails spec, eval pipeline',
          },
        ],
      },
    ],
  },
];

export const WEEKS: Week[] = [
  // ── Phase 1: AI Native PM + Finance 101 + AI SDLC (blended) ──────────────
  {
    week: 'W1',
    weekday: 'AI Fundamentals (1.1) + Transformers start (1.2) + CS Primitives start (4.1)',
    weekend: 'Finance Fundamentals start (2.1) + Indian Markets start (2.2)',
    artifacts: 'LLM one-pager',
  },
  {
    week: 'W2',
    weekday: 'Transformers complete (1.2) + Prompt Engineering (1.3) + CS Primitives complete (4.1)',
    weekend: 'Finance Fundamentals complete (2.1) + Indian Markets complete (2.2)',
    artifacts: 'Transformer diagram, Prompt library, Finance cheat sheet, Markets diagram',
  },
  {
    week: 'W3',
    weekday: 'RAG Deep Dive (1.4) + Agents start (1.5) + Architecture Patterns start (4.2)',
    weekend: 'MF Deep Dive (2.3)',
    artifacts: 'RAG architecture diagram, MF product cheat sheet',
  },
  {
    week: 'W4',
    weekday: 'Agents complete (1.5) + AI Product Sense (1.6) + Architecture Patterns complete (4.2)',
    weekend: 'Distribution Economics (2.4) + Event Sourcing start (4.3)',
    artifacts: 'Agent decision framework, Eval framework, FI architecture diagram, Revenue model diagram',
  },
  {
    week: 'W5',
    weekday: 'Multimodal & Doc AI (1.9) + SDLC Fundamentals (4.4) + CS Primitives 2.0 (4.13)',
    weekend: 'Wealth Products (2.5) + Event Sourcing complete (4.3)',
    artifacts: 'Document AI use case map, SDLC lifecycle diagram, Product comparison matrix, FI backend cheatsheet',
  },
  {
    week: 'W6',
    weekday: 'AI in Business Ops (1.7) + AI-Augmented SDLC (4.5) + Cloud & Infra (4.10) + Frontend & Mobile 101 (4.14)',
    weekend: 'Security & Compliance (4.7)',
    artifacts: 'AI ops map, AI dev tools comparison, FI infrastructure map, Security checklist, FI frontend map',
  },
  // ── Phase 2: FundsIndia Deep Dive ────────────────────────────────────────
  {
    week: 'W7',
    weekday: 'Wealthtech + FI Business Model (3.1) + Competitive Landscape (3.2) + WestBridge Thesis (3.3)',
    weekend: 'FI Entities E1–E5 (3.9) + Tech Stack & Vendors (3.5)',
    artifacts: 'Wealthtech + FI business model one-pager, Competitive 2x2 matrix + product-UX comparison, WestBridge thesis one-pager, Entity relationship diagram, Build vs buy map',
  },
  {
    week: 'W8',
    weekday: 'Blueprint Deep Read — 3 passes (3.4) + Transaction Lifecycle (3.8) + Investor Journeys J0–J14 (3.10)',
    weekend: 'V1 Build Strategy & Open Decisions (3.11)',
    artifacts: 'Blueprint strategy + entity + 20 Day-1 questions for Avijit, Transaction lifecycle diagram, Journey map — 15 flows summarised, V1 open-decisions one-pager ready for Day 1',
  },
  // ── Phase 3: Remaining AI Native PM + AI SDLC (pushed) ───────────────────
  {
    week: 'W9',
    weekday: 'Responsible AI (1.10) + AI Product Metrics (1.11) + Data Infrastructure (4.6)',
    weekend: 'Insurance & Tax (2.6) + Goal-Based Planning (2.7) + Regulatory Landscape (2.8)',
    artifacts: 'Responsible AI checklist, AI metrics spec, FI data architecture, Tax flowchart, Financial plan, Regulatory constraint map',
  },
  {
    week: 'W10',
    weekday: 'LLM Deployment & Ops (4.8) + Observability & SRE (4.11) + API Design & Contracts (4.9) + Feature Flags (4.12)',
    weekend: 'Hands-on Build (1.8)',
    artifacts: 'Production AI checklist, SLO spec, API integration spec, Feature flag release plan, Deployed portfolio monitor',
  },
];

export const ALL_TOPICS = TOPICS.flatMap(l1 => l1.categories.flatMap(c => c.topics));
export const TOTAL_HOURS = TOPICS.reduce((a, l) => a + l.hours, 0);

export const ONBOARDING_TOPICS: L1Track[] = [
  { id: 'l1', label: 'AI Native PM',    hours: 0, color: '#2D6A4F', accent: '#B7E4C7', categories: [] },
  { id: 'l2', label: 'Finance 101–103', hours: 0, color: '#1B4F72', accent: '#AED6F1', categories: [] },
  { id: 'l3', label: 'FundsIndia 101',  hours: 0, color: '#6B3FA0', accent: '#D7BDE2', categories: [] },
  { id: 'l4', label: 'AI SDLC 101–201', hours: 0, color: '#B7410E', accent: '#FAD7A0', categories: [] },
];

export function findTopicById(id: string) {
  return ALL_TOPICS.find(t => t.id === id) ?? null;
}

export function findTrackForTopic(topicId: string) {
  return TOPICS.find(l => l.categories.some(c => c.topics.some(t => t.id === topicId))) ?? null;
}
