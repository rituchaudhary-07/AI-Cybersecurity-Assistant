import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ModuleCard from '../components/ModuleCard';
import PasswordChecker from '../components/PasswordChecker';
import Chatbot from '../components/Chatbot';
import UrlScanner from '../components/UrlScanner';
import LogAnalyzer from '../components/LogAnalyzer';
import VulnerabilityScanner from '../components/VulnerabilityScanner';
import ReportsView from '../components/ReportsView';
import QrScanner from '../components/QrScanner';
import SpamDetector from '../components/SpamDetector';

import { 
  KeyRound, 
  MessageSquare, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Globe, 
  FileText, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Terminal, 
  Radio, 
  Zap, 
  Shield, 
  Lock,
  QrCode,
  MailWarning
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [engineState, setEngineState] = useState('normal');
  const [presentationMode, setPresentationMode] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, time: '10:15:02', text: 'SOC DEFENSE: Threat engines synchronized' },
    { id: 2, time: '10:15:08', text: 'PORT AUDITOR: Async socket pool active' },
    { id: 3, time: '10:15:14', text: 'ML ENGINES: Entropy & Random Forest loaded' },
    { id: 4, time: '10:15:21', text: 'RAG INGESTION: OWASP Top 10 citations ready' },
    { id: 5, time: '10:15:30', text: 'LOG INSPECTOR: Isolation Forest online' },
  ]);

  const toggleEngineStatus = () => {
    if (engineState === 'normal') setEngineState('degraded');
    else if (engineState === 'degraded') setEngineState('loading');
    else setEngineState('normal');
  };

  useEffect(() => {
    const logEvents = [
      'IDS/IPS: 0 perimeter anomalies detected',
      'ASYNC SCANNER: Ready for target resolution',
      'GROQ LLM: Latency 142ms | Llama-3 ready',
      'ENCRYPT ENGINE: Cryptographic entropy nominal',
      'TELEMETRY: System heartbeat verified 100%'
    ];
    let count = 6;
    const interval = setInterval(() => {
      const randomEvent = logEvents[Math.floor(Math.random() * logEvents.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setTerminalLogs((prev) => [
        ...prev.slice(-5),
        { id: count++, time: timeStr, text: randomEvent }
      ]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans circuit-bg transition-all ${presentationMode ? 'presentation-mode-active' : ''}`}>
      <Navbar 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
      />

      <div className="flex-1 flex overflow-hidden">
        {!presentationMode && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Reference Hero Workspace with Glowing Padlock Emblem & Circuit Traces */}
              <div className="cyber-glass-card shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden border border-[var(--border-glow)]">
                {/* Radial Backdrop Glow */}
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

                <div className="p-6 sm:p-8 lg:p-10 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Hero Text Section */}
                    <div className="lg:col-span-7 space-y-5">
                      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs font-mono text-cyan-600 dark:text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                        <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                        <span className="font-semibold tracking-wide">Threat Intelligence Suite Active</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
                        AI CYBERSECURITY ASSISTANT & THREAT <span className="text-[#0891B2] dark:bg-gradient-to-r dark:from-white dark:via-cyan-200 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent dark:drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">DEFENSE</span>
                      </h2>

                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl font-normal">
                        Advanced cybersecurity intelligence center powered by machine learning and LLM reasoning. Real-time password entropy audits, RAG defense advisor, phishing detection, SIEM log parsing, and automated vulnerability scanning.
                      </p>

                      {/* Action Group: Reference Style Pill Buttons */}
                      <div className="flex flex-wrap items-center gap-3.5 pt-3">
                        <button
                          onClick={() => setActiveTab('password')}
                          className="cyber-pill-primary px-6 py-3 text-xs font-heading font-bold uppercase tracking-wider flex items-center space-x-2"
                        >
                          <KeyRound className="w-4 h-4 text-white dark:text-[#040B1A]" />
                          <span>Audit Passwords</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white dark:text-[#040B1A]" />
                        </button>

                        <button
                          onClick={() => setActiveTab('vulnerability')}
                          className="cyber-pill-secondary px-6 py-3 text-xs font-heading font-semibold uppercase tracking-wider flex items-center space-x-2"
                        >
                          <ShieldAlert className="w-4 h-4 text-[#0891B2] dark:text-cyan-400" />
                          <span>Vuln Scanner</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('chatbot')}
                          className="px-5 py-3 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center space-x-2 transition-colors border border-transparent hover:border-cyan-500/30 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-900/60"
                        >
                          <Sparkles className="w-4 h-4 text-[#0891B2] dark:text-cyan-400" />
                          <span>AI Security Mentor</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Focal Point: Glowing Padlock Emblem with Double Neon Ring & Circuit Lines */}
                    <div className="lg:col-span-5 flex items-center justify-center relative min-h-[280px]">
                      <div className="relative w-72 h-72 flex items-center justify-center">
                        
                        {/* Inline Circuit Trace SVG radiating outward */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 300 300">
                          <defs>
                            <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          {/* HUD Reticle Target Brackets & Cardinal Crosshairs */}
                          <g stroke="#0891B2" className="dark:stroke-[#22D3EE]" strokeWidth="1.2" fill="none" opacity="0.4">
                            {/* Corner HUD Brackets */}
                            <path d="M 45 60 L 45 45 L 60 45" />
                            <path d="M 240 45 L 255 45 L 255 60" />
                            <path d="M 45 240 L 45 255 L 60 255" />
                            <path d="M 240 255 L 255 255 L 255 240" />

                            {/* Reticle Crosses */}
                            <path d="M 72 77 L 78 77 M 75 74 L 75 80" />
                            <path d="M 222 77 L 228 77 M 225 74 L 225 80" />
                            <path d="M 72 223 L 78 223 M 75 220 L 75 226" />
                            <path d="M 222 223 L 228 223 M 225 220 L 225 226" />

                            {/* Cardinal Reticle Ticks */}
                            <line x1="150" y1="28" x2="150" y2="38" />
                            <line x1="150" y1="262" x2="150" y2="272" />
                            <line x1="28" y1="150" x2="38" y2="150" />
                            <line x1="262" y1="150" x2="272" y2="150" />
                          </g>

                          {/* Circuit Traces */}
                          <g stroke="#0891B2" className="dark:stroke-[#22D3EE]" strokeWidth="1.5" fill="none" opacity="0.55" filter="url(#glow-cyan)">
                            <path d="M 150 40 L 150 10 L 190 10" className="circuit-pulse-line" />
                            <path d="M 150 260 L 150 290 L 110 290" className="circuit-pulse-line" />
                            <path d="M 40 150 L 10 150 L 10 190" className="circuit-pulse-line" />
                            <path d="M 260 150 L 290 150 L 290 110" className="circuit-pulse-line" />
                            <path d="M 70 70 L 40 40 L 15 40" className="circuit-pulse-line" />
                            <path d="M 230 70 L 260 40 L 285 40" className="circuit-pulse-line" />
                            <path d="M 70 230 L 40 260 L 15 260" className="circuit-pulse-line" />
                            <path d="M 230 230 L 260 260 L 285 260" className="circuit-pulse-line" />
                          </g>

                          {/* Circuit Terminal Nodes */}
                          <g fill="#0891B2" className="dark:fill-[#22D3EE] animate-pulse" opacity="0.85">
                            <circle cx="190" cy="10" r="3" />
                            <circle cx="110" cy="290" r="3" />
                            <circle cx="10" cy="190" r="3" />
                            <circle cx="290" cy="110" r="3" />
                            <circle cx="15" cy="40" r="3" />
                            <circle cx="285" cy="40" r="3" />
                            <circle cx="15" cy="260" r="3" />
                            <circle cx="285" cy="260" r="3" />
                          </g>

                          {/* Outer Neon Rotating Ring (Clockwise) with Orbiting Satellites */}
                          <g className="padlock-ring-outer" style={{ transformOrigin: '150px 150px' }}>
                            <circle
                              cx="150"
                              cy="150"
                              r="115"
                              stroke="#0891B2"
                              strokeWidth="1.5"
                              strokeDasharray="10 8"
                              fill="none"
                              opacity="0.65"
                              className="dark:stroke-[#00E5FF]"
                            />
                            {/* Orbiting Satellite Dots & Accent Ticks */}
                            <circle cx="265" cy="150" r="3.5" fill="#0891B2" className="dark:fill-[#00E5FF]" />
                            <circle cx="35" cy="150" r="3.5" fill="#0891B2" className="dark:fill-[#00E5FF]" />
                            <circle cx="150" cy="35" r="3" fill="#0891B2" className="dark:fill-[#00E5FF]" opacity="0.8" />
                            <circle cx="150" cy="265" r="3" fill="#0891B2" className="dark:fill-[#00E5FF]" opacity="0.8" />
                            <line x1="261" y1="150" x2="269" y2="150" stroke="#0891B2" className="dark:stroke-[#00E5FF]" strokeWidth="2" />
                            <line x1="31" y1="150" x2="39" y2="150" stroke="#0891B2" className="dark:stroke-[#00E5FF]" strokeWidth="2" />
                          </g>

                          {/* Inner Neon Rotating Ring (Counter-Clockwise) */}
                          <g className="padlock-ring-inner" style={{ transformOrigin: '150px 150px' }}>
                            <circle
                              cx="150"
                              cy="150"
                              r="95"
                              stroke="#2563EB"
                              strokeWidth="2"
                              strokeDasharray="4 6"
                              fill="none"
                              opacity="0.7"
                              className="dark:stroke-[#3B82F6]"
                            />
                            <circle cx="150" cy="55" r="2.5" fill="#2563EB" className="dark:fill-[#60A5FA]" />
                            <circle cx="150" cy="245" r="2.5" fill="#2563EB" className="dark:fill-[#60A5FA]" />
                          </g>

                          {/* Solid Glowing Core Circle */}
                          <circle
                            cx="150"
                            cy="150"
                            r="75"
                            fill="var(--bg-surface)"
                            stroke="var(--accent)"
                            strokeWidth="2"
                            filter="url(#glow-cyan)"
                            className="padlock-core-pulse"
                          />
                        </svg>

                        {/* Central Glowing Cyan Padlock & Shield Icon */}
                        <div className="relative z-10 flex flex-col items-center justify-center text-[var(--accent)] drop-shadow-[0_0_20px_rgba(8,145,178,0.4)] dark:drop-shadow-[0_0_20px_rgba(0,229,255,0.75)] animate-pulse-slow">
                          <Lock className="w-14 h-14 text-[var(--accent)] stroke-[2.2]" />
                          <span className="font-mono font-bold text-[10px] tracking-widest text-[var(--accent)] mt-1 uppercase">
                            SOC SECURED
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* System Telemetry Panel with Live Widgets */}
              <div className="cyber-glass-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-glow)] pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
                      System Telemetry & SOC Health
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    All Systems Operational
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Radar Sweep Widget */}
                  <div className="bg-slate-950/70 border border-cyan-500/20 rounded-xl p-4 flex items-center space-x-4">
                    <div className="relative w-16 h-16 shrink-0 rounded-full border border-cyan-500/40 flex items-center justify-center bg-[#040B1A]">
                      <div className="radar-sweep-beam" />
                      <div className="w-10 h-10 rounded-full border border-cyan-500/20" />
                      <div className="w-3.5 h-3.5 rounded-full bg-cyan-400/30 border border-cyan-400" />
                      <span className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>
                    <div>
                      <p className="text-xs font-heading font-bold text-slate-100">RADAR FREQUENCY</p>
                      <p className="text-[11px] font-mono text-cyan-400 mt-0.5">0 Active Breaches</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">Perimeter scan: 100%</p>
                    </div>
                  </div>

                  {/* Circular Threat Level Gauge */}
                  <div className="bg-slate-950/70 border border-cyan-500/20 rounded-xl p-4 flex items-center space-x-4">
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                        <path
                          className="text-slate-800"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-cyan-400"
                          strokeDasharray="99, 100"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute font-mono font-bold text-xs text-white">
                        99.4%
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-heading font-bold text-slate-100">DEFENSE READINESS</p>
                      <p className="text-[11px] font-mono text-emerald-400 mt-0.5">Optimal Security State</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">ML Engines active</p>
                    </div>
                  </div>

                  {/* Mini Scrolling Terminal Feed */}
                  <div className="soc-terminal-feed bg-[#040B1A] border border-slate-800 rounded-xl p-3.5 space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1">
                      <div className="flex items-center space-x-1.5 text-cyan-400">
                        <Terminal className="w-3 h-3" />
                        <span className="font-bold text-[10px]">SOC AUDIT STREAM</span>
                      </div>
                      <span className="text-[9px] text-cyan-400/80 font-mono">STREAM ACTIVE</span>
                    </div>
                    <div className="space-y-1 max-h-16 overflow-hidden">
                      {terminalLogs.slice(-3).map((log) => (
                        <div key={log.id} className="flex items-center space-x-2 text-slate-300 leading-tight">
                          <span className="text-slate-500 shrink-0">[{log.time}]</span>
                          <span className="text-cyan-300 truncate">&gt; {log.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Telemetry & Metrics Row */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-slate-300">
                      Platform Telemetry & Metrics
                    </h3>
                  </div>

                  <button
                    onClick={toggleEngineStatus}
                    className="text-[11px] text-slate-300 hover:text-white font-mono font-medium flex items-center space-x-2 border border-cyan-500/30 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    <span>ENGINE STATUS: <strong className="text-cyan-300 uppercase">{engineState}</strong></span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    title="Active Modules"
                    value="8 / 8"
                    subtext="All Security Engines Online"
                    icon={ShieldCheck}
                    sparklineData={[5, 8, 12, 15, 18, 22, 25]}
                    status={engineState === 'loading' ? 'loading' : 'normal'}
                  />

                  <StatCard
                    title="Backend Engine"
                    value="FastAPI"
                    subtext="Motor Async + JWT + Scanners"
                    icon={Activity}
                    sparklineData={[10, 12, 15, 14, 18, 20, 24]}
                    status={engineState === 'loading' ? 'loading' : 'normal'}
                  />

                  <StatCard
                    title="LLM RAG Intelligence"
                    value="Groq / RAG"
                    subtext="Llama-3 70B (OWASP Cited)"
                    icon={Cpu}
                    sparklineData={[80, 95, 110, 105, 120, 115, 120]}
                    status={engineState === 'loading' ? 'loading' : engineState === 'degraded' ? 'degraded' : 'normal'}
                    onRetry={() => setEngineState('normal')}
                  />

                  <StatCard
                    title="Security Suite"
                    value="Operational"
                    subtext="Full Threat Defense Active"
                    icon={Layers}
                    pulse={engineState === 'normal'}
                    status={engineState === 'loading' ? 'loading' : 'normal'}
                  />
                </div>
              </div>

              {/* Security Tool Modules Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-slate-300">
                      SECURITY TOOL MODULES
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>All systems operational</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ModuleCard
                    title="Password Strength ML"
                    description="Evaluates password cryptographic entropy, regex composition rules, and Random Forest scoring to detect leaked credentials."
                    icon={KeyRound}
                    status="ready"
                    badgeText="Active"
                    metricLabel="Entropy: 99.4%"
                    lastUsed="Standby"
                    onLaunch={() => setActiveTab('password')}
                  />

                  <ModuleCard
                    title="AI Security Assistant"
                    description="Generative RAG AI security mentor trained on OWASP Top 10 guidelines to answer domain security questions and cite sources."
                    icon={MessageSquare}
                    status="ready"
                    badgeText="Active"
                    metricLabel="RAG + Llama-3 70B"
                    lastUsed="Standby"
                    onLaunch={() => setActiveTab('chatbot')}
                  />

                  <ModuleCard
                    title="URL Phishing Scanner"
                    description="Extracts 16 lexical URL features (length, domain age, IP presence) and runs Random Forest ML classification to detect phishing sites."
                    icon={Globe}
                    status="ready"
                    badgeText="Active"
                    metricLabel="Random Forest ML"
                    lastUsed="Standby"
                    onLaunch={() => setActiveTab('phishing')}
                  />

                  <ModuleCard
                    title="Log File Analyzer"
                    description="Parses Apache/Syslog files and executes Isolation Forest unsupervised anomaly detection to identify brute-force login attacks."
                    icon={FileText}
                    status="ready"
                    badgeText="Active"
                    metricLabel="Isolation Forest"
                    lastUsed="Standby"
                    onLaunch={() => setActiveTab('log')}
                  />

                  <ModuleCard
                    title="Vulnerability Scanner"
                    description="Audits HTTP security headers (CSP, HSTS), evaluates SSL/TLS certificates, and conducts lightweight asynchronous port scans."
                    icon={ShieldAlert}
                    status="ready"
                    badgeText="Active"
                    metricLabel="Header & Port Auditor"
                    lastUsed="Standby"
                    onLaunch={() => setActiveTab('vulnerability')}
                  />

                  <ModuleCard
                    title="AI Reports & PDF Generator"
                    description="Synthesizes security scan findings into prioritized AI recommendations and generates downloadable PDF audit reports."
                    icon={Sparkles}
                    status="ready"
                    badgeText="Active"
                    metricLabel="PDF Auditor Exporter"
                    lastUsed="Standby"
                    onLaunch={() => setActiveTab('reports')}
                  />

                  <ModuleCard
                    title="QR Code Safety Checker"
                    description="Decodes QR code images safely without opening remote links. Reuses lexical URL scanning or inspects raw payloads in sandbox isolation."
                    icon={QrCode}
                    status="ready"
                    badgeText="Active"
                    metricLabel="Air-Gapped Decoder"
                    lastUsed="Standby"
                    onLaunch={() => setActiveTab('qr')}
                  />

                  <ModuleCard
                    title="Spam & Scam Message Detector"
                    description="Audits SMS, email, and WhatsApp messages for phishing phrases, fake prizes, artificial urgency, OTP requests, and wire demands."
                    icon={MailWarning}
                    status="ready"
                    badgeText="Active"
                    metricLabel="Heuristic Threat ML"
                    lastUsed="Standby"
                    onLaunch={() => setActiveTab('spam')}
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'password' && <PasswordChecker />}
          {activeTab === 'chatbot' && <Chatbot />}
          {activeTab === 'phishing' && <UrlScanner />}
          {activeTab === 'log' && <LogAnalyzer />}
          {activeTab === 'vulnerability' && <VulnerabilityScanner />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'qr' && <QrScanner />}
          {activeTab === 'spam' && <SpamDetector />}
        </main>
      </div>
    </div>
  );
}
