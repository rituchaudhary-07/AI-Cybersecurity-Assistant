import React from 'react';
import { ArrowRight, Lock, Clock, Activity } from 'lucide-react';

export default function ModuleCard({
  title,
  description,
  icon: Icon,
  status = 'ready',
  badgeText = 'Live',
  metricLabel,
  lastUsed,
  onLaunch
}) {
  const isLocked = status === 'upcoming';

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm flex flex-col justify-between transition-all ${
        isLocked ? 'opacity-70 bg-slate-50/50' : 'hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className="space-y-3">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          {/* Subtle Icon Container */}
          <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
            {Icon && <Icon className="w-5 h-5" />}
          </div>

          <div>
            {isLocked ? (
              <span className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-500 font-mono font-medium rounded-full border border-slate-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Pipeline
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-1 bg-teal-50 text-teal-700 font-mono font-semibold rounded-full border border-teal-200">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-bold text-base text-slate-900">
            {title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mt-1.5 min-h-[36px] font-normal">
            {description}
          </p>
        </div>
      </div>

      {/* Metadata & CTA */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          {metricLabel ? (
            <span className="flex items-center space-x-1 text-slate-700 font-medium">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>{metricLabel}</span>
            </span>
          ) : (
            <span className="text-slate-400">Phase 2 Target</span>
          )}

          {lastUsed ? (
            <span className="flex items-center space-x-1 text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{lastUsed}</span>
            </span>
          ) : (
            <span className="text-slate-400">Scheduled</span>
          )}
        </div>

        <button
          onClick={onLaunch}
          disabled={isLocked}
          className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
            isLocked
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
          }`}
        >
          <span>{isLocked ? 'Module Scheduled' : `Launch ${title.split(' ')[0]}`}</span>
          {!isLocked && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
