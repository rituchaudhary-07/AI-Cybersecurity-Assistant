import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || (err.message === 'Network Error'
        ? 'Cannot connect to the server. Verify that the backend is running on port 8000.'
        : 'Unable to sign in. Check your email and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-grid min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md cyber-glass-card space-y-6 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,200,0.15)] relative z-10 border border-cyan-500/30">
        <div className="space-y-2 text-center">
          <div className="mb-2 inline-flex rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-cyan-400 shadow-[0_0_15px_rgba(0,240,200,0.3)]">
            <Shield className="h-8 w-8 animate-pulse-slow" />
          </div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[.25em] text-cyan-400 flex items-center justify-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            SOC Command Portal
          </p>
          <h1 className="text-2xl font-heading font-extrabold tracking-wide text-white">Operator Authentication</h1>
          <p className="text-xs text-slate-400 font-sans">Sign in to access threat defense systems.</p>
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-mono font-medium text-slate-300">
            Username or Email Address
            <span className="relative mt-1.5 block">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="operator@security.io"
                className="saas-input w-full rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 font-mono"
              />
            </span>
          </label>
          <label className="block text-xs font-mono font-medium text-slate-300">
            Password
            <span className="relative mt-1.5 block">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
                className="saas-input w-full rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 font-mono"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="cyber-btn-primary flex w-full items-center justify-center gap-2 py-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In To Command Center'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="border-t border-[var(--cyber-border)] pt-4 text-center text-xs text-slate-400 font-mono">
          New operator?{' '}
          <button onClick={onSwitchToRegister} className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
            Register Account
          </button>
        </p>
      </div>
    </div>
  );
}
