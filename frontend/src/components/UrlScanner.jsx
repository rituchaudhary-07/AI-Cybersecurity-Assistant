import React, { useState } from 'react';
import api from '../services/api';
import { Globe, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Search, ShieldCheck, Zap } from 'lucide-react';

export default function UrlScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const validateUrlInput = (inputUrl) => {
    const trimmed = (inputUrl || '').trim();
    if (!trimmed) {
      return 'Please enter a URL to analyze.';
    }
    if (trimmed.length > 4096) {
      return 'URL exceeds maximum allowed length of 4096 characters.';
    }
    const lower = trimmed.toLowerCase();
    const forbiddenSchemes = ['javascript:', 'data:', 'file:', 'vbscript:', 'blob:', 'about:'];
    for (const scheme of forbiddenSchemes) {
      if (lower.startsWith(scheme)) {
        return `Unsupported or dangerous scheme '${scheme}'. Only HTTP and HTTPS are permitted.`;
      }
    }

    // Validate that input contains a valid domain structure or IP address
    let parseCandidate = trimmed;
    if (!/^https?:\/\//i.test(parseCandidate)) {
      parseCandidate = 'http://' + parseCandidate;
    }

    try {
      const parsed = new URL(parseCandidate);
      const host = parsed.hostname;
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.startsWith('[') || host.includes(':');
      if (!isIp && host !== 'localhost' && !host.includes('.')) {
        return `Invalid URL '${trimmed}'. Please provide a valid domain (e.g. 'example.com') or IP address.`;
      }
    } catch {
      return `Invalid URL format '${trimmed}'. Please enter a valid web address.`;
    }

    return null;
  };


  const handleScan = async (e) => {
    e.preventDefault();
    const validationErr = validateUrlInput(url);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/scan/url', { url: url.trim() });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze URL. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleUrl) => {
    setUrl(sampleUrl);
    setError(null);
  };

  const sampleUrls = [
    'https://google.com',
    'http://paypal-security-update-verification.account-confirm.net/login',
    'http://192.168.1.1/admin/auth.php'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Header Banner */}
      <div className="cyber-glass-card p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(0,240,200,0.25)]">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white">URL Phishing & Threat Detector</h2>

          </div>
        </div>
        <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Analyzes 16 lexical characteristics including URL length, domain age, IP presence, subdomain depth, HTTPS status, and Shannon entropy to detect spoofed phishing links.
        </p>

        {/* Scan Input Form */}
        <form onSubmit={handleScan} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste URL here (e.g. https://example.com/login)..."
              className={`w-full pl-10 pr-4 py-3 text-xs sm:text-sm saas-input text-slate-100 placeholder:text-slate-500 font-mono transition-all ${
                error ? 'border-rose-500/70 focus:border-rose-400' : 'focus:border-cyan-400'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="cyber-btn-primary px-6 py-3 text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running ML Scan...</span>
              </>
            ) : (
              <>
                <span>Scan URL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Links */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="text-cyan-400 font-semibold">QUICK TEST:</span>
          {sampleUrls.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="hover:text-cyan-300 underline truncate max-w-[240px] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs font-mono rounded-xl flex items-center space-x-2.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Main Risk Overview */}
          <div className={`p-6 rounded-2xl border ${result.is_phishing
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
            }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {result.is_phishing ? (
                  <ShieldAlert className="w-10 h-10 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Target Domain:</span>
                    <span className="text-sm font-mono font-semibold text-white">{result.domain}</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold mt-1 text-white">{result.risk_level}</h3>
                </div>
              </div>

              <div className="text-right bg-slate-900/90 px-5 py-3 rounded-xl border border-[var(--cyber-border)] shadow-md">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Phishing Risk Score</span>
                <span className={`text-2xl font-bold font-mono ${result.risk_score > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.risk_score} / 10
                </span>
              </div>
            </div>
          </div>

          {/* Lexical Features Grid */}
          <div className="cyber-glass-card p-6 space-y-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lexical Feature Extraction & Telemetry Breakdown</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.features.map((feat, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/70 border border-[var(--cyber-border)] rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-200">{feat.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">{feat.value}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${feat.risk === 'High' ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' :
                      feat.risk === 'Medium' ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' :
                        'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    }`}>
                    {feat.risk} Risk
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="cyber-glass-card p-6 space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
              AI Security Advisory & Action Plan
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
