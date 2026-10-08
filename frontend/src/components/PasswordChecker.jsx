import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Clock, Cpu, CheckCircle2, XCircle, AlertTriangle, Eye, EyeOff, Info } from 'lucide-react';
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Password Strength Analyzer</h2>
            <span className="hidden sm:inline text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
              Entropy + ML Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Multi-tier evaluation using Shannon Entropy math, regex rules, and Random Forest ML scoring.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
            Test a password privately
          </label>
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500"><Info className="h-3.5 w-3.5" /> Not stored or displayed</span>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password to analyze (e.g. K9#mX2$vL8!pQ5zW)..."
            className="w-full px-4 py-3 pr-28 saas-input font-mono text-sm text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">{showPassword ? 'Hide' : 'Show'}</span>
          </button>
          {loading && (
            <div className="absolute left-3 bottom-[-1.7rem] flex items-center space-x-2 text-[11px] font-mono text-teal-600">
              <Cpu className="w-4 h-4 animate-spin" />
              <span>Evaluating...</span>
            </div>
          )}
        </div>

        {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">{error}</p>}

        {/* Live Strength Gauge Bar */}
        {analysis && (
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-700 flex items-center space-x-2 font-semibold">
                <span>Rating:</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-900 rounded border border-slate-200 uppercase">
                  {analysis.status} ({analysis.score}/100)
                </span>
              </span>
              <span className="text-slate-600">
                Entropy: <strong className="text-teal-600">{analysis.total_entropy_bits} bits</strong>
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-teal-600 transition-all duration-300 rounded-full"
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Crack Resistance</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">Cracking Time:</span>
                <span className="text-teal-600 font-bold">{analysis.crack_time_estimate}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">Entropy per Char:</span>
                <span className="text-slate-900 font-bold">{analysis.entropy_per_char} bits/char</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-mono font-semibold text-slate-500 uppercase">Composition Checklist:</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.length ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>8+ Chars</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.has_uppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Uppercase</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.has_lowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Lowercase</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.has_number ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Numbers</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.has_symbol ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Symbols</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {analysis.checks.is_not_common ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <XCircle className="w-3.5 h-3.5 text-teal-600" />}
                    <span className={analysis.checks.is_not_common ? '' : 'text-teal-600 font-semibold'}>Not Leaked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>AI Recommendations</span>
            </h3>

            <div className="space-y-2.5">
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-sans text-slate-800 flex items-start space-x-2"
                >
                  <AlertTriangle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
