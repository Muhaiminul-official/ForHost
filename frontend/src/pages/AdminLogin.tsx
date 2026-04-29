import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@bloodlink.com';
    const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      onLogin();
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6">
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
              <Shield className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Admin Access</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Sign in to manage BloodLink</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input name="email" required type="email" className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="admin@bloodlink.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input name="password" required type="password" className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 mt-6">
              Secure Login
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
