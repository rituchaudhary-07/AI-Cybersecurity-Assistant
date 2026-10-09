import React, { useState } from 'react';
import api from '../services/api';
import { 
  MailWarning, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Trash2
} from 'lucide-react';

export default function SpamDetector() {
  const [message, setMessage] = useState('');
  const [sourceType, setSourceType] = useState('SMS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sampleMessages = [
    {
      label: 'Bank OTP Phish',
      type: 'SMS',
      text: 'URGENT: Your Wells Fargo debit card has been suspended due to suspicious activity. Send your 6-digit OTP verification code within 15 minutes to prevent account closure.'
    },
    {
      label: 'Lottery Prize Scam',
      type: 'Email',
      text: 'Congratulations! You have been selected as the grand winner of $2,500,000 in the International Lottery Draw. Claim your reward immediately by sending a wire transfer processing fee of $250.'
    },
    {
      label: 'IRS Tax Penalty',
      type: 'WhatsApp',
      text: 'Final Notice from IRS Law Enforcement: An arrest warrant has been issued against your name for overdue tax evasion. Pay immediately via Apple Gift Card or Bitcoin to clear penalties.'
    },
    {
      label: 'Phishing Link',
      type: 'SMS',
      text: 'Security Alert: Unauthorized login attempt detected from IP 192.168.1.1. Click http://paypal-security-update-verification.account-confirm.net/login immediately to secure your account.'
    },
    {
      label: 'Legitimate Workplace Memo',
      type: 'Email',
      text: 'Hi team, please remember our sprint retro is scheduled for tomorrow at 2 PM. Please update your Jira tickets before the meeting. Thank you!'
    }
  ];

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) {
      setError('Please paste or type a message to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/scan/spam-message', {
        message: message.trim(),
        source_type: sourceType
      });
      setResult(response.data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to analyze message.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setMessage(sample.text);
    setSourceType(sample.type);
    setError(null);
    setResult(null);
  };

  const clearForm = () => {
    setMessage('');
    setResult(null);
    setError(null);
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Header Banner */}
      <div className="cyber-glass-card p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(0,240,200,0.25)]">
            <MailWarning className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Spam, Phishing & Scam Message Detector</h2>
            <p className="text-xs text-slate-400 font-mono">Heuristic Threat Scoring & Social Engineering Heuristics</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Inspect suspicious SMS, Email, or WhatsApp communications. Detects artificial urgency, OTP/credential harvesting, lottery prize windfalls, wire transfer demands, and hidden phishing links without requiring external paid APIs.
        </p>

        {/* Source Channel Selector */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-semibold mr-1">CHANNEL:</span>
          {[
            { id: 'SMS', label: 'SMS / Text', icon: Smartphone },
            { id: 'Email', label: 'Email', icon: Mail },
            { id: 'WhatsApp', label: 'WhatsApp / Chat', icon: MessageSquare },
            { id: 'General', label: 'General Text', icon: Layers }
          ].map((channel) => {
            const Icon = channel.icon;
            const isSelected = sourceType === channel.id;
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => setSourceType(channel.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center space-x-2 transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{channel.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleScan} className="mt-4 space-y-3">
          <div className="relative">
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste suspicious SMS, email body, WhatsApp message, or direct message here..."
              className="w-full p-4 text-xs sm:text-sm saas-input text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 font-mono resize-y"
            />
            <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-500">
              {message.length} chars
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="cyber-btn-primary px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-wider flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Indicators...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Message</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {message && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4 py-2.5 text-xs font-mono text-slate-400 hover:text-rose-300 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-colors flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Privacy Protected: Messages are inspected in-memory and never shared with third parties.
            </span>
          </div>
        </form>

        {/* Quick Sample Presets */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono font-semibold text-slate-300">QUICK TEST PRESETS:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 transition-all text-left"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs font-mono rounded-xl flex items-center space-x-2.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          
          {/* Main Risk Overview Banner */}
          <div className={`p-6 rounded-2xl border ${
            result.risk_level === 'High'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
              : result.risk_level === 'Medium'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {result.is_spam_or_scam ? (
                  <ShieldAlert className="w-10 h-10 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Classification:</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-cyan-500/30 uppercase">
                      {result.is_spam_or_scam ? 'Suspected Scam / Spam' : 'Benign / Clean'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">({result.source_type})</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold mt-1 text-white">
                    {result.risk_level} Risk Level
                  </h3>
                </div>
              </div>

              <div className="text-right bg-slate-900/90 px-5 py-3 rounded-xl border border-[var(--cyber-border)] shadow-md">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Scam Risk Score</span>
                <span className={`text-2xl font-bold font-mono ${
                  result.risk_score >= 70 ? 'text-rose-400' : result.risk_score >= 35 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {result.risk_score} / 100
                </span>
              </div>
            </div>

            {/* Summary Sentence */}
            <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs font-mono text-slate-200">
              {result.summary}
            </div>
          </div>

          {/* Triggered Threat Categories Pills */}
          {result.categories_triggered && result.categories_triggered.length > 0 && (
            <div className="cyber-glass-card p-5 space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Detected Threat Categories</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {result.categories_triggered.map((cat, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 font-semibold"
                  >
                    • {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Indicator Breakdown */}
          {result.detected_indicators && result.detected_indicators.length > 0 ? (
            <div className="cyber-glass-card p-6 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Detected Social Engineering Indicators ({result.detected_indicators.length})</span>
              </h3>

              <div className="space-y-3">
                {result.detected_indicators.map((ind, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-heading font-semibold text-white">{ind.category}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getSeverityBadgeClass(ind.severity)}`}>
                          {ind.severity} Severity
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 font-semibold">
                        +{ind.weight} pts
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ind.description}
                    </p>

                    {ind.matched_phrases && ind.matched_phrases.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">Triggered by:</span>
                        {ind.matched_phrases.map((phrase, pIdx) => (
                          <span
                            key={pIdx}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300"
                          >
                            "{phrase}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cyber-glass-card p-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-200">No Malicious Indicators Found</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No urgency threats, fake lottery promises, OTP requests, or untraceable payment demands were found in this text.
              </p>
            </div>
          )}

          {/* Embedded URL Scan Results (if links were present) */}
          {result.detected_urls && result.detected_urls.length > 0 && (
            <div className="cyber-glass-card p-6 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Embedded URL Deep Analysis ({result.detected_urls.length} link{result.detected_urls.length > 1 ? 's' : ''})</span>
              </h3>

              <div className="space-y-3">
                {result.detected_urls.map((link, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono font-bold text-white break-all">{link.raw_url}</span>
                        <p className="text-[11px] font-mono text-slate-400">Target Domain: {link.domain || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded font-semibold border ${
                          link.risk_score >= 50 ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' :
                          link.risk_score >= 25 ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' :
                          'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        }`}>
                          Score: {link.risk_score}/100 ({link.risk_level})
                        </span>
                      </div>
                    </div>

                    {link.threat_indicators && link.threat_indicators.length > 0 && (
                      <div className="text-[11px] font-mono text-rose-300/90 pt-1">
                        Threat flags: {link.threat_indicators.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="cyber-glass-card p-6 space-y-3">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
                AI Defense Advisories & Recommendations
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
