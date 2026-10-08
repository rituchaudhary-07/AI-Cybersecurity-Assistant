import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
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
    <div className="auth-shell auth-grid min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md surface-card space-y-6 rounded-3xl border border-slate-700/80 p-6 shadow-2xl sm:p-8">
        <div className="space-y-2 text-center">
          <div className="mb-2 inline-flex rounded-2xl border border-teal-500/20 bg-teal-500/10 p-3 text-teal-400">
            <Shield className="h-8 w-8" />
          </div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[.2em] text-teal-400">Secure workspace</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Welcome back</h1>
          <p className="text-xs text-slate-400">Sign in to access your security tools.</p>
        </div>

        {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-medium text-slate-300">
            Email address
            <span className="relative mt-1.5 block"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="student@university.edu" className="glass-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100" /></span>
          </label>
          <label className="block text-xs font-medium text-slate-300">
            Password
            <span className="relative mt-1.5 block"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" /><input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="glass-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100" /></span>
          </label>
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-600 disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Sign in'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="border-t border-slate-800 pt-4 text-center text-xs text-slate-400">Don't have an account? <button onClick={onSwitchToRegister} className="font-medium text-teal-400 hover:underline">Create one</button></p>
      </div>
    </div>
  );
}
