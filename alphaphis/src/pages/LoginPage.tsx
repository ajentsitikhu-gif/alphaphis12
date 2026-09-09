import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppRoute } from '../types';

interface LoginPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isAuthenticated, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to the reward home page
  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('/');
    }
  }, [isAuthenticated, onNavigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(username, password);
      setIsSubmitting(false);
      if (success) {
        onNavigate('/');
      } else {
        setLocalError('Invalid username or password.');
      }
    }, 300);
  };

  return (
    <div id="login-page" className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-blue-950 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Security Officer Portal
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Phishing Telemetry & Awareness Dashboard
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {(localError || error) && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label
              htmlFor="login-username"
              className="block text-xs font-bold text-neutral-700 mb-1"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all font-mono"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold text-neutral-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Access Security Dashboard</span>
              </>
            )}
          </button>

          {/* Return link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Prize Spin Wheel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
