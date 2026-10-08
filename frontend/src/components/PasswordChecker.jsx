import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Clock, Cpu, CheckCircle2, XCircle, AlertTriangle, Eye, EyeOff, Info, Zap, Shield } from 'lucide-react';
import api from '../services/api';

export default function PasswordChecker() {
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!password) {
      setAnalysis(null);
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setError('');
        const response = await api.post('/analyze-password', { password });
        setAnalysis(response.data);
      } catch (err) {
        console.error('Failed to analyze password:', err);
        setAnalysis(null);
        setError('Analysis is temporarily unavailable. Check that the API server is running and try again.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [password]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header Banner */}
      <div className="cyber-glass-card p-6 sm:p-7 flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(0,240,200,0.2)]">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-heading font-bold tracking-wide text-white">Password Cryptographic Analyzer</h2>
            <span className="hidden sm:inline text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-medium border border-cyan-500/30">
              Entropy + ML Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal">
            Multi-tier evaluation using Shannon Entropy mathematical calculations, composition heuristics, and Random Forest ML scoring.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="cyber-glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Audit Password Privately
          </label>
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Info className="h-3.5 w-3.5 text-cyan-400" /> Zero-knowledge client evaluation
          </span>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to evaluate (e.g. K9#mX2$vL8!pQ5zW)..."
            className="w-full px-4 py-3.5 pr-28 saas-input font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-400 transition hover:bg-slate-800 hover:text-cyan-300 border border-transparent hover:border-slate-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">{showPassword ? 'Hide' : 'Show'}</span>
          </button>
          {loading && (
            <div className="absolute left-3 bottom-[-1.8rem] flex items-center space-x-2 text-[11px] font-mono text-cyan-400">
              <Cpu className="w-3.5 h-3.5 animate-spin" />
              <span>Computing entropy matrices...</span>
            </div>
          )}
        </div>

        {error && <p className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-3.5 py-2.5 text-xs font-mono text-amber-300">{error}</p>}

        {/* Strength Gauge Bar */}
        {analysis && (
          <div className="space-y-2.5 pt-4 border-t border-[var(--cyber-border)]">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 flex items-center space-x-2 font-semibold">
                <span>RATING:</span>
                <span className="px-2.5 py-0.5 bg-slate-900 text-cyan-300 rounded border border-cyan-500/30 uppercase shadow-[0_0_8px_rgba(0,240,200,0.15)]">
                  {analysis.status} ({analysis.score}/100)
                </span>
              </span>
              <span className="text-slate-400 font-mono">
                Entropy: <strong className="text-cyan-400">{analysis.total_entropy_bits} bits</strong>
              </span>
            </div>
            
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(0,240,200,0.4)]"
                style={{ width: `${Math.max(analysis.score, 5)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Analysis Details Display */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cryptographic Card */}
          <div className="cyber-glass-card p-5 space-y-4">
            <h3 className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-[var(--cyber-border)] pb-2.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Crack Resistance Telemetry</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-[var(--cyber-border)] flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Brute Force Crack Time:</span>
                <span className="text-cyan-400 font-bold">{analysis.crack_time_estimate}</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-[var(--cyber-border)] flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Entropy per Char:</span>
                <span className="text-slate-200 font-bold">{analysis.entropy_per_char} bits/char</span>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">Composition Checklist:</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.length ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-500" />}
                    <span className={analysis.checks.length ? 'text-slate-200' : 'text-slate-500'}>8+ Chars</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.has_uppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-500" />}
                    <span className={analysis.checks.has_uppercase ? 'text-slate-200' : 'text-slate-500'}>Uppercase</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.has_lowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-500" />}
                    <span className={analysis.checks.has_lowercase ? 'text-slate-200' : 'text-slate-500'}>Lowercase</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.has_number ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-500" />}
                    <span className={analysis.checks.has_number ? 'text-slate-200' : 'text-slate-500'}>Numbers</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.has_symbol ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-500" />}
                    <span className={analysis.checks.has_symbol ? 'text-slate-200' : 'text-slate-500'}>Symbols</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.is_not_common ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={analysis.checks.is_not_common ? 'text-slate-200' : 'text-rose-400 font-semibold'}>Not Leaked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="cyber-glass-card p-5 space-y-4">
            <h3 className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-[var(--cyber-border)] pb-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>AI Hardening Recommendations</span>
            </h3>

            <div className="space-y-2.5">
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-950/70 rounded-xl border border-[var(--cyber-border)] text-xs text-slate-300 flex items-start space-x-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
