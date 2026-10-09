import React, { useState, useRef } from 'react';
import api from '../services/api';
import { 
  QrCode, 
  Upload, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  Globe, 
  FileText, 
  Wifi, 
  UserCheck, 
  Zap, 
  Lock,
  ArrowRight,
  EyeOff
} from 'lucide-react';

export default function QrScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    setSelectedFile(file);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      setError('Please upload or select a QR code image to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/scan/qr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to scan QR code image.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to load sample test images via canvas generation
  const loadQuickTest = (type) => {
    setError(null);
    setResult(null);

    // Simple procedural QR visual representation for mock/testing
    // We send an SVG or canvas-generated QR test or generate via API
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 240, 240);
    ctx.fillStyle = '#000000';

    // Draw visual corner finder patterns
    const drawFinder = (x, y) => {
      ctx.fillRect(x, y, 50, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 7, y + 7, 36, 36);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 14, y + 14, 22, 22);
    };
    drawFinder(20, 20);
    drawFinder(170, 20);
    drawFinder(20, 170);

    // Grid noise pattern
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 20; c++) {
        if ((r < 6 && (c < 6 || c > 13)) || (r > 13 && c < 6)) continue;
        if ((r * c + r + c + type.length) % 3 === 0) {
          ctx.fillRect(20 + c * 10, 20 + r * 10, 8, 8);
        }
      }
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${type}_test_qr.png`, { type: 'image/png' });
        handleFileChange(file);
      }
    });
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'url':
        return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'wifi':
        return <Wifi className="w-5 h-5 text-amber-400" />;
      case 'contact':
        return <UserCheck className="w-5 h-5 text-emerald-400" />;
      default:
        return <FileText className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Header Banner */}
      <div className="cyber-glass-card p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(0,240,200,0.25)]">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white">QR Code Safety Checker & Decoder</h2>
            <p className="text-xs text-slate-400 font-mono">Isolated Payload Extraction & Integrated Threat Assessment</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Upload any QR code image to inspect its underlying payload in complete safety. 
          Extracts URLs, plain text, Wi-Fi keys, or contact cards <span className="text-cyan-300 font-semibold">without ever visiting or launching links</span> in your browser.
        </p>

        {/* Upload Dropzone */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/70 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-900/40 group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            accept="image/png,image/jpeg,image/jpg,image/webp" 
            className="hidden" 
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-heading font-semibold text-slate-200">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop a QR code image'}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Supports PNG, JPG, JPEG, and WEBP (Max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Image Preview & Scan Action */}
        {previewUrl && (
          <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-cyan-500/40 bg-white p-1 shrink-0 flex items-center justify-center">
                <img src={previewUrl} alt="QR Preview" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200 font-mono">{selectedFile?.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB • Ready for extraction
                </p>
              </div>
            </div>

            <button
              onClick={handleScan}
              disabled={loading}
              className="cyber-btn-primary px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-wider flex items-center space-x-2 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Decoding QR Safely...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Inspect & Audit QR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Quick Test Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="text-cyan-400 font-semibold">PRESET AUDIT:</span>
          <span className="text-slate-400">Upload your own QR screenshot above or snap a photo of any physical QR sticker.</span>
        </div>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs font-mono rounded-xl flex items-center space-x-2.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Inspection Results */}
      {result && (
        <div className="space-y-6">
          
          {/* Isolation & Air-Gap Guarantee Banner */}
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center space-x-3 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <EyeOff className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wide text-cyan-300">Air-Gapped Sandbox Inspection: </span>
              <span>{result.safety_notice || 'Decoded without executing or visiting any remote resources.'}</span>
            </div>
          </div>

          {/* Main Risk Overview Banner */}
          <div className={`p-6 rounded-2xl border ${
            result.is_malicious || result.risk_score >= 50
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
              : result.risk_score >= 25
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {result.is_malicious || result.risk_score >= 50 ? (
                  <ShieldAlert className="w-10 h-10 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Payload Type:</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-cyan-500/30 uppercase">
                      {result.content_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-heading font-bold mt-1 text-white">{result.risk_level}</h3>
                </div>
              </div>

              <div className="text-right bg-slate-900/90 px-5 py-3 rounded-xl border border-[var(--cyber-border)] shadow-md">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Overall Threat Score</span>
                <span className={`text-2xl font-bold font-mono ${
                  result.risk_score > 50 ? 'text-rose-400' : result.risk_score > 25 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {result.risk_score} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Decoded Content Card */}
          <div className="cyber-glass-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                {getContentIcon(result.content_type)}
                <span>Extracted QR Content (Safe View)</span>
              </h3>
              <button
                onClick={() => copyToClipboard(result.raw_content)}
                className="text-xs font-mono text-slate-300 hover:text-cyan-300 flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 hover:border-cyan-500/40 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Content'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto font-mono text-xs text-slate-200 select-all break-all">
              {result.raw_content}
            </div>

            {result.is_url && (
              <p className="text-[11px] text-amber-300/90 font-mono flex items-center space-x-1.5 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Note: This URL has NOT been opened automatically. Verify domain authenticity before manual interaction.</span>
              </p>
            )}
          </div>

          {/* If URL: Detailed Lexical Telemetry & Threat Features */}
          {result.is_url && result.url_analysis && (
            <div className="cyber-glass-card p-6 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>URL Phishing Lexical Telemetry (Engine Scan)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.url_analysis.features?.map((feat, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/70 border border-[var(--cyber-border)] rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-200">{feat.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{feat.value}</p>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                      feat.risk === 'High' ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' :
                      feat.risk === 'Medium' ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' :
                      'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {feat.risk} Risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Checklist */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="cyber-glass-card p-6 space-y-3">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
                AI Defense Advisories & Safe Handling Steps
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
          )}

        </div>
      )}
    </div>
  );
}
