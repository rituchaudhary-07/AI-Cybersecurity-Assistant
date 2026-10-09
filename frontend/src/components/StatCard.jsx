import React from 'react';
import { AlertTriangle, RefreshCw, Activity, ArrowUpRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  sparklineData,
  pulse = false,
  status = 'normal',
  onRetry
}) {
  if (status === 'loading') {
    return (
      <div className="cyber-glass-card p-5 space-y-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" />
        <div className="h-6 flex items-center justify-between">
          <div className="h-3.5 w-24 bg-slate-800/80 rounded animate-pulse" />
          <div className="h-8 w-8 bg-slate-800/80 rounded-lg animate-pulse" />
        </div>
        <div className="h-8 bg-slate-800/80 rounded w-3/4 animate-pulse" />
        <div className="h-3.5 bg-slate-800/80 rounded w-1/2 animate-pulse" />
      </div>
    );
  }

  if (status === 'degraded' || status === 'offline') {
    return (
      <div className="cyber-glass-card border-amber-500/40 bg-amber-950/20 p-5 space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
        <div className="h-6 flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-400">
            {title}
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="h-8 flex items-center">
          <p className="text-base font-bold font-mono text-amber-300">
            {status === 'degraded' ? 'Degraded State' : 'Service Offline'}
          </p>
        </div>
        <div className="h-4 flex items-center justify-between text-xs">
          <p className="text-[11px] font-mono text-amber-400/80 truncate">{subtext}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 hover:text-white underline transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Generate SVG points string for sparkline (80x24)
  const getSparklinePoints = (data) => {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    return data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="cyber-glass-card p-5 space-y-3 relative group overflow-hidden hover:-translate-y-1 transition-all duration-300">
      {/* Background neon ambient highlight */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all" />

      {/* Header Row */}
      <div className="h-6 flex items-center justify-between">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
          {title}
        </span>
        
        {/* Futuristic Icon Container */}
        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-cyan-400/30 text-[#0891B2] dark:text-cyan-400 group-hover:border-[#0891B2] dark:group-hover:border-cyan-400 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all">
          {Icon ? <Icon className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
        </div>
      </div>

      {/* Value Area */}
      <div className="h-8 flex items-center space-x-2.5">
        {pulse && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
          </span>
        )}
        <p className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight group-hover:text-[var(--accent)] transition-colors">
          {value}
        </p>
      </div>

      {/* Footer Row */}
      <div className="h-4 flex items-center justify-between space-x-2">
        <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">
          {subtext}
        </p>

        {sparklineData && (
          <div className="w-20 h-6 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
              <defs>
                <filter id="glow-card" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <polyline
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow-card)"
                points={getSparklinePoints(sparklineData)}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
