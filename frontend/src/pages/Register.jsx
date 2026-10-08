import React, { useState } from 'react';
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.detail || (err.message === 'Network Error'
        ? 'Cannot connect to the server. Verify that the backend is running on port 8000.'
        : 'Unable to create the account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full name', Icon: User, value: name, setValue: setName, type: 'text', autoComplete: 'name', placeholder: 'Alex Johnson' },
    { label: 'Email address', Icon: Mail, value: email, setValue: setEmail, type: 'email', autoComplete: 'email', placeholder: 'student@university.edu' },
    { label: 'Password', Icon: Lock, value: password, setValue: setPassword, type: 'password', autoComplete: 'new-password', placeholder: 'Create a strong password' },
  ];

  return (
    <div className="auth-shell auth-grid min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md surface-card space-y-6 rounded-3xl border border-slate-700/80 p-6 shadow-2xl sm:p-8">
        <div className="space-y-2 text-center"><div className="mb-2 inline-flex rounded-2xl border border-teal-500/20 bg-teal-500/10 p-3 text-teal-400"><Shield className="h-8 w-8" /></div><p className="font-mono text-[11px] font-medium uppercase tracking-[.2em] text-teal-400">Secure workspace</p><h1 className="text-2xl font-bold tracking-tight text-slate-100">Create your account</h1><p className="text-xs text-slate-400">Start using the security tools in a few seconds.</p></div>
        {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ label, Icon, value, setValue, type, autoComplete, placeholder }) => <label key={label} className="block text-xs font-medium text-slate-300">{label}<span className="relative mt-1.5 block"><Icon className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" /><input type={type} required autoComplete={autoComplete} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="glass-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100" /></span></label>)}
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-600 disabled:opacity-50">{loading ? 'Creating account...' : 'Create account'} <ArrowRight className="h-4 w-4" /></button>
        </form>
        <p className="border-t border-slate-800 pt-4 text-center text-xs text-slate-400">Already registered? <button onClick={onSwitchToLogin} className="font-medium text-teal-400 hover:underline">Sign in</button></p>
      </div>
    </div>
  );
}
