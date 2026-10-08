import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, ShieldCheck, CheckCircle2, RefreshCw, Sparkles, AlertTriangle, Zap } from 'lucide-react';

export default function ReportsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/reports/recommendations');
      setData(response.data);
    } catch (err) {
      console.error('Failed to load AI advice recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/reports/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'AI_Cybersecurity_Audit_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF report. Please check backend service status.');
    } finally {
      setDownloading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority.includes('P1')) return 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    if (priority.includes('P2')) return 'bg-orange-500/15 text-orange-300 border-orange-500/40';
    if (priority.includes('P3')) return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 space-x-3 text-cyan-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Synthesizing evidence-based AI security recommendations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-8">
      {/* Header Banner */}
      <div className="cyber-glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-[0_0_12px_rgba(0,240,200,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Structured Evidence Synthesis & PDF Generator</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-white">AI Security Advice & Executive Audit</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Passes structured scan evidence from Web Vulnerability and Log Analyzer modules directly to the AI advisory engine to generate prioritized remediation guidance (P1-P4).
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="cyber-btn-primary px-6 py-3.5 text-xs font-heading font-bold uppercase tracking-wider flex items-center space-x-2 shrink-0 disabled:opacity-50"
        >
          {downloading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Compiling PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF Report</span>
            </>
          )}
        </button>
      </div>

      {/* Executive Summary Card */}
      <div className="cyber-glass-card p-6 space-y-3">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Executive Telemetry Summary</span>
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {data?.executive_summary || "Audit findings synthesized from active scanner telemetry."}
        </p>
      </div>

      {/* Prioritized Remediations (P1-P4) */}
      <div className="cyber-glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--cyber-border)] pb-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
            Prioritized Technical Remediations ({data?.key_findings_count || 0})
          </h3>
        </div>

        <div className="space-y-4">
          {data?.prioritized_remediations && data.prioritized_remediations.length > 0 ? (
            data.prioritized_remediations.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950/70 border border-[var(--cyber-border)] rounded-xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <h4 className="text-sm font-bold text-white font-heading">{item.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">{item.category}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.risk_explanation}</p>

                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                  <strong className="text-cyan-400">Technical Evidence:</strong> {item.technical_evidence}
                </div>

                <p className="text-xs text-emerald-300 font-semibold pt-0.5">
                  <strong className="text-emerald-400 font-mono">Recommended Action:</strong> {item.recommended_action}
                </p>
              </div>
            ))
          ) : (
            <div className="p-5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>No critical or high-priority remediation actions required for the baseline target.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
