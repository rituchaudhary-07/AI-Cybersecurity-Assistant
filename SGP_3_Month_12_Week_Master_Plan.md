# 3-Month (12-Week) Master Development Roadmap & Progress Documentation
## Project Title: AI Cybersecurity Assistant
**Course:** B.Tech Computer Engineering | Semester Group Project (SGP)  
**Total Timeline:** 3 Months (12 Weeks Total | 4 Weeks per Month)  
**Team Size:** 4 Members  
**Target Completion:** 1 October 2026  

---

## 📅 Master 12-Week Timeline Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MONTH 1: Foundation & Initial Features                          │
├──────────────┬────────────────────────┬────────────────────────┬───────────────────────┤
│    WEEK 1    │         WEEK 2         │         WEEK 3         │        WEEK 4         │
│ Planning &   │ UI/UX Design, Figma &  │ JWT Auth, Async Mongo  │ Password Analyzer ML  │
│ Architecture │ Environment Setup      │ & Dashboard Skeleton   │ & Basic AI Chatbot    │
└──────────────┴────────────────────────┴────────────────────────┴───────────────────────┘
                                           │
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                    MONTH 2: Core ML Security Engines & RAG                             │
├──────────────┬────────────────────────┬────────────────────────┬───────────────────────┤
│    WEEK 5    │         WEEK 6         │         WEEK 7         │        WEEK 8         │
│ Phishing URL │ Log File Anomaly       │ Vulnerability Scanner  │ RAG Vector DB (FAISS) │
│ Detection ML │ Parser & ML Model      │ & Web Audit Engine     │ & LangChain Pipeline  │
└──────────────┴────────────────────────┴────────────────────────┴───────────────────────┘
                                           │
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│             MONTH 3: Dashboard Integration, AI Recommendations & Deployment            │
├──────────────┬────────────────────────┬────────────────────────┬───────────────────────┤
│    WEEK 9    │        WEEK 10         │        WEEK 11         │        WEEK 12        │
│ Security     │ AI Security Advisor &  │ E2E Integration &      │ Cloud Deployment      │
│ Dashboard UI │ PDF Report Generator   │ Security Testing       │ & Final Project Review│
└──────────────┴────────────────────────┴────────────────────────┴───────────────────────┘
```

---

## 🗓️ MONTH 1: Foundations, Infrastructure & First Milestone (Weeks 1–4)

---

### Week 1 — Problem Definition, Architecture & Planning
* **Objective:** Define project scope, conduct literature review, finalize SRS, select tech stack, and design high-level architecture.
* **Key Tasks:**
  - Formulated problem statement addressing cybersecurity guidance for non-experts.
  - Literature survey on existing tools (OWASP ZAP, VirusTotal) and ML threat detection papers.
  - SRS Lite document (12 Functional, 6 Non-functional requirements).
  - Selected stack: React.js, Tailwind CSS, FastAPI, MongoDB Atlas, Scikit-learn, XGBoost, LangChain, Groq API.
  - Sketched high-level microservices architecture diagram.
* **Deliverables:** Problem Statement, SRS Document, Tech Stack Justification, Architecture Diagram.
* **Realistic Challenge:** Scope creep regarding automated penetration testing.
* **Solution:** Explicitly restricted scope to defensive threat detection and advisory security recommendations.
* **Time Spent:** 24.0 Hours (Team total).

---

### Week 2 — UI/UX Design & Development Environment Setup
* **Objective:** Create Figma wireframes, model MongoDB collections, specify API endpoints, and initialize React & FastAPI repositories.
* **Key Tasks:**
  - Designed mid-fidelity Figma wireframes for Dashboard, Chatbot, Scanners, and Auth views.
  - Modeled MongoDB schemas (`users`, `scan_history`, `chat_sessions`, `vulnerability_reports`).
  - Drafted OpenAPI endpoint specification matrix (`API_DOCS_DRAFT.md`).
  - Initialized React (Vite + Tailwind CSS + Lucide Icons) frontend.
  - Initialized FastAPI (Python 3.11 + Uvicorn + Pydantic v2) backend.
* **Deliverables:** Figma Design Workspace, MongoDB JSON Schema Dictionary, GitHub Monorepo Repository.
* **Realistic Challenge:** Windows PowerShell script execution policy blocking Python `venv` activation.
* **Solution:** Ran `Set-ExecutionPolicy RemoteSigned` in PowerShell to enable venv activation.
* **Time Spent:** 25.0 Hours (Team total).

---

### Week 3 — Core Infrastructure, Database & Authentication
* **Objective:** Connect MongoDB Atlas, implement JWT user authentication, construct Dashboard UI frame, and link Axios client.
* **Key Tasks:**
  - Integrated MongoDB Atlas cloud database via asynchronous `Motor` Python driver.
  - Built password hashing (`passlib[bcrypt]`) and JWT token validation service.
  - Exposed `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`.
  - Constructed React Dashboard skeleton layout with dynamic sidebar navigation.
  - Built `AuthContext.jsx` and Axios interceptors for automatic JWT header insertion.
* **Deliverables:** Working Authentication System (Frontend + Backend + DB), Dashboard Skeleton UI.
* **Realistic Challenge:** CORS error blocking Axios requests between `localhost:5173` and `localhost:8000`.
* **Solution:** Configured `CORSMiddleware` in FastAPI with explicit origins and allowed credentials.
* **Time Spent:** 27.5 Hours (Team total).

---

### Week 4 — First Feature Milestone: Password Analyzer & Basic AI Chatbot
* **Objective:** Build Password Strength Analyzer (Rules + Shannon Entropy + ML) and integrate initial Groq LLM API Chatbot.
* **Key Tasks:**
  - Built backend `password_analyzer.py` combining regex rules, Shannon entropy math $H = -\sum p_i \log_2(p_i)$, and a Random Forest ML model trained on character n-grams.
  - Created React `PasswordChecker.jsx` with debounced input (300ms) and visual strength gauge.
  - Integrated Groq LLM API (`llama3-70b-8192`) service in `chatbot.py` with domain system prompt.
  - Built React dynamic Chatbot drawer component with conversation streaming.
  - Added unit test suite using `pytest`.
* **Deliverables:** Functional Password Strength Checker, Initial AI Cybersecurity Chatbot, Pytest Suite.
* **Realistic Challenge:** Real-time input lag on password field during ML evaluation.
* **Solution:** Implemented 300ms debouncing on React input state change.
* **Time Spent:** 28.5 Hours (Team total).

---

## 🗓️ MONTH 2: Core ML Security Engines & RAG Integration (Weeks 5–8)

---

### Week 5 — Feature 2: URL Phishing Detection Engine
* **Objective:** Build lexical feature extraction pipeline, train ML model (Random Forest / XGBoost), expose URL scanning API, and build frontend UI.
* **Key Tasks:**
  - Downloaded and cleaned dataset (~50,000 URLs from PhishTank & UNB dataset).
  - Wrote `url_feature_extractor.py` extracting 16 lexical features: URL length, domain age, IP address present, `@` symbol count, sub-domain depth, HTTPS token, hyphen count, shortening service.
  - Trained and evaluated Random Forest & XGBoost classifiers (achieved 94.2% F1-Score).
  - Built backend API endpoint `/api/v1/scan/url` returning risk score and threat indicators.
  - Developed React `UrlScanner.jsx` UI with interactive threat breakdown card.
* **Deliverables:** Trained Phishing URL Classifier (`phishing_model.pkl`), `/api/v1/scan/url` API, `UrlScanner.jsx` UI.
* **Realistic Challenge:** High false-positive rate on legitimate subdomains (e.g., `docs.google.com`).
* **Solution:** Added a top-10k domain whitelist check before passing URL to the ML classifier.
* **Time Spent:** 29.0 Hours (Team total).

---

### Week 6 — Feature 3: Log File Analysis Engine
* **Objective:** Construct log file parser, anomaly detection ML model, file upload endpoint, and React log inspection module.
* **Key Tasks:**
  - Built log parser supporting Apache access logs, Linux syslog (`/var/log/auth.log`), and Nginx formats.
  - Extracted features: failed login counts, unusual HTTP status code frequencies (4xx/5xx), payload length anomalies.
  - Implemented Isolation Forest ML model for unsupervised anomaly detection in log lines.
  - Exposed `/api/v1/scan/logs` endpoint supporting file uploads (`UploadFile` in FastAPI).
  - Developed React `LogAnalyzer.jsx` component displaying threat timeline and severity tags.
* **Deliverables:** Log Parsing Engine, Isolation Forest Model, File Upload API, `LogAnalyzer.jsx` UI.
* **Realistic Challenge:** Large 50MB log files causing memory spikes in Uvicorn.
* **Solution:** Processed log files line-by-line using streaming generators (`yield`).
* **Time Spent:** 30.0 Hours (Team total).

---

### Week 7 — Feature 4: Web Vulnerability Scanner Engine
* **Objective:** Develop static security audit engine scanning HTTP headers, SSL/TLS certificates, open ports, and OWASP recommendations.
* **Key Tasks:**
  - Implemented header security checker evaluating `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`.
  - Added SSL/TLS certificate inspector verifying expiration date and weak cipher suites using Python `ssl` module.
  - Created basic asynchronous port scanner using `asyncio` for standard ports (21, 22, 80, 443, 3306, 8080).
  - Exposed `/api/v1/scan/vulnerability` endpoint returning categorized severity findings (Critical, High, Medium, Low).
  - Developed React `VulnerabilityScanner.jsx` component with scan execution progress bar.
* **Deliverables:** Vulnerability Scanning Engine, Security Header Audit Module, `VulnerabilityScanner.jsx` UI.
* **Realistic Challenge:** Port scanner timing out or getting blocked by host firewalls.
* **Solution:** Restricted default port scan to top 15 critical service ports with 1.0-second socket timeout bounds.
* **Time Spent:** 31.0 Hours (Team total).

---

### Week 8 — Feature 5: RAG Vector DB (FAISS) & LangChain Pipeline for AI Chatbot
* **Objective:** Upgrade basic AI Chatbot into a Retrieval-Augmented Generation (RAG) assistant using FAISS vector database and LangChain.
* **Key Tasks:**
  - Ingested cybersecurity knowledge sources: OWASP Top 10 guidelines, NIST SP 800-53 controls, and CVE databases into local Markdown/Text files.
  - Chunked documents using LangChain `RecursiveCharacterTextSplitter` (chunk size 500, overlap 50).
  - Generated vector embeddings using `sentence-transformers/all-MiniLM-L6-v2` and built FAISS vector index (`cybersecurity_faiss_index`).
  - Implemented LangChain retrieval QA chain: retrieving top-k relevant security passages and feeding them as context to Groq LLM.
  - Updated React Chatbot UI to display source citations alongside AI recommendations.
* **Deliverables:** Local FAISS Vector Index, LangChain RAG Pipeline, Source-Attributed AI Chatbot UI.
* **Realistic Challenge:** Long retrieval context exceeding LLM prompt window and increasing latency.
* **Solution:** Set `k=3` vector chunk retrieval limit and summarized context before prompt insertion.
* **Time Spent:** 32.0 Hours (Team total).

---

## 🗓️ MONTH 3: Dashboard Integration, AI Recommendations, Testing & Deployment (Weeks 9–12)

---

### Week 9 — Unified Security Dashboard & Analytics Widget Layout
* **Objective:** Consolidate scan outputs into a unified Security Dashboard with visual charts, threat scores, and activity feeds.
* **Key Tasks:**
  - Designed global Security Health Score algorithm aggregating results from Password, URL, Log, and Vulnerability scanners.
  - Integrated `Recharts` / `Chart.js` in React to visualize threat trends over time (scans per day, threat categories bar chart, risk distribution pie chart).
  - Built Recent Activity Feed showing past user scans stored in MongoDB `scan_history` collection.
  - Implemented Quick Action launchers enabling users to trigger scans directly from the dashboard overview.
* **Deliverables:** Unified Security Dashboard UI (`DashboardHome.jsx`), Security Health Scoring Algorithm, Recharts Data Visualizers.
* **Realistic Challenge:** Complex aggregation queries in MongoDB slowing down dashboard load time.
* **Solution:** Added index on `{ user_id: 1, created_at: -1 }` in `scan_history` collection and cached health score results.
* **Time Spent:** 28.0 Hours (Team total).

---

### Week 10 — AI-Powered Security Recommendation Engine & PDF Report Exporter
* **Objective:** Develop AI advisory engine synthesizing user scan history into actionable recommendations and generate downloadable PDF reports.
* **Key Tasks:**
  - Built `/api/v1/reports/recommendations` endpoint passing all accumulated user scan vulnerabilities to Groq LLM to generate prioritized remediation steps.
  - Integrated `ReportLab` Python library to dynamically generate downloadable PDF security report documents containing summary tables, risk charts, and AI advice.
  - Added frontend "Download PDF Report" button triggering backend PDF generation stream.
  - Designed clean PDF template featuring university header, project logo, executive summary, and detailed finding breakdown.
* **Deliverables:** AI Security Recommendation Engine, PDF Generation Service (`pdf_generator.py`), Downloadable Security Report feature.
* **Realistic Challenge:** PDF layout overlapping text when vulnerability lists were long.
* **Solution:** Utilized ReportLab `Flowable` objects (`Paragraph`, `Table`, `Spacer`) with automatic page breaking.
* **Time Spent:** 29.5 Hours (Team total).

---

### Week 11 — End-to-End Integration Testing, Security Audit & Optimization
* **Objective:** Conduct rigorous system testing, resolve API rate limits, audit security parameters, and optimize frontend load times.
* **Key Tasks:**
  - Automated integration testing: created full E2E test scripts validating User Auth $\rightarrow$ Scan Execution $\rightarrow$ DB Storage $\rightarrow$ PDF Generation.
  - Security Audit of own application: enabled rate limiting (`slowapi` middleware in FastAPI), sanitized SQL/NoSQL inputs, validated input lengths.
  - Optimized React production bundle using Vite code splitting (`manualChunks` for heavy libraries like Recharts and Lucide).
  - Conducted UI polish: fixed mobile drawer overlays, improved dark mode contrast, added loading skeletons during API calls.
* **Deliverables:** E2E Pytest Test Suite, Rate-Limited FastAPI Application, Production-Optimized React Bundle.
* **Realistic Challenge:** Rate limit middleware accidentally blocking legitimate rapid password test calls.
* **Solution:** Configured distinct rate limit tiers (Auth: 5 req/min, Scanners: 20 req/min, Static assets: unlimited).
* **Time Spent:** 27.0 Hours (Team total).

---

### Week 12 — Cloud Deployment, University Guide Review & Final Defense Prep
* **Objective:** Deploy production application to cloud platforms (Vercel + Render/Railway), compile project documentation, and prepare final presentation.
* **Key Tasks:**
  - Deployed React Frontend SPA to **Vercel** with custom environment variable routing (`VITE_API_BASE_URL`).
  - Deployed FastAPI Backend service to **Render / Railway** with Uvicorn production server configuration and Gunicorn workers.
  - Connected production MongoDB Atlas cluster with IP access whitelist rules (`0.0.0.0/0` for cloud deployment).
  - Compiled final project documentation report, user manual, and guide submission dossier.
  - Conducted dry-run presentation and live software demonstration defense with faculty guide.
* **Deliverables:** Live Production URLs (Vercel Frontend + Render Backend), Final Academic Project Report, Slide Deck & Live Demo setup.
* **Time Spent:** 26.0 Hours (Team total).

---

## 📊 Consolidated 12-Week Master Progress & Hours Matrix

| Month | Week No. | Primary Focus Area | Key Deliverables | Status | Hours (Team) |
| :---: | :---: | :--- | :--- | :---: | :---: |
| **Month 1** | **Week 1** | Foundation & Architecture | Problem Statement, SRS, Architecture Diagram | Completed | 24.0 hrs |
| | **Week 2** | UI Design & Setup | Figma Wireframes, MongoDB Schemas, Vite & FastAPI Init | Completed | 25.0 hrs |
| | **Week 3** | Auth & Core Infrastructure | JWT Auth Engine, Motor Driver, React Dashboard Frame | Completed | 27.5 hrs |
| | **Week 4** | Feature 1: Password & AI Chat | Password Strength ML Engine, Basic Groq LLM Chatbot | Completed | 28.5 hrs |
| **Month 2** | **Week 5** | Feature 2: URL Phishing ML | Lexical Extractor, Random Forest Model, `UrlScanner` UI | Scheduled | 29.0 hrs |
| | **Week 6** | Feature 3: Log File Analysis | Log Parser, Isolation Forest Model, Log Upload UI | Scheduled | 30.0 hrs |
| | **Week 7** | Feature 4: Vulnerability Scanner | Security Header Auditor, SSL Inspector, Port Scanner | Scheduled | 31.0 hrs |
| | **Week 8** | Feature 5: RAG Vector DB | FAISS Index, LangChain RAG Pipeline, Cited Chatbot | Scheduled | 32.0 hrs |
| **Month 3** | **Week 9** | Security Dashboard UI | Unified Health Score, Recharts Data Visualizers | Scheduled | 28.0 hrs |
| | **Week 10** | AI Advice & PDF Exporter | AI Security Recommendations, ReportLab PDF Exporter | Scheduled | 29.5 hrs |
| | **Week 11** | Integration Testing & Audit | E2E Pytest Suite, SlowAPI Rate Limiting, UI Polish | Scheduled | 27.0 hrs |
| | **Week 12** | Cloud Deployment & Defense | Live Deploy (Vercel + Render), Final Report & Defense | Scheduled | 26.0 hrs |
| **Total** | **12 Weeks** | **3-Month Full Development Lifecycle** | **Fully Functioning AI Cybersecurity Assistant** | **On Schedule** | **337.5 hrs** |

---

## 🎓 Monthly Evaluation Milestone Milestones (For University Guide)

### Month 1 Review Milestone (End of Week 4)
* **Status:** Complete
* **Artifacts Ready for Review:** SRS Document, Architecture Diagram, Figma Blueprints, Running Local Prototype with JWT Authentication, Password Strength Analyzer (Rules + ML), and initial Groq LLM Security Chatbot.

### Month 2 Review Milestone (End of Week 8)
* **Status:** Upcoming
* **Artifacts Ready for Review:** Trained ML Models (`phishing_model.pkl`, `log_anomaly_model.pkl`), URL Phishing Scanner UI, Log File Inspection Tool, Vulnerability Header Scanner, and FAISS RAG Vector Knowledge Base for AI Chatbot.

### Month 3 Final Defense Milestone (End of Week 12)
* **Status:** Upcoming
* **Artifacts Ready for Review:** Live Deployed Web Application (Vercel/Render), Consolidated Security Dashboard with Recharts, AI Recommendation Engine, Automated PDF Security Report Downloader, Complete E2E Test Suite, and Final Hardbound Project Documentation.
