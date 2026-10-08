import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
        <div className="h-6 flex items-center justify-between">
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-8 w-8 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-8 bg-slate-100 rounded" />
        <div className="h-4 bg-slate-100 rounded" />
      </div>
    );
  }

  if (status === 'degraded' || status === 'offline') {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 space-y-3 shadow-sm">
        <div className="h-6 flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-teal-700">
            {title}
          </span>
          <div className="p-1.5 rounded-lg bg-teal-100 text-teal-600 border border-teal-200">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="h-8 flex items-center">
          <p className="text-base font-bold font-mono text-teal-900">
            {status === 'degraded' ? 'Degraded State' : 'Service Offline'}
          </p>
        </div>
        <div className="h-4 flex items-center justify-between text-xs">
          <p className="text-[11px] font-mono text-teal-700 truncate">{subtext}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-[10px] font-mono font-semibold underline text-teal-700 hover:text-teal-900"
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
      {/* Header Row (h-6) */}
      <div className="h-6 flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">
          {title}
        </span>
        
        {/* Subtle Monochrome Icon Badge */}
        <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-slate-200 transition-colors">
          {Icon && <Icon className="w-4 h-4" />}
        </div>
      </div>

      {/* Value Area (h-8) */}
      <div className="h-8 flex items-center space-x-2">
        {pulse && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />}
        <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
          {value}
        </p>
      </div>

      {/* Footer Row (h-4) */}
      <div className="h-4 flex items-center justify-between space-x-2">
        <p className="text-[11px] text-slate-500 font-mono font-medium truncate">
          {subtext}
        </p>

        {sparklineData && (
          <div className="w-20 h-6 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke="#64748B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getSparklinePoints(sparklineData)}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
