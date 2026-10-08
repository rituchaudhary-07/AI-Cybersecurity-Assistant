import React, { useState } from 'react';
import api from '../services/api';
import { Globe, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Search, ShieldCheck } from 'lucide-react';

export default function UrlScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/scan/url', { url });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze URL. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const sampleUrls = [
    'https://google.com',
    'http://paypal-security-update-verification.account-confirm.net/login',
    'http://192.168.1.1/admin/auth.php'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">URL Phishing & Threat Detector</h2>
            <p className="text-xs text-slate-500 font-mono">Random Forest ML & Lexical Feature Extraction Engine</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-2 max-w-2xl">
          Analyzes 16 lexical characteristics including URL length, domain age, IP presence, subdomain depth, HTTPS status, and Shannon entropy to detect spoofed phishing links.
        </p>

        {/* Scan Input Form */}
        <form onSubmit={handleScan} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste URL here (e.g. https://example.com/login)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="saas-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center justify-center space-x-2 shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning ML...</span>
              </>
            ) : (
              <>
                <span>Run Lexical Scan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Links */}
        <div className="mt-3 flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
          <span>Quick Test:</span>
          {sampleUrls.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setUrl(s)}
              className="hover:text-teal-600 underline truncate max-w-[200px]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Main Risk Overview */}
          <div className={`p-6 rounded-xl border ${
            result.is_phishing 
              ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {result.is_phishing ? (
                  <ShieldAlert className="w-10 h-10 text-rose-600 shrink-0" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-emerald-600 shrink-0" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">Target Domain:</span>
                    <span className="text-sm font-mono font-semibold">{result.domain}</span>
                  </div>
                  <h3 className="text-lg font-bold mt-0.5">{result.risk_level}</h3>
                </div>
              </div>

              <div className="text-right bg-white/80 backdrop-blur-xs px-5 py-3 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">Phishing Risk Score</span>
                <span className={`text-2xl font-bold font-mono ${result.risk_score > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {result.risk_score} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Lexical Features Grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Lexical Feature Extraction & Telemetry Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.features.map((feat, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800">{feat.name}</p>
                    <p className="text-[11px] font-mono text-slate-500">{feat.value}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                    feat.risk === 'High' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                    feat.risk === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}>
                    {feat.risk} Risk
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-sm">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              AI Security Advisory & Action Plan
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
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
