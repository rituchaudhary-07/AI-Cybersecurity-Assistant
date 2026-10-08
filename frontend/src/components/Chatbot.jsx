import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Sparkles, Shield, RefreshCw, BookOpen } from 'lucide-react';
import api from '../services/api';

function MessageContent({ content }) {
  return content.split('\n').map((line, index) => {
    const cleanLine = line.replace(/\*\*/g, '').trim();
    if (!cleanLine) return <div key={index} className="h-2" />;
    if (cleanLine.startsWith('### ')) {
      return <h3 key={index} className="mb-1 text-base font-bold text-slate-900">{cleanLine.slice(4)}</h3>;
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
    <div className="max-w-4xl mx-auto h-[calc(100dvh-8rem)] min-h-[540px] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              AI Security Assistant
              <span className="hidden sm:inline text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-mono font-medium border border-teal-200">
                RAG + Llama-3 70B Pipeline
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-normal">Cited Cybersecurity RAG Knowledge Base</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-medium flex items-center space-x-1 transition-colors border border-slate-200"
          title="Reset Chat Session"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`p-2 rounded-lg text-white shrink-0 ${
                msg.role === 'user'
                  ? 'bg-slate-900'
                  : 'bg-teal-600'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className="max-w-[85%] space-y-2">
              <div
                className={`p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-2xl rounded-tr-none font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none font-sans whitespace-pre-wrap shadow-sm'
                }`}
              >
                <MessageContent content={msg.content} />
              </div>

              {/* Citations Badges */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-2 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center space-x-1 font-semibold text-teal-700">
                    <BookOpen className="w-3 h-3" />
                    <span>Citations:</span>
                  </span>
                  {msg.citations.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200 font-medium">
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
            <div className="p-2 rounded-lg bg-teal-600 text-white animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 flex items-center space-x-2 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>Retrieving RAG knowledge vector chunks & querying model...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <span className="text-slate-500 font-medium whitespace-nowrap">Suggested:</span>
        <button
          onClick={() => handleQuickQuestion("How do I prevent Cross-Site Scripting (XSS)?")}
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full border border-slate-200 whitespace-nowrap transition-colors"
        >
          Prevent XSS
        </button>
        <button
          onClick={() => handleQuickQuestion("What are the key indicators of a phishing email?")}
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full border border-slate-200 whitespace-nowrap transition-colors"
        >
          Spot phishing
        </button>
        <button
          onClick={() => handleQuickQuestion("How does Shannon Entropy measure password strength?")}
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full border border-slate-200 whitespace-nowrap transition-colors"
        >
          Shannon Entropy
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a cybersecurity question (e.g. 'How do I secure my FastAPI endpoints?')..."
          className="min-w-0 flex-1 px-4 py-2.5 saas-input text-sm text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="saas-btn-primary px-3 sm:px-5 py-2.5 text-xs font-semibold flex items-center space-x-2 disabled:opacity-50"
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
