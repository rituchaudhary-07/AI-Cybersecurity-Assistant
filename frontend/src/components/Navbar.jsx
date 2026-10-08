import React from 'react';
import { Shield, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Subtle Shield Icon Container */}
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
          <Shield className="w-5 h-5" />
        </div>

        <div>
          <h1 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-2">
            AI Cybersecurity <span className="text-teal-600 font-semibold">Assistant</span>
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block font-normal">
            Threat Detection & Security Intelligence Platform
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* System Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Status:</span>
          <span className="text-slate-900 font-semibold">Operational</span>
        </div>

        {user ? (
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : (
          <button className="saas-btn-dark px-4 py-2 text-xs">
            Get Started Ã¢â€ â€™
          </button>
        )}
      </div>
    </header>
  );
}
