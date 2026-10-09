import React, { useState } from 'react';
import api from '../services/api';
import { 
  FileText, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Terminal, 
  Info, 
  Zap, 
  Cpu,
  Trash2,
  FileCheck
} from 'lucide-react';

export default function LogAnalyzer() {
  const [logText, setLogText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sampleDatasets = [
    {
      label: 'Full Attack Scenario (Brute Force + SQLi + Probing)',
      content: `203.0.113.45 - - [06/Oct/2026:10:15:20 +0000] "POST /login HTTP/1.1" 401 230
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
Oct  6 10:18:02 server sshd[10421]: Failed password for invalid user root from 198.51.100.99 port 54322 ssh2`
    },
    {
      label: 'Linux SSH Auth Failures',
      content: `Oct  6 10:18:00 server sshd[10421]: Failed password for invalid user admin from 198.51.100.99 port 54321 ssh2
Oct  6 10:18:02 server sshd[10421]: Failed password for invalid user root from 198.51.100.99 port 54322 ssh2
Oct  6 10:18:05 server sshd[10421]: Failed password for invalid user oracle from 198.51.100.99 port 54323 ssh2
Oct  6 10:18:08 server sshd[10421]: Failed password for invalid user test from 198.51.100.99 port 54324 ssh2`
    },
    {
      label: 'Clean Web Traffic',
      content: `192.168.1.50 - - [06/Oct/2026:10:15:00 +0000] "GET /index.html HTTP/1.1" 200 4520
192.168.1.50 - - [06/Oct/2026:10:15:05 +0000] "GET /about.html HTTP/1.1" 200 1200
192.168.1.50 - - [06/Oct/2026:10:15:10 +0000] "GET /contact.html HTTP/1.1" 200 890`
    }
  ];

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

    setUploadedFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogText(evt.target.result || '');
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input so same file can be re-uploaded
  };

  const clearLogs = () => {
    setLogText('');
    setUploadedFileName('');
    setResult(null);
    setError(null);
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
            <p className="text-xs text-slate-400 font-mono">Apache, Nginx, Linux Syslog & Isolation Forest ML Engine</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Analyzes raw access log lines and authentication logs for brute-force login attempts, SQL injection indicators, sensitive endpoint probing, and HTTP 5xx error spikes with unsupervised Isolation Forest ML outlier analysis.
        </p>

        {/* Input Form */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paste Log Lines or Ingest Log File</span>
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer text-[11px] font-mono border border-[var(--cyber-border)] px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center space-x-1.5 transition-colors">
                <Upload className="w-3 h-3 text-cyan-400" />
                <span>Upload .log File</span>
                <input type="file" accept=".log,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {uploadedFileName && (
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 px-3 py-1.5 rounded-lg">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Loaded file: <strong>{uploadedFileName}</strong></span>
            </div>
          )}

          <textarea
            rows={8}
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="Paste log lines here (e.g. 203.0.113.45 - - [06/Oct/2026...] POST /login HTTP/1.1 401)..."
            className="w-full p-4 text-xs font-mono saas-input text-slate-100 placeholder:text-slate-500 focus:border-cyan-400"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAnalyze}
                disabled={loading || !logText.trim()}
                className="cyber-btn-primary px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-50"
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

              {logText && (
                <button
                  type="button"
                  onClick={clearLogs}
                  className="px-3.5 py-2 text-xs font-mono text-slate-400 hover:text-rose-300 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-colors flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {logText ? `${logText.split('\n').filter(l => l.trim()).length} lines staged` : 'No lines staged'}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-xs font-mono font-semibold text-slate-400 block mb-2">QUICK TEST PRESETS:</span>
            <div className="flex flex-wrap gap-2">
              {sampleDatasets.map((ds, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLogText(ds.content);
                    setUploadedFileName('');
                    setError(null);
                    setResult(null);
                  }}
                  className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 transition-all text-left"
                >
                  {ds.label}
                </button>
              ))}
            </div>
          </div>
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

          {/* ML Telemetry Banner if ML engine detected outliers */}
          {result.ml_anomalies_detected > 0 && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center space-x-3 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-cyan-300 uppercase">Isolation Forest ML Online: </span>
                <span>Flagged {result.ml_anomalies_detected} behavioral statistical outlier(s) using unsupervised multi-variate vector scoring.</span>
              </div>
            </div>
          )}

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
