import React, { useState } from 'react';
import api from '../services/api';
import { FileText, Upload, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, Terminal, Info, Zap } from 'lucide-react';

export default function LogAnalyzer() {
  const [logText, setLogText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sampleLog = `203.0.113.45 - - [06/Oct/2026:10:15:20 +0000] "POST /login HTTP/1.1" 401 230
203.0.113.45 - - [06/Oct/2026:10:15:21 +0000] "POST /login HTTP/1.1" 401 230
203.0.113.45 - - [06/Oct/2026:10:15:22 +0000] "POST /login HTTP/1.1" 401 230
203.0.113.45 - - [06/Oct/2026:10:15:23 +0000] "POST /login HTTP/1.1" 401 230
203.0.113.45 - - [06/Oct/2026:10:15:24 +0000] "POST /login HTTP/1.1" 401 230
198.51.100.88 - - [06/Oct/2026:10:16:01 +0000] "GET /products.php?id=1%27%20OR%201=1-- HTTP/1.1" 500 1200
198.51.100.88 - - [06/Oct/2026:10:16:05 +0000] "GET /.env HTTP/1.1" 404 180
198.51.100.88 - - [06/Oct/2026:10:16:07 +0000] "GET /admin/config.json HTTP/1.1" 403 210
192.168.1.50 - - [06/Oct/2026:10:17:10 +0000] "GET /api/users HTTP/1.1" 500 450
192.168.1.50 - - [06/Oct/2026:10:17:11 +0000] "GET /api/users HTTP/1.1" 500 450
192.168.1.50 - - [06/Oct/2026:10:17:12 +0000] "GET /api/users HTTP/1.1" 500 450
Oct  6 10:18:00 server sshd[10421]: Failed password for invalid user admin from 198.51.100.99 port 54321 ssh2
Oct  6 10:18:02 server sshd[10421]: Failed password for invalid user root from 198.51.100.99 port 54322 ssh2`;

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!logText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/scan/logs/raw', { log_text: logText.trim() });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze log content. Check backend service connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const getThreatRatingColor = (rating) => {
    switch (rating) {
      case 'CRITICAL': return 'text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'HIGH': return 'text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'MEDIUM': return 'text-amber-400 bg-amber-950/40 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'LOW': return 'text-amber-400 bg-amber-950/40 border-amber-500/40';
      default: return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-8">
      {/* Header Banner */}
      <div className="cyber-glass-card p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(0,240,200,0.25)]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Log SIEM Anomaly Inspector</h2>
            <p className="text-xs text-slate-400 font-mono">Apache, Nginx & Linux Syslog Anomaly Parser</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Analyzes raw access log lines and authentication logs for brute-force login attempts, SQL injection indicators, sensitive endpoint probing, and HTTP 5xx error spikes.
        </p>

        {/* Input Form */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paste Log Lines or Ingest Log File</span>
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setLogText(sampleLog)}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
              >
                Load Sample Malicious Log Dataset
              </button>
              <label className="cursor-pointer text-[11px] font-mono border border-[var(--cyber-border)] px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center space-x-1.5 transition-colors">
                <Upload className="w-3 h-3 text-cyan-400" />
                <span>Upload .log File</span>
                <input type="file" accept=".log,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <textarea
            rows={8}
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="Paste log lines here (e.g. 203.0.113.45 - - [06/Oct/2026...] POST /login HTTP/1.1 401)..."
            className="w-full p-4 text-xs font-mono saas-input text-slate-100 placeholder:text-slate-500 focus:border-cyan-400"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading || !logText.trim()}
            className="cyber-btn-primary w-full py-3 text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Parsing SIEM Logs & Running Isolation Forest...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Execute Log Anomaly Inspection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs font-mono rounded-xl flex items-center space-x-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actual Results Dashboard Metrics */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="cyber-glass-card p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Lines Processed</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">{result.lines_processed}</span>
            </div>

            <div className="cyber-glass-card p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Malformed Lines</span>
              <span className="text-xl font-bold font-mono text-slate-400 mt-1 block">{result.malformed_lines}</span>
            </div>

            <div className="cyber-glass-card p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Failed Logins</span>
              <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{result.failed_logins}</span>
            </div>

            <div className="cyber-glass-card p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Anomalies Flagged</span>
              <span className={`text-xl font-bold font-mono mt-1 block ${result.anomalies_detected > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.anomalies_detected}
              </span>
            </div>

            <div className={`col-span-2 sm:col-span-1 border p-4 rounded-xl ${getThreatRatingColor(result.threat_rating)}`}>
              <span className="text-[10px] font-mono uppercase font-semibold block opacity-80">Threat Rating</span>
              <span className="text-xl font-bold font-mono mt-1 block">{result.threat_rating}</span>
            </div>
          </div>

          {/* Anomaly Details Cards */}
          {result.anomalies && result.anomalies.length > 0 ? (
            <div className="cyber-glass-card p-6 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Flagged Anomaly Telemetry Findings ({result.anomalies.length})</span>
              </h3>

              <div className="space-y-4">
                {result.anomalies.map((anom, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/70 border border-[var(--cyber-border)] rounded-xl space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className={`w-4 h-4 ${anom.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`} />
                        <h4 className="text-sm font-bold text-white font-mono">{anom.type}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        anom.severity === 'HIGH' ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}>
                        {anom.severity} SEVERITY
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                      <span>Source IP: <strong className="text-cyan-300">{anom.source_ip || 'N/A'}</strong></span>
                      {anom.failed_attempts && (
                        <span>Failed Attempts: <strong className="text-rose-400">{anom.failed_attempts}</strong></span>
                      )}
                      <span>Timestamp: <strong className="text-slate-300">{anom.timestamp}</strong></span>
                    </div>

                    <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                      <strong className="text-cyan-400">Technical Evidence:</strong> {anom.evidence}
                    </div>

                    <p className="text-xs text-emerald-300 font-medium pt-1">
                      <strong className="text-emerald-400 font-mono">Advisory:</strong> {anom.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-mono flex items-center space-x-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>No malicious security anomalies or brute force patterns were detected in the submitted log content.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
