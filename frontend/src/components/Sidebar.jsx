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
  Activity
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, status: 'Ready' },
    { id: 'password', label: 'Password Strength ML', icon: KeyRound, status: 'Ready' },
    { id: 'chatbot', label: 'AI Security Assistant', icon: MessageSquare, status: 'Ready' },
    { id: 'phishing', label: 'URL Phishing Scanner', icon: Globe, status: 'Ready' },
    { id: 'log', label: 'Log File Analyzer', icon: FileText, status: 'Ready' },
    { id: 'vulnerability', label: 'Vulnerability Scanner', icon: ShieldAlert, status: 'Ready' },
    { id: 'reports', label: 'Reports & AI Advice', icon: Sparkles, status: 'Ready' },
  ];

  const handleSelectTab = (itemId) => {
    setActiveTab(itemId);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            Security Tool Suite
          </span>
          {setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors ${
                  isCurrent
                    ? 'border-l-2 border-teal-600 bg-teal-50/60 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  isCurrent ? 'bg-teal-100 text-teal-700 border-teal-200 font-semibold' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  Live
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Health Card */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-xs flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full Suite Operational</span>
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All 5 ML & Security engines online.
          </p>
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-xs h-full z-10 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
