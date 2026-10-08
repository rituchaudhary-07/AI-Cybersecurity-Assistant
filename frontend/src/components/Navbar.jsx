import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Menu, X, Sun, Moon, Maximize2, Minimize2, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  presentationMode = false, 
  setPresentationMode 
}) {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('cyber_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('cyber_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('cyber_theme', 'dark');
      setIsDark(true);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SEC';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-[var(--border-glow)] bg-[var(--card-glass)] backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 transition-colors">
      <div className="flex items-center space-x-3.5">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-lg border border-[var(--border-glow)] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Pulsing Glowing Shield Logo Container */}
        <div className="relative group p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Shield className="w-5 h-5 animate-pulse-slow" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>

        <div>
          <h1 className="font-heading font-extrabold text-base sm:text-lg tracking-wider text-[var(--text-primary)] flex items-center gap-2">
            CYBER <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">COMMAND</span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 font-semibold tracking-normal">
              SOC v2.4
            </span>
          </h1>
          <p className="text-[11px] text-[var(--text-secondary)] hidden sm:block font-mono tracking-tight">
            AI Threat Intelligence & Defense Operations Platform
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Status Pill with Animated Radar-Ping Dot */}
        <div className="hidden md:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/40 text-xs font-mono font-medium shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-slate-400 text-[11px]">SOC DEFENSE:</span>
          <span className="text-emerald-400 font-semibold tracking-wide text-[11px]">ACTIVE</span>
        </div>

        {/* Presentation Mode Toggle */}
        {setPresentationMode && (
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            title={presentationMode ? "Exit Presentation Mode" : "Enter Presentation Mode"}
            className={`p-2 rounded-full border transition-all text-xs font-mono flex items-center gap-1.5 px-3 ${
              presentationMode 
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                : 'bg-slate-900/60 border-[var(--border-glow)] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40'
            }`}
          >
            {presentationMode ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline text-[11px]">
              {presentationMode ? 'Exit Demo' : 'Presentation'}
            </span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Cyber Light Mode" : "Switch to Cyber Dark Mode"}
          className="p-2 rounded-full bg-slate-900/60 border border-[var(--border-glow)] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {user ? (
          <div className="flex items-center space-x-3 border-l border-[var(--border-glow)] pl-3 sm:pl-4">
            {/* User Avatar with Glowing Initials Ring */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1.5px] shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                <div className="w-full h-full bg-[#0A1428] rounded-full flex items-center justify-center font-heading font-bold text-xs text-cyan-300">
                  {getInitials(user.name)}
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{user.name}</p>
                <p className="text-[10px] text-cyan-400/90 font-mono">{user.email}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              title="Logout Session"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button className="cyber-pill-primary px-4 py-1.5 text-xs">
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
