import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Sparkles, Shield, RefreshCw, BookOpen, Bot, Terminal } from 'lucide-react';
import api from '../services/api';

function MessageContent({ content }) {
  return content.split('\n').map((line, index) => {
    const cleanLine = line.replace(/\*\*/g, '').trim();
    if (!cleanLine) return <div key={index} className="h-2" />;
    if (cleanLine.startsWith('### ')) {
      return <h3 key={index} className="mb-1 text-sm sm:text-base font-heading font-bold text-cyan-300">{cleanLine.slice(4)}</h3>;
    }
    return <p key={index} className="my-0.5">{cleanLine}</p>;
  });
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '### Welcome to AI Cybersecurity Assistant & RAG Advisor!\n\nI am your AI security advisor powered by RAG knowledge retrieval. Ask me questions about **OWASP vulnerabilities**, **phishing defense**, **password entropy**, **log analysis**, or **network security**.',
      citations: ['OWASP Top 10 A01:2021', 'NIST SP 800-53 IA-5']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat/message', {
        messages: updatedMessages
      });
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply.content,
        citations: response.data.citations || []
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ **Error:** Unable to reach the AI Cybersecurity Assistant backend. Please check server connection.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (questionText) => {
    setInput(questionText);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100dvh-8rem)] min-h-[540px] flex flex-col cyber-glass-card overflow-hidden shadow-[0_0_30px_rgba(0,240,200,0.12)]">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-[var(--cyber-border)] bg-[var(--cyber-surface)]/90 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(0,240,200,0.25)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
              AI Security Mentor
              <span className="hidden sm:inline text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-medium border border-cyan-500/30">
                RAG + Llama-3 70B
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">Domain RAG Knowledge Base (OWASP, NIST, CVE)</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors border border-[var(--cyber-border)] hover:border-cyan-500/40"
          title="Reset Chat Session"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/40">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`p-2 rounded-xl text-white shrink-0 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-slate-800 border border-slate-700 text-cyan-400'
                  : 'bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-400/40 text-black shadow-[0_0_12px_rgba(0,240,200,0.3)]'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className="max-w-[85%] space-y-2">
              <div
                className={`p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl rounded-tr-none font-medium'
                    : 'bg-slate-900/90 border border-[var(--cyber-border)] text-slate-200 rounded-2xl rounded-tl-none font-sans whitespace-pre-wrap shadow-[0_0_15px_rgba(0,0,0,0.4)]'
                }`}
              >
                <MessageContent content={msg.content} />
              </div>

              {/* Citations Badges */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-2 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center space-x-1 font-semibold text-cyan-400">
                    <BookOpen className="w-3 h-3" />
                    <span>Citations:</span>
                  </span>
                  {msg.citations.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded border border-cyan-500/30 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-900/90 border border-[var(--cyber-border)] rounded-xl text-xs font-mono text-cyan-300 flex items-center space-x-2 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Retrieving RAG knowledge vector chunks & querying model...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-3 bg-[var(--cyber-surface)]/90 border-t border-[var(--cyber-border)] flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <span className="text-slate-400 font-medium whitespace-nowrap text-[11px]">SUGGESTED:</span>
        <button
          onClick={() => handleQuickQuestion("How do I prevent Cross-Site Scripting (XSS)?")}
          className="px-3 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-full border border-slate-700 hover:border-cyan-500/40 whitespace-nowrap transition-colors text-[11px]"
        >
          Prevent XSS
        </button>
        <button
          onClick={() => handleQuickQuestion("What are the key indicators of a phishing email?")}
          className="px-3 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-full border border-slate-700 hover:border-cyan-500/40 whitespace-nowrap transition-colors text-[11px]"
        >
          Spot Phishing
        </button>
        <button
          onClick={() => handleQuickQuestion("How does Shannon Entropy measure password strength?")}
          className="px-3 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-full border border-slate-700 hover:border-cyan-500/40 whitespace-nowrap transition-colors text-[11px]"
        >
          Shannon Entropy
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-[var(--cyber-border)] bg-[var(--cyber-surface)] flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a cybersecurity question (e.g. 'How do I secure my FastAPI endpoints?')..."
          className="min-w-0 flex-1 px-4 py-2.5 saas-input text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="cyber-btn-primary px-4 sm:px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-wider flex items-center space-x-2 disabled:opacity-50"
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
