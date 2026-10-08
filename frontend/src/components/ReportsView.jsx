import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, ShieldCheck, CheckCircle2, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';

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
    if (priority.includes('P1')) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (priority.includes('P2')) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (priority.includes('P3')) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 space-x-2 text-slate-500 font-mono text-xs">
        <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
        <span>Synthesizing evidence-based AI security recommendations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-mono text-teal-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Evidence Synthesis & PDF Generator</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">AI Security Advice & Executive Audit</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Passes structured scan evidence from Web Vulnerability and Log Analyzer modules directly to the AI advisory engine to generate prioritized remediation guidance (P1-P4).
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="saas-btn-primary px-6 py-3 text-xs font-semibold flex items-center space-x-2 shrink-0 shadow-sm disabled:opacity-50"
        >
          {downloading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF Audit Report</span>
            </>
          )}
        </button>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Executive Summary</h3>
        <p className="text-sm font-medium text-slate-800 leading-relaxed">
          {data?.executive_summary || "Audit findings synthesized from active scanner telemetry."}
        </p>
      </div>

      {/* Prioritized Remediations (P1-P4) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
            Prioritized Technical Remediations ({data?.key_findings_count || 0})
          </h3>
        </div>

        <div className="space-y-4">
          {data?.prioritized_remediations && data.prioritized_remediations.length > 0 ? (
            data.prioritized_remediations.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{item.category}</span>
                </div>

                <p className="text-xs text-slate-600">{item.risk_explanation}</p>

                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                  <strong>Technical Evidence:</strong> {item.technical_evidence}
                </div>

                <p className="text-xs text-teal-800 font-semibold pt-0.5">
                  <strong>Recommended Action:</strong> {item.recommended_action}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No critical or high-priority remediation actions required for the baseline target.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
