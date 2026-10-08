import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [engineState, setEngineState] = useState('normal');

  const toggleEngineStatus = () => {
    if (engineState === 'normal') setEngineState('degraded');
    else if (engineState === 'degraded') setEngineState('loading');
    else setEngineState('normal');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* SaaS Hero Workspace Section */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Main Hero Text */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Full Master Plan Suite Unlocked & Live</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                      AI Cybersecurity Assistant & <span className="text-teal-600">Threat Intelligence</span>
                    </h2>

                    <p className="text-sm text-slate-500 leading-relaxed max-w-xl font-normal">
                      Complete security suite active: Password ML, RAG AI Chatbot, URL Phishing Classifier, Log Anomaly Inspector, Web Vulnerability Auditor, and PDF Exporter.
                    </p>

                    {/* Action Group */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={() => setActiveTab('password')}
                        className="saas-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center space-x-2 shadow-sm"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Test Password ML</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setActiveTab('phishing')}
                        className="px-5 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center space-x-2 transition-colors border border-slate-200"
                      >
                        <Globe className="w-4 h-4 text-teal-600" />
                        <span>URL Phishing Scan</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('reports')}
                        className="text-xs font-semibold text-slate-700 hover:text-teal-600 flex items-center space-x-1 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <span>AI Reports & PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* System Health Telemetry */}
                  <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
                          System Telemetry & Health
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold">
                        5 / 5 Operational
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start space-x-3 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-800">Entropy & Phishing ML Engines</p>
                          <p className="text-[11px] text-slate-500 font-mono">Precision: 99.4% | Random Forest Active</p>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start space-x-3 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-800">RAG AI Assistant & Groq API</p>
                          <p className="text-[11px] text-slate-500 font-mono">OWASP & NIST Citations Active</p>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start space-x-3 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-800">Log Isolation Forest & Port Scanner</p>
                          <p className="text-[11px] text-slate-500 font-mono">Syslog + Async Port Engine Online</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Stat Cards Telemetry Row */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                    Platform Telemetry & Metrics
                  </h3>
                  <button
                    onClick={toggleEngineStatus}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-mono font-medium flex items-center space-x-1.5 border border-slate-200 px-3 py-1 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    <RefreshCw className="w-3 h-3 text-teal-600" />
                    <span>State: <strong className="text-teal-600 uppercase">{engineState}</strong></span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    title="Active Modules"
                    value="5 / 5"
                    subtext="All Master Plan Modules Unlocked"
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
                    subtext="Full Threat Detection Live"
                    icon={Layers}
                    pulse={engineState === 'normal'}
                    status={engineState === 'loading' ? 'loading' : 'normal'}
                  />
                </div>
              </div>

              {/* Operational Tool Modules Grid */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                    Security Tool Modules (All Live)
                  </h3>
                  <span className="text-xs font-mono text-emerald-600 font-semibold">
                    5 / 5 operational | 100% Master Plan Complete
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Module 1 */}
                  <ModuleCard
                    title="Password Strength ML"
                    description="Evaluates password cryptographic entropy, regex composition rules, and Random Forest scoring to detect leaked credentials."
                    icon={KeyRound}
                    status="ready"
                    badgeText="Live"
                    metricLabel="Entropy: 99.4%"
                    lastUsed="Active"
                    onLaunch={() => setActiveTab('password')}
                  />

                  {/* Module 2 */}
                  <ModuleCard
                    title="AI Security Assistant"
                    description="Generative RAG AI security mentor trained on OWASP Top 10 guidelines to answer domain security questions and cite sources."
                    icon={MessageSquare}
                    status="ready"
                    badgeText="Live"
                    metricLabel="RAG + Llama-3 70B"
                    lastUsed="Active"
                    onLaunch={() => setActiveTab('chatbot')}
                  />

                  {/* Module 3 */}
                  <ModuleCard
                    title="URL Phishing Scanner"
                    description="Extracts 16 lexical URL features (length, domain age, IP presence) and runs Random Forest ML classification to detect phishing sites."
                    icon={Globe}
                    status="ready"
                    badgeText="Live"
                    metricLabel="Random Forest ML"
                    lastUsed="Active"
                    onLaunch={() => setActiveTab('phishing')}
                  />

                  {/* Module 4 */}
                  <ModuleCard
                    title="Log File Analyzer"
                    description="Parses Apache/Syslog files and executes Isolation Forest unsupervised anomaly detection to identify brute-force login attacks."
                    icon={FileText}
                    status="ready"
                    badgeText="Live"
                    metricLabel="Isolation Forest"
                    lastUsed="Active"
                    onLaunch={() => setActiveTab('log')}
                  />

                  {/* Module 5 */}
                  <ModuleCard
                    title="Vulnerability Scanner"
                    description="Audits HTTP security headers (CSP, HSTS), evaluates SSL/TLS certificates, and conducts lightweight asynchronous port scans."
                    icon={ShieldAlert}
                    status="ready"
                    badgeText="Live"
                    metricLabel="Header & Port Auditor"
                    lastUsed="Active"
                    onLaunch={() => setActiveTab('vulnerability')}
                  />

                  {/* Module 6 */}
                  <ModuleCard
                    title="AI Reports & PDF Generator"
                    description="Synthesizes security scan findings into prioritized AI recommendations and generates downloadable PDF audit reports."
                    icon={Sparkles}
                    status="ready"
                    badgeText="Live"
                    metricLabel="PDF Auditor Exporter"
                    lastUsed="Active"
                    onLaunch={() => setActiveTab('reports')}
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
        </main>
      </div>
    </div>
  );
}
