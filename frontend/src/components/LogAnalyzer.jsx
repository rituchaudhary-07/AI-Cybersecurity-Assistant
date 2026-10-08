import React, { useState } from 'react';
import api from '../services/api';
import { FileText, Upload, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, Terminal, Info } from 'lucide-react';

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
      case 'CRITICAL': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'HIGH': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Log File Anomaly Inspector</h2>
            <p className="text-xs text-slate-500 font-mono">Apache, Nginx & Linux Syslog Anomaly Parser</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-2 max-w-2xl">
          Analyzes raw access log lines and authentication logs for brute-force login attempts, SQL injection indicators, sensitive endpoint probing, and HTTP 5xx error spikes.
        </p>

        {/* Input Form */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-mono font-semibold uppercase text-slate-500 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>Paste Log Lines or Upload Log File</span>
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setLogText(sampleLog)}
                className="text-[11px] font-mono text-teal-600 hover:underline font-semibold"
              >
                Load Sample Malicious Log Dataset
              </button>
              <label className="cursor-pointer text-[11px] font-mono border border-slate-200 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center space-x-1 transition-colors">
                <Upload className="w-3 h-3 text-slate-500" />
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
            className="w-full p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading || !logText.trim()}
            className="saas-btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Parsing Log Lines & Running Anomaly Detection...</span>
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
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actual Results Dashboard Metrics */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Lines Processed</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{result.lines_processed}</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Malformed Lines</span>
              <span className="text-xl font-bold font-mono text-slate-600 mt-1 block">{result.malformed_lines}</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Failed Logins</span>
              <span className="text-xl font-bold font-mono text-amber-600 mt-1 block">{result.failed_logins}</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Anomalies Flagged</span>
              <span className={`text-xl font-bold font-mono mt-1 block ${result.anomalies_detected > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {result.anomalies_detected}
              </span>
            </div>

            <div className={`col-span-2 sm:col-span-1 border p-4 rounded-xl shadow-sm ${getThreatRatingColor(result.threat_rating)}`}>
              <span className="text-[10px] font-mono uppercase font-semibold block opacity-80">Threat Rating</span>
              <span className="text-xl font-bold font-mono mt-1 block">{result.threat_rating}</span>
            </div>
          </div>

          {/* Anomaly Details Cards */}
          {result.anomalies && result.anomalies.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                Flagged Anomaly Telemetry Findings ({result.anomalies.length})
              </h3>

              <div className="space-y-4">
                {result.anomalies.map((anom, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className={`w-4 h-4 ${anom.severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`} />
                        <h4 className="text-sm font-bold text-slate-900 font-mono">{anom.type}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        anom.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {anom.severity} SEVERITY
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-1">
                      <span>Source IP: <strong className="text-slate-900">{anom.source_ip || 'N/A'}</strong></span>
                      {anom.failed_attempts && (
                        <span>Failed Attempts: <strong className="text-rose-600">{anom.failed_attempts}</strong></span>
                      )}
                      <span>Time: <strong className="text-slate-800">{anom.timestamp}</strong></span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                      <strong>Technical Evidence:</strong> {anom.evidence}
                    </div>

                    <p className="text-xs text-teal-800 font-medium pt-1">
                      <strong>Recommendation:</strong> {anom.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center space-x-3 shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>No malicious security anomalies or brute force patterns were detected in the submitted log content.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
