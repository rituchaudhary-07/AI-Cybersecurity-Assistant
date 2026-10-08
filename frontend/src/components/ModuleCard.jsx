import React from 'react';
import { ArrowRight, Lock, Clock, Activity, Zap } from 'lucide-react';

export default function ModuleCard({
  title,
  description,
  icon: Icon,
  status = 'ready',
  badgeText = 'Active',
  metricLabel,
  lastUsed,
  onLaunch
}) {
  const isLocked = status === 'upcoming';
  // Ensure we never render "Live" even if passed
  const cleanBadgeText = badgeText === 'Live' ? 'Active' : badgeText;

  return (
    <div
      className={`cyber-glass-card p-6 space-y-4 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden ${
        isLocked ? 'opacity-60 bg-slate-900/40' : 'hover:-translate-y-1.5'
      }`}
    >
      {/* Top corner neon ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 group-hover:bg-cyan-500/15 rounded-full blur-3xl transition-all pointer-events-none" />

      <div className="space-y-3.5 relative z-10">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          {/* Cyber Icon Container */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-400/30 text-cyan-400 group-hover:border-cyan-400 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:scale-105 transition-all">
            {Icon && <Icon className="w-5 h-5" />}
          </div>

          <div>
            {isLocked ? (
              <span className="text-[10px] px-3 py-1 bg-slate-900/80 text-slate-400 font-mono font-medium rounded-full border border-slate-700/60 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-500" /> Pipeline
              </span>
            ) : (
              <span className="text-[10px] px-3 py-1 bg-cyan-500/10 text-cyan-300 font-mono font-semibold rounded-full border border-cyan-400/30 flex items-center gap-1.5 shadow-[0_0_8px_rgba(34,211,238,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                {cleanBadgeText}
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-heading font-bold text-base text-[var(--text-primary)] group-hover:text-cyan-300 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2 min-h-[38px] font-normal">
            {description}
          </p>
        </div>
      </div>

      {/* Metadata & CTA */}
      <div className="space-y-3.5 pt-3.5 border-t border-[var(--border-glow)] relative z-10">
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
          {metricLabel ? (
            <span className="flex items-center space-x-1.5 text-slate-300 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{metricLabel}</span>
            </span>
          ) : (
            <span className="text-slate-500">Defense Ready</span>
          )}

          {lastUsed ? (
            <span className="flex items-center space-x-1 text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{lastUsed}</span>
            </span>
          ) : (
            <span className="text-slate-500">Standby</span>
          )}
        </div>

        <button
          onClick={onLaunch}
          disabled={isLocked}
          className={`w-full py-2.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
            isLocked
              ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
              : 'cyber-pill-secondary group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-600 group-hover:text-[#040B1A] group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
          }`}
        >
          <span>{isLocked ? 'Module Scheduled' : `Launch ${title.split(' ')[0]}`}</span>
          {!isLocked && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
}
