import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login, signUp } from '../services/authService';
import type { User } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = isSignUp 
        ? await signUp(username, password)
        : await login(username, password);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Promotional Content */}
      <div className="hidden lg:flex lg:flex-1 bg-[#d4e4ed] flex-col justify-between p-12 relative overflow-hidden">
        {/* Logo */}
        <div className="text-2xl font-serif font-bold italic text-gray-900">
          Wealthsimple
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-8 max-w-xl mx-auto">
          <p className="text-xs tracking-[0.2em] text-gray-600 uppercase mb-4">
            ENDS DECEMBER 23
          </p>
          <h1 className="text-5xl font-serif text-gray-900 leading-tight mb-6">
            Choose an iPhone,<br />Mac, or both
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed mb-2">
            However you manage your money, you can do it<br />
            with Wealthsimple. Just register, then transfer or<br />
            deposit at least $100,000 within 30 days.
          </p>
          <p className="text-gray-700">
            <a href="#" className="underline hover:text-gray-900">Terms and Conditions</a> apply.
          </p>

          {/* MacBook Image */}
          <div className="mt-8 w-full max-w-md">
            <div className="bg-[#b8d4e8] rounded-3xl p-8 relative">
              <div className="relative transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                <svg viewBox="0 0 200 120" className="w-full h-auto drop-shadow-2xl">
                  {/* Simplified MacBook illustration */}
                  <rect x="20" y="10" width="160" height="90" rx="5" fill="#e8e8e8" stroke="#c0c0c0" strokeWidth="2"/>
                  <rect x="25" y="15" width="150" height="75" rx="2" fill="linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"/>
                  <rect x="25" y="15" width="150" height="75" rx="2" fill="#1a1a2e"/>
                  {/* Screen Content */}
                  <rect x="30" y="20" width="140" height="65" fill="url(#screenGradient)"/>
                  <defs>
                    <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0066ff"/>
                      <stop offset="50%" stopColor="#00ccff"/>
                      <stop offset="100%" stopColor="#00ffcc"/>
                    </linearGradient>
                  </defs>
                  {/* Base */}
                  <path d="M10 100 L190 100 L185 108 Q100 115 15 108 Z" fill="#d4d4d4" stroke="#c0c0c0" strokeWidth="1"/>
                  <ellipse cx="100" cy="102" rx="15" ry="2" fill="#b0b0b0"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#c4d8e8] rounded-full opacity-50" />
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#c4d8e8] rounded-full opacity-30" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-between bg-[#1c1c1c] text-white p-8 lg:p-12">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-2xl font-semibold text-center mb-8">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors pr-12"
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm text-center py-2 bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}

            {/* Forgot Password */}
            {!isSignUp && (
              <div className="text-left">
                <button type="button" className="text-white underline text-sm hover:text-gray-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isSignUp ? 'Creating account...' : 'Logging in...'}
                  </>
                ) : (
                  isSignUp ? 'Sign up' : 'Log in'
                )}
              </button>
            </div>

            {/* Toggle Sign Up / Login */}
            <div className="text-center pt-4 text-sm">
              <span className="text-gray-400">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-white underline hover:text-gray-300 transition-colors"
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-8 border-t border-[#2a2a2a] mt-8">
          <button className="underline hover:text-gray-300 transition-colors">
            Help Centre
          </button>
          <div className="flex items-center gap-4">
            <span>Download our mobile apps</span>
            <a href="#" className="underline hover:text-gray-300 transition-colors">iPhone</a>
            <a href="#" className="underline hover:text-gray-300 transition-colors">Android</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

