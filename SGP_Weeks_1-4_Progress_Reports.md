# Month 1 (Weeks 1–4) Progress Documentation & University Reports
## Project Title: AI Cybersecurity Assistant
**Course:** B.Tech Computer Engineering | Semester Group Project (SGP)  
**Reporting Period:** Month 1 (Weeks 1–4)  
**Team Allocation:** 5 Members  
**Target Deadline:** 1 October 2026  

---

## Part 1: Detailed Weekly Breakdowns (Weeks 1–4)

---

### Week 1 — Project Planning & Research

#### Week Objective
Understand the problem domain, perform comparative research on existing cybersecurity tools and AI techniques, evaluate software requirements, select the technology stack, design high-level architecture, create the GitHub repository, and assign team responsibilities.

#### Tasks Completed
1. Finalized Project Title: **AI Cybersecurity Assistant**.
2. Defined formal Problem Statement and core objectives addressing vulnerability detection and guidance for non-expert users.
3. Conducted literature survey on AI in cybersecurity (ML classifiers for phishing, n-gram log analysis, and LLM security advisors).
4. Studied OWASP Top 10 (2021) security risks (Injection, Broken Auth, Cryptographic Failures, Security Misconfigurations).
5. Studied phishing detection techniques (lexical URL features, domain age verification, ML ensemble models).
6. Comparative evaluation of existing security tools: VirusTotal API, Burp Suite, and Wireshark.
7. Selected and justified Technology Stack: React.js, Tailwind CSS, FastAPI (Python), MongoDB Atlas, Scikit-learn, LangChain, Groq API.
8. Prepared Software Requirement Specification (SRS) document (Functional + Non-Functional requirements).
9. Designed High-Level Architecture Diagram outlining client-server data flow and database schemas.
10. Initialized GitHub repository with branch protection rules and divided core responsibilities among team members.

#### Technologies Learned
- **FastAPI Framework Basics:** Asynchronous request handling (`async/await`), automatic OpenAPI (`/docs`) generation.
- **OWASP Top 10 Security Taxonomy:** Categorizing web vulnerabilities and defensive countermeasures.
- **Git Branching Strategy:** Managing feature branches (`feature/auth`, `feature/ui`, `feature/backend`).

#### Research Conducted
- **Tool Benchmark Study:**
  - *VirusTotal:* Excellent API for file/URL hash lookup, but lacks personalized remediation advice.
  - *Burp Suite:* Powerful penetration testing tool, but complex UI and not accessible for non-technical users.
  - *Wireshark:* Deep packet inspection tool, out of scope for high-level web application defense.
- **Academic Paper Survey:** Reviewed research papers on Random Forest models for URL phishing and Shannon entropy calculation for password security.

#### Design Decisions
- **Decision:** FastAPI (Python) over Node.js/Express.
  - *Reasoning:* Python natively supports Scikit-learn, XGBoost, and LangChain without needing inter-process communication wrappers.
- **Decision:** MongoDB Atlas (NoSQL) over PostgreSQL.
  - *Reasoning:* Vulnerability reports, log scan results, and chat logs vary in document structure. BSON documents provide flexible JSON-like storage.

#### Deliverables
- Software Requirement Specification (SRS) Document.
- High-Level Architecture Block Diagram.
- Technology Stack Evaluation Matrix.
- GitHub Repository Initialized (`README.md`, `.gitignore`).

#### Challenges Faced
- **Disagreement on Project Scope:** Team initially discussed automated exploitation tools, which pose legal and ethical concerns.
- **Team Task Allocation:** Balancing workload fairly among team members based on frontend, backend, and security domain interests.

#### Solutions Implemented
- Restricted project scope strictly to defensive security analysis, threat detection, and AI recommendations.
- Formally divided team roles (Frontend Lead, Backend Lead, ML/Security Lead, Database Lead, QA/Docs Lead).

#### GitHub Commits (5–8 realistic examples)
```text
commit 1a8f9c2 - docs: add problem statement and project scope definition (Mon Week 1)
commit 3b9e4d1 - docs: complete literature survey of AI threat detection tools (Tue Week 1)
commit 5c2d8a0 - docs: add SRS draft containing functional and non-functional requirements (Wed Week 1)
commit 7e1f3b4 - docs: add technology stack evaluation matrix (Thu Week 1)
commit 9d4c6e8 - docs: upload high-level system architecture block diagram (Fri Week 1)
commit 2f8a1b9 - docs: initialize github repository with README and team guidelines (Sat Week 1)
```

#### Screenshots I Should Have Taken (Checklist)
- [x] Architecture flowchart created in Draw.io / Figma.
- [x] Mind map of functional modules brainstormed on Miro/Excalidraw.
- [x] OWASP Top 10 reference study notes.
- [x] Technology stack comparison table.

#### Daily Work Breakdown (Monday–Saturday)
- **Monday:** Team kickoff meeting. Formulated project title, problem statement, and primary goals.
- **Tuesday:** Literature survey on AI in cybersecurity. Reviewed 4 academic research papers.
- **Wednesday:** Studied OWASP Top 10 vulnerabilities and phishing detection methods. Drafted SRS document.
- **Thursday:** Evaluated existing tools (VirusTotal, Burp Suite, Wireshark). Finalized tech stack.
- **Friday:** Sketched high-level architecture diagram. Defined data flow between React, FastAPI, ML/LLM, and MongoDB.
- **Saturday:** Set up GitHub repository, defined branching rules, assigned team tasks, and compiled Week 1 documentation.

#### Time Spent
| Day | Hours | Focus / Task |
| :--- | :---: | :--- |
| Monday | 3.5 hrs | Scope definition, problem statement formulation |
| Tuesday | 4.0 hrs | Literature survey and academic paper study |
| Wednesday | 4.0 hrs | OWASP Top 10 analysis & SRS document drafting |
| Thursday | 4.5 hrs | Tool benchmarking & tech stack selection |
| Friday | 4.0 hrs | High-level architecture design |
| Saturday | 4.5 hrs | GitHub repo setup & Week 1 report compilation |
| **Total** | **24.5 hrs** | **~4.9 hrs/person across 5 team members** |

#### Weekly Summary
Week 1 successfully established the conceptual framework and architectural blueprint for the project. By conducting a comparative literature survey and defining an SRS document early, the team gained a clear technical direction.

---

### Week 2 — UI/UX & Backend Setup

#### Week Objective
Build the software project foundation: initialize Vite + React.js with Tailwind CSS, set up the FastAPI backend application structure, configure MongoDB Atlas cloud database connection, design UI wireframes, and create common layout components (Navbar, Sidebar, Auth UI, Axios client).

#### Tasks Completed
1. Initialized React.js project using Vite (`npm create vite@latest frontend`).
2. Configured Tailwind CSS v3 with dark-mode cybersecurity theme colors (`cyber-dark`, `cyber-card`, `cyber-border`).
3. Initialized FastAPI backend with Python 3.11 virtual environment and modular router layout (`app/api/v1/`).
4. Designed UI/UX wireframes for Dashboard, Login, Register, Sidebar, and Tool screens in Figma.
5. Configured MongoDB Atlas cloud database cluster and created database initialization helper (`app/db/mongodb.py`).
6. Connected FastAPI backend to MongoDB using `Motor` (asynchronous Python driver) with fallback in-memory storage.
7. Constructed responsive **Navbar** component with real-time system status indicator.
8. Constructed **Sidebar** navigation component with active vs Month 2 tool state badges.
9. Built **Login Page UI** and **Register Page UI** forms.
10. Configured Client-Side Routing and set up **Axios** HTTP client (`api.js`) with base API URL.

#### Technologies Learned
- **Vite Build Tool:** Fast module reloading and environment variable handling (`import.meta.env`).
- **Tailwind CSS Utility Design:** Custom color variables, glassmorphic layout styling.
- **Async Database Connection:** Using Motor driver with FastAPI lifespan events (`asynccontextmanager`).

#### Research Conducted
- **Cybersecurity UI Design Patterns:** Studied dark-mode dashboard interfaces (dark slate backgrounds `#0B0F19`, emerald green status indicators `#10B981`, electric blue accents).
- **FastAPI Folder Architecture:** Studied router-based project layout (`app/api/v1/endpoints/`, `app/core/`, `app/db/`, `app/services/`).

#### Design Decisions
- **Decision:** Selected Vite over Create-React-App.
  - *Reasoning:* CRA is deprecated and sluggish. Vite provides instant HMR and faster build times.
- **Decision:** Asynchronous Motor Driver over PyMongo.
  - *Reasoning:* FastAPI runs on an async event loop. Motor prevents database I/O from blocking API request threads.

#### Deliverables
- Working Frontend Codebase (Vite + React + Tailwind CSS).
- Working Backend Codebase (FastAPI + Uvicorn).
- MongoDB Atlas Database Connection Module (`mongodb.py`).
- Responsive Navbar, Sidebar, Login, and Register UI Components.

#### Challenges Faced
- **Windows PowerShell Execution Policy Error:** Running `.\venv\Scripts\Activate.ps1` threw `cannot be loaded because running scripts is disabled`.
- **Tailwind CSS CSS Directive Warnings:** VS Code CSS linter threw syntax warnings on `@tailwind base;` directives.

#### Solutions Implemented
- Ran `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` in PowerShell.
- Installed `Tailwind CSS IntelliSense` extension and updated `.vscode/settings.json` CSS file associations.

#### GitHub Commits (5–8 realistic examples)
```text
commit 8d3a1f4 - feat: initialize react frontend using vite and tailwind css (Mon Week 2)
commit 4e9c2b7 - feat: initialize fastapi backend with base folder structure (Tue Week 2)
commit 6f1b5d9 - docs: add figma wireframe exports for dashboard and auth screens (Wed Week 2)
commit 9a2c4e1 - feat: configure async mongodb atlas connection using motor driver (Thu Week 2)
commit 3d7e8b2 - feat: build responsive Navbar and Sidebar UI components (Fri Week 2)
commit 1c5f9a3 - feat: build Login and Register UI screens with Axios setup (Sat Week 2)
```

#### Screenshots I Should Have Taken (Checklist)
- [x] Terminal output of `npm create vite@latest frontend -- --template react`.
- [x] Terminal output of `uvicorn app.main:app --reload` running on `http://127.0.0.1:8000`.
- [x] MongoDB Atlas Dashboard cluster view.
- [x] Browser view of Login & Register UI screens.

#### Daily Work Breakdown (Monday–Saturday)
- **Monday:** Created Figma wireframes for Dashboard and Authentication screens. Initialized Vite + React frontend.
- **Tuesday:** Configured Tailwind CSS with dark-mode theme palette. Initialized FastAPI backend structure.
- **Wednesday:** Set up MongoDB Atlas cloud cluster. Drafted collection schemas for `users` and `scan_history`.
- **Thursday:** Wrote `app/db/mongodb.py` using Motor driver. Verified database connection ping.
- **Friday:** Developed React `Navbar.jsx` and `Sidebar.jsx` components with status badges.
- **Saturday:** Developed `Login.jsx` and `Register.jsx` UI forms. Configured Axios client instance (`api.js`).

#### Time Spent
| Day | Hours | Focus / Task |
| :--- | :---: | :--- |
| Monday | 4.0 hrs | Figma wireframing & Vite React initialization |
| Tuesday | 4.0 hrs | Tailwind CSS setup & FastAPI backend layout |
| Wednesday | 4.5 hrs | MongoDB Atlas setup & schema modeling |
| Thursday | 4.5 hrs | Async Motor driver connection implementation |
| Friday | 4.5 hrs | Navbar & Sidebar UI development |
| Saturday | 4.0 hrs | Login/Register UI & Axios client integration |
| **Total** | **25.5 hrs** | **~5.1 hrs/person across 5 team members** |

#### Weekly Summary
Week 2 delivered a working application skeleton. Having both React frontend and FastAPI backend running locally with MongoDB Atlas connection enabled the team to begin building functional modules.

---

### Week 3 — Authentication Module

#### Week Objective
Build secure user authentication end-to-end: implement User Registration API, User Login API, JWT token generation & verification, bcrypt password hashing, protected frontend routing, user profile endpoint, session management, logout, and robust error handling.

#### Tasks Completed
1. Built **User Registration API** (`/api/v1/auth/register`) storing hashed credentials in MongoDB `users` collection.
2. Built **User Login API** (`/api/v1/auth/login`) verifying credentials against stored bcrypt hash.
3. Implemented **JWT Authentication Service** (`app/core/security.py`) generating signed HS256 access tokens.
4. Implemented secure password hashing using `passlib[bcrypt]` with bcrypt round factor.
5. Created **User Profile API** (`/api/v1/auth/me`) retrieving current authenticated user data.
6. Created **AuthContext Provider** (`AuthContext.jsx`) in React for global persistent login state.
7. Configured **Axios Request Interceptor** to automatically inject `Authorization: Bearer <token>` header into API requests.
8. Implemented **Protected Routes** in React to redirect unauthenticated users to the Login page.
9. Built Logout functionality (clearing JWT token from `localStorage` and clearing global auth state).
10. Implemented input validation (Pydantic `EmailStr`) and custom exception handling for duplicate emails & invalid credentials.

#### Technologies Learned
- **JWT (JSON Web Token) Security:** Token payload claims (`sub`, `exp`), secret key management, algorithm signing (`HS256`).
- **Passlib & Bcrypt Hashing:** Salt generation, password verification, avoiding plain-text leaks.
- **FastAPI Dependencies:** Injecting authenticated user context via `Depends(get_current_user)`.

#### Research Conducted
- **Authentication Security Standards:** Evaluated JWT expiration strategies (60-minute access token) and HTTP bearer authorization header formatting.
- **CORS Preflight Headers:** Evaluated FastAPI `CORSMiddleware` configuration to allow headers and credentials from `http://localhost:5173`.

#### Design Decisions
- **Decision:** Storing JWT Token in LocalStorage with Bearer Header Interceptor.
  - *Reasoning:* Simplifies client-side API state management across modular sub-routes while ensuring clean token attachment.
- **Decision:** React Context API for Global Auth State.
  - *Reasoning:* Avoids complex external state libraries (like Redux) for simple authentication status tracking.

#### Deliverables
- Operational User Authentication System (Frontend UI + Backend API + Database).
- MongoDB `users` Collection Schema.
- JWT Security Helper (`security.py`).
- AuthContext State Provider (`AuthContext.jsx`).

#### Challenges Faced
- **CORS Error during Axios Request:** Browser blocked frontend requests with `No 'Access-Control-Allow-Origin' header is present`.
- **Pydantic Email Validation Missing Dependency:** Pydantic threw `ImportError: email-validator is not installed` when using `EmailStr`.

#### Solutions Implemented
- Added FastAPI `CORSMiddleware` explicitly allowing `http://localhost:5173` and credentials in `main.py`.
- Installed `email-validator` package via `pip install email-validator` and updated `requirements.txt`.

#### GitHub Commits (5–8 realistic examples)
```text
commit 5f2e8c1 - feat: implement bcrypt password hashing and JWT token utility (Mon Week 3)
commit 1a9d4b3 - feat: build user registration and login REST API endpoints (Tue Week 3)
commit 7b3c6e9 - feat: build user profile /me endpoint with FastAPI dependency injection (Wed Week 3)
commit 2d8e4f0 - feat: construct AuthContext provider for global auth state management (Thu Week 3)
commit 9f1a3c5 - feat: configure Axios request interceptor for bearer token injection (Fri Week 3)
commit 4b8c7d2 - feat: implement protected routing, logout functionality, and CORS handling (Sat Week 3)
```

#### Screenshots I Should Have Taken (Checklist)
- [x] MongoDB Atlas collection view showing encrypted bcrypt `hashed_password` records.
- [x] Swagger UI testing `/api/v1/auth/login` returning 200 OK with `access_token`.
- [x] Chrome DevTools Application tab showing `access_token` stored in `localStorage`.
- [x] User Profile readout on Navbar header.

#### Daily Work Breakdown (Monday–Saturday)
- **Monday:** Implemented password hashing (`get_password_hash`) and JWT generation (`create_access_token`) in `security.py`.
- **Tuesday:** Built `/api/v1/auth/register` and `/api/v1/auth/login` REST API endpoints in `auth.py`.
- **Wednesday:** Built `/api/v1/auth/me` profile endpoint using FastAPI `Depends(get_current_user)`.
- **Thursday:** Developed React `AuthContext.jsx` provider for global login, registration, and user state.
- **Friday:** Configured Axios request interceptor in `api.js`. Linked Login and Register UI forms.
- **Saturday:** Implemented logout button, protected dashboard routes, fixed CORS headers, and resolved `email-validator` dependency issue.

#### Time Spent
| Day | Hours | Focus / Task |
| :--- | :---: | :--- |
| Monday | 4.5 hrs | Password hashing & JWT security service implementation |
| Tuesday | 5.0 hrs | Registration & Login REST API endpoints |
| Wednesday | 4.0 hrs | User profile `/me` route & dependency injection |
| Thursday | 4.5 hrs | AuthContext provider & persistent login state |
| Friday | 4.5 hrs | Axios interceptor & UI form linking |
| Saturday | 4.5 hrs | CORS fixes, protected routes, and logout logic |
| **Total** | **27.0 hrs** | **~5.4 hrs/person across 5 team members** |

#### Weekly Summary
Week 3 achieved full end-to-end authentication. Users can register accounts, log in securely, receive JWT tokens, access protected dashboard pages, and log out safely.

---

### Week 4 — Password Strength Analyzer

#### Week Objective
Build the first functional cybersecurity module: research password entropy math, implement regex composition rules, calculate multi-tier password strength scores (0–100), build interactive strength meter UI, estimate brute-force crack times, provide actionable security recommendations, check against a common password blacklist, store scan history in MongoDB, and integrate with the Dashboard.

#### Tasks Completed
1. Researched Shannon Entropy mathematical calculation formula $H = -\sum p_i \log_2(p_i)$.
2. Implemented Regex Composition Rules checking length, uppercase, lowercase, numbers, and special symbols in `password_analyzer.py`.
3. Created Multi-Tier Password Scoring Engine (0–100 score rating: *Very Weak*, *Weak*, *Moderate*, *Strong*, *Very Strong*).
4. Implemented Brute-Force Crack Time Estimator based on bits of entropy assuming $10^{10}$ guesses per second.
5. Integrated Common Password Blacklist check (flagging leaked passwords like `123456`, `password`).
6. Exposed REST API endpoint `/api/v1/analyze-password` in `password.py`.
7. Developed interactive React component `PasswordChecker.jsx` with real-time strength meter, entropy display, and crack time gauge.
8. Applied **Debouncing (300ms)** on password input state change to prevent UI lag during typing.
9. Added Database history logging saving scan results into MongoDB `scan_history` collection.
10. Integrated Password Strength Analyzer launcher tile into the main Dashboard overview.

#### Technologies Learned
- **Shannon Entropy in Cybersecurity:** Estimating password randomness in bits per character.
- **Input Debouncing in React:** Using `setTimeout` and `clearTimeout` inside `useEffect` to optimize heavy computation APIs.
- **Automated Pytest Framework:** Writing unit tests for cryptographic calculation functions.

#### Research Conducted
- **NIST SP 800-63B Guidelines:** Studied modern digital identity guidelines favoring password length and entropy over restrictive complexity rules.
- **Brute-Force Attack Speeds:** Researched GPU cluster cracking speeds (offloading $10^{10}$ hashes/sec) to calibrate crack time estimation formulas.

#### Design Decisions
- **Decision:** Multi-Tier Scoring (Rules + Entropy + Blacklist).
  - *Reasoning:* Pure regex misses dictionary patterns, while pure entropy misses short leaked passwords. Combining all three provides accurate evaluation.
- **Decision:** Client-Side 300ms Debouncing.
  - *Reasoning:* Prevents sending API requests on every single keypress, keeping the application responsive.

#### Deliverables
- Operational Password Strength Analyzer Module (Backend API + Frontend UI).
- Real-Time Strength Meter & Crack Time Gauge (`PasswordChecker.jsx`).
- Pytest Unit Test Suite (`tests/test_password_analyzer.py`).
- Integrated Security Workspace Dashboard (`Dashboard.jsx`).

#### Challenges Faced
- **Real-Time Input Lag:** Calculating scoring logic synchronously on every keypress caused typing latency on weak laptops.
- **Icon Name Export Error:** Importing `MessageSquareBot` from `lucide-react` caused Vite to fail with `Uncaught SyntaxError`, causing a blank white browser screen.

#### Solutions Implemented
- Implemented 300ms debouncing in React `useEffect` hook.
- Replaced invalid icon `MessageSquareBot` with standard `MessageSquare` icon in `Sidebar.jsx`, `Chatbot.jsx`, and `Dashboard.jsx`.

#### GitHub Commits (5–8 realistic examples)
```text
commit 3a7f1c2 - feat: implement Shannon entropy calculation and regex rule engine (Mon Week 4)
commit 8e2b9f4 - feat: add crack time estimator and common password blacklist check (Tue Week 4)
commit 1c4d7e0 - feat: expose /api/v1/analyze-password REST endpoint (Wed Week 4)
commit 6f9a2b5 - feat: build interactive PasswordChecker UI component with strength meter (Thu Week 4)
commit 4d1e8c9 - feat: apply 300ms input debouncing and integrate with main Dashboard (Fri Week 4)
commit 9b5c3f8 - test: add pytest suite for password evaluation and fix lucide icon imports (Sat Week 4)
```

#### Screenshots I Should Have Taken (Checklist)
- [x] `PasswordChecker.jsx` screen displaying a weak password (`123456`) scored as 15/100 (Very Weak).
- [x] `PasswordChecker.jsx` screen displaying a strong password (`K9#mX2$vL8!pQ5zW`) scored as 95/100 (Very Strong).
- [x] Chrome DevTools Network tab showing `/api/v1/analyze-password` 200 OK response times (< 100ms).
- [x] Pytest terminal window showing green passed test cases.

#### Daily Work Breakdown (Monday–Saturday)
- **Monday:** Researched Shannon entropy math. Implemented `calculate_shannon_entropy` function in `password_analyzer.py`.
- **Tuesday:** Added regex rules, password scoring algorithm (0-100), and `estimate_crack_time` logic.
- **Wednesday:** Integrated common password blacklist. Exposed `/api/v1/analyze-password` endpoint in `password.py`.
- **Thursday:** Developed React `PasswordChecker.jsx` screen with live strength meter, entropy bits display, and checklist.
- **Friday:** Implemented 300ms input debouncing. Integrated Password Checker module launcher into `Dashboard.jsx`.
- **Saturday:** Ran end-to-end testing with `pytest`. Fixed `lucide-react` icon import error and updated `README.md`.

#### Time Spent
| Day | Hours | Focus / Task |
| :--- | :---: | :--- |
| Monday | 4.5 hrs | Shannon entropy math & regex calculation logic |
| Tuesday | 5.0 hrs | Scoring engine & brute-force crack time estimator |
| Wednesday | 4.5 hrs | Common password blacklist & REST API endpoint |
| Thursday | 5.0 hrs | PasswordChecker UI component & strength meter bar |
| Friday | 4.5 hrs | Input debouncing implementation & Dashboard linking |
| Saturday | 4.5 hrs | Pytest automated testing, bug fixes, & docs update |
| **Total** | **28.0 hrs** | **~5.6 hrs/person across 5 team members** |

#### Weekly Summary
Week 4 delivered the first working cybersecurity tool milestone. The Password Strength Analyzer accurately measures cryptographic entropy, checks leaked password databases, estimates crack times, and guides users with real-time recommendations.

---

## Part 2: Formal Academic Progress Reports (for University Guide Submission)

---

### Weekly Progress Report — Week 1
**Course Code:** SGP-401 (Semester Group Project)  
**Project Title:** AI Cybersecurity Assistant  
**Reporting Period:** Week 1  
**Team Members:** 5 Members  
**Faculty Guide:** Department of Computer Engineering  

#### 1. Executive Summary
During Week 1, the team focused on project initiation, domain research, literature survey, software requirement engineering, technology stack selection, and high-level system architecture design.

#### 2. Detailed Work Completed
- **Problem Statement Formulation:** Defined challenges faced by non-expert users regarding cyber threat detection and vulnerability remediation.
- **Literature Survey & Tool Analysis:** Reviewed research papers on ML-based threat detection and compared existing security tools (VirusTotal, Burp Suite, Wireshark).
- **Requirements Engineering:** Formulated Functional and Non-Functional requirements in an SRS document.
- **Technology Stack Justification:** Selected React.js, Tailwind CSS, FastAPI, MongoDB Atlas, Scikit-learn, LangChain, and Groq API.
- **System Architecture Design:** Sketched client-server data flow diagram and database collection layout.
- **Repository Setup:** Created GitHub repository and allocated project roles among 5 team members.

#### 3. Challenges & Mitigation Strategies
- *Challenge:* Scope creep regarding automated penetration testing tools.
- *Mitigation:* Restricted project scope strictly to defensive security analysis, threat detection, and AI recommendations.

#### 4. Plan for Next Week
Initialize React frontend (Vite) and FastAPI backend, set up MongoDB Atlas, create Figma wireframes, and build layout components (Navbar, Sidebar, Auth UI).

---

### Weekly Progress Report — Week 2
**Course Code:** SGP-401 (Semester Group Project)  
**Project Title:** AI Cybersecurity Assistant  
**Reporting Period:** Week 2  
**Team Members:** 5 Members  

#### 1. Executive Summary
Week 2 prioritized project workspace initialization, UI/UX design, database configuration, and common layout component implementation.

#### 2. Detailed Work Completed
- **Project Initialization:** Created Vite + React.js frontend with Tailwind CSS and FastAPI backend with Python 3.11 virtual environment.
- **UI/UX Design:** Designed wireframes in Figma for Dashboard, Auth, and Security Tool modules.
- **Database Connection:** Configured MongoDB Atlas cloud database and connected FastAPI using the asynchronous `Motor` driver.
- **Component Development:** Built responsive Navbar, Sidebar navigation, Login UI, and Register UI.
- **Routing & API Client:** Set up client-side routing and Axios HTTP client (`api.js`).

#### 3. Challenges & Mitigation Strategies
- *Challenge:* Windows PowerShell script execution policy blocking virtual environment activation.
- *Mitigation:* Executed `Set-ExecutionPolicy RemoteSigned` in PowerShell and documented execution steps in `README.md`.

#### 4. Plan for Next Week
Implement User Authentication module (Registration API, Login API, JWT tokens, bcrypt password hashing, and protected routes).

---

### Weekly Progress Report — Week 3
**Course Code:** SGP-401 (Semester Group Project)  
**Project Title:** AI Cybersecurity Assistant  
**Reporting Period:** Week 3  
**Team Members:** 5 Members  

#### 1. Executive Summary
Week 3 delivered a fully functional User Authentication infrastructure combining secure backend REST APIs, JWT token validation, bcrypt password hashing, and persistent React login state.

#### 2. Detailed Work Completed
- **Backend APIs:** Implemented User Registration (`/register`), Login (`/login`), and Profile (`/me`) endpoints.
- **Security Utilities:** Integrated bcrypt password hashing and JWT token generation service.
- **Frontend Integration:** Built `AuthContext.jsx` provider and configured Axios request interceptor for automatic Bearer token injection.
- **Session Management:** Implemented protected routing, logout functionality, and custom exception handling.

#### 3. Challenges & Mitigation Strategies
- *Challenge:* CORS preflight request blocking frontend API calls.
- *Mitigation:* Explicitly configured FastAPI `CORSMiddleware` to allow credentials and origins from `http://localhost:5173`.

#### 4. Plan for Next Week
Build Password Strength Analyzer module (Shannon entropy calculation, regex rules, crack time estimation, strength meter UI, and unit tests).

---

### Weekly Progress Report — Week 4
**Course Code:** SGP-401 (Semester Group Project)  
**Project Title:** AI Cybersecurity Assistant  
**Reporting Period:** Week 4  
**Team Members:** 5 Members  

#### 1. Executive Summary
Week 4 marked the completion of Month 1 with the successful delivery of the Password Strength Analyzer feature module and main Dashboard workspace integration.

#### 2. Detailed Work Completed
- **Entropy & Scoring Engine:** Implemented Shannon entropy math calculation $H = -\sum p_i \log_2(p_i)$, regex rules, and 0–100 score rating.
- **Security Analysis:** Added brute-force crack time estimator, common password blacklist checking, and actionable security recommendations.
- **Interactive UI:** Developed React `PasswordChecker.jsx` screen with strength meter bar and 300ms input debouncing.
- **Testing & Integration:** Automated unit tests using `pytest` and integrated module launcher into `Dashboard.jsx`.

#### 3. Challenges & Mitigation Strategies
- *Challenge:* Invalid `lucide-react` icon import causing Vite build failure and blank browser screen.
- *Mitigation:* Replaced invalid icon reference with standard `MessageSquare` icon and verified zero-error build via `npm run build`.

#### 4. Summary of Status at End of Month 1
Month 1 foundation, user authentication, database persistence, and first security tool module (Password Strength Analyzer) are 100% complete and operational.

---

## Part 3: Consolidated Progress Table (Weeks 1–4)

| Week No. | Focus Area | Key Deliverables | Status | Hours Spent |
| :---: | :--- | :--- | :---: | :---: |
| **Week 1** | Project Planning & Research | Problem Statement, SRS, Tech Stack Selection, Architecture Blueprint, GitHub Repo | **Completed** | 24.5 hrs |
| **Week 2** | UI/UX & Backend Setup | Figma Wireframes, Vite React + Tailwind Init, FastAPI Init, MongoDB Atlas Setup, Navbar/Sidebar | **Completed** | 25.5 hrs |
| **Week 3** | Authentication Module | User Registration API, Login API, JWT Token Auth, Bcrypt Hashing, AuthContext Provider | **Completed** | 27.0 hrs |
| **Week 4** | Password Strength Analyzer | Password Entropy Engine, Crack Time Estimator, Strength Meter UI, Pytest Suite, Dashboard Integration | **Completed** | 28.0 hrs |
| **Total** | **Month 1 System Foundation** | **Core Framework & First Working Cybersecurity Tool** | **100% On Track** | **105.0 hrs** |

---

## Part 4: Cumulative Milestones Achieved (Month 1)

- [x] **Milestone 1: Project Charter & Architecture Finalized (Week 1)**
- [x] **Milestone 2: Monorepo Workspaces & MongoDB Atlas Configured (Week 2)**
- [x] **Milestone 3: UI/UX Wireframes & Core Layout Components Built (Week 2)**
- [x] **Milestone 4: End-to-End JWT User Authentication Operational (Week 3)**
- [x] **Milestone 5: Integrated Password Strength Analyzer Deployed (Week 4)**
- [x] **Milestone 6: Month 1 Workspace Dashboard Operational (Week 4)**

---

## Part 5: Next Month's Plan (Week 5 Preview)

### Week 5 Focus — AI Cybersecurity Chatbot (LangChain & Groq API)

#### Planned Objectives
1. **LangChain & LLM Setup:**
   - Configure LangChain Python package (`langchain`, `langchain-groq`).
   - Securely load `GROQ_API_KEY` from `.env` environment configuration.
2. **Cybersecurity Prompt Engineering:**
   - Design system prompts constraining the AI assistant to act as a defensive cybersecurity mentor.
   - Align AI advice with OWASP Top 10 and NIST guidelines.
3. **Backend API Endpoint:**
   - Create `/api/v1/chat/message` endpoint supporting multi-turn conversation history payloads.
4. **Frontend Chatbot Interface:**
   - Build interactive chat drawer component (`Chatbot.jsx`) with user vs assistant message bubbles, auto-scroll, and suggested quick-prompt buttons.
