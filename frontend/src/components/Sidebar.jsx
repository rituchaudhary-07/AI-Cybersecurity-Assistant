import React from 'react';
import { 
  KeyRound, 
  MessageSquare, 
  Globe, 
  FileText, 
  ShieldAlert, 
  LayoutDashboard,
  Sparkles,
  X,
  Activity,
  ShieldCheck,
  Radio,
  QrCode,
  MailWarning
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'password', label: 'Password Security Analyzer', icon: KeyRound },
    { id: 'chatbot', label: 'AI Security Assistant', icon: MessageSquare },
    { id: 'phishing', label: 'URL Phishing Scanner', icon: Globe },
    { id: 'qr', label: 'QR Code Safety Checker', icon: QrCode },
    { id: 'spam', label: 'Spam & Scam Detector', icon: MailWarning },
    { id: 'log', label: 'Log File Analyzer', icon: FileText },
    { id: 'vulnerability', label: 'Vulnerability Scanner', icon: ShieldAlert },
    { id: 'reports', label: 'Reports & AI Advice', icon: Sparkles },
  ];

  const handleSelectTab = (itemId) => {
    setActiveTab(itemId);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[var(--bg-surface)] border-r border-[var(--border-glow)] transition-colors">
      <div className="p-4 space-y-4">
        {/* Navigation Category Header */}
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-heading uppercase tracking-widest text-[#0891B2] dark:text-cyan-400 font-bold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#0891B2] dark:text-cyan-400 animate-pulse" />
            Security Modules
          </span>
          {setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-[var(--text-primary)] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full group flex items-center px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                  isCurrent
                    ? 'border-l-[3px] border-[#0891B2] dark:border-cyan-400 bg-cyan-500/10 dark:bg-gradient-to-r dark:from-cyan-500/15 dark:via-blue-500/10 dark:to-transparent text-[var(--text-primary)] font-semibold shadow-[inset_0_0_12px_rgba(34,211,238,0.1)] translate-x-1'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:translate-x-1 border-l-[3px] border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isCurrent 
                      ? 'bg-cyan-500/20 text-[#0891B2] dark:text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.2)]' 
                      : 'text-[var(--text-secondary)] group-hover:text-[#0891B2] dark:group-hover:text-cyan-300 group-hover:bg-slate-200/60 dark:group-hover:bg-slate-800/60'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-heading tracking-wide text-xs">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Health Telemetry Card */}
      <div className="p-4 border-t border-[var(--border-glow)] bg-[var(--bg-base)]/60">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-emerald-500/40 dark:border-emerald-500/30 text-xs space-y-2 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
          <div className="flex items-center justify-between">
            <span className="font-heading font-semibold text-[var(--text-primary)] text-xs flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="text-[11px] tracking-wide">SOC DEFENSE STATUS</span>
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-mono leading-relaxed">
            Threat engines & AI models online. Zero active perimeter breaches.
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full w-full rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="w-64 shrink-0 hidden lg:block h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#040B1A]/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-xs h-full z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
