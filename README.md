# AI Cybersecurity Assistant (SGP - Month 1 Implementation)

## 📌 Project Overview
**Course:** B.Tech Computer Engineering | Semester Group Project (SGP)  
**Timeline:** 3 Months (12 Weeks Total) • **Current State:** Month 1 Complete (Weeks 1–4)  
**Team Size:** 4 Members  

The **AI Cybersecurity Assistant** is a full-stack, AI-powered web platform designed to detect cyber threats, analyze password & system vulnerabilities, provide LLM domain guidance, and generate actionable security recommendations.

---

## 🛠️ Month 1 Delivered Features (Weeks 1–4)

1. **User Authentication & Persistence:**
   - JWT Access Tokens (`python-jose` + `passlib[bcrypt]`).
   - MongoDB Atlas / local MongoDB persistence via async `Motor` driver (with graceful in-memory fallback).
   - Login, Registration, and User Profile REST API endpoints.
   - Protected React routes & persistent login context (`AuthContext.jsx`).

2. **Password Strength Analyzer (ML + Entropy Engine):**
   - **Shannon Entropy Calculation:** $H = -\sum p_i \log_2(p_i)$ to measure cryptographic randomness.
   - **Regex Composition Heuristics:** Length, uppercase, lowercase, numbers, special characters, and common leaked password checks.
   - **Random Forest ML Scoring:** 0–100 safety score and estimated brute-force crack time.
   - **Actionable AI Recommendations:** Real-time feedback debounced by 300ms.

3. **AI Cybersecurity Chatbot:**
   - Integrated **Groq API** (`llama3-70b-8192` model) with domain system prompt.
   - Smart offline/unconfigured fallback advisory engine answering OWASP, XSS, Phishing, and SQLi questions.
   - Streaming interactive chat interface with suggested quick-prompts and chat history state.

4. **Security Dashboard Framework:**
   - Cyberpunk dark-mode aesthetic with Tailwind CSS and glassmorphism styling.
   - Sidebar navigation, real-time system status indicators, and modular tool launch tiles.

---

## 🚀 How to Run Month 1 Code Locally

### 1. Start the FastAPI Backend
```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Uvicorn server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/api/v1/docs`

---

### 2. Start the React Frontend (Vite)
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Run Vite dev server
npm run dev
```
Frontend Web App will be live at: `http://localhost:5173`

---

### 3. Run Backend Unit Tests (Pytest)
```bash
cd backend
pytest tests/
```

---

## 📁 Repository Directory Structure

```text
AI cybersecurity Assistant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py         # Login, Register, Profile endpoints
│   │   │       │   ├── password.py     # Password analyzer endpoint
│   │   │       │   └── chat.py         # AI chatbot endpoint
│   │   │       └── router.py
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic Settings
│   │   │   └── security.py             # Bcrypt hashing & JWT management
│   │   ├── db/
│   │   │   └── mongodb.py              # Motor async database connection
│   │   ├── services/
│   │   │   ├── password_analyzer.py    # Shannon Entropy + ML scoring engine
│   │   │   └── chatbot.py              # Groq LLM API + Fallback advisor
│   │   └── main.py                     # FastAPI app with CORS middleware
│   ├── tests/
│   │   └── test_password_analyzer.py   # Pytest suite
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── PasswordChecker.jsx     # Live Password Analyzer UI
│   │   │   └── Chatbot.jsx             # AI Security Assistant Drawer UI
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx           # Unified Workspace
│   │   ├── services/
│   │   │   └── api.js                  # Axios client with JWT interceptor
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── SGP_Weeks_1-4_Progress_Reports.md   # Weekly Reports for Guide Submission
├── SGP_3_Month_12_Week_Master_Plan.md  # 3-Month Project Roadmap
└── README.md
```
