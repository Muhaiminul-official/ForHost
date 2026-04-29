import React from 'react';
import { Droplet, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { subscribeToPush } from '../utils/push';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://bloodlink-backend-pcro.onrender.com/'}/api/auth/google`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: credentialResponse.credential }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Logged in with Google!');

        if (Notification.permission === 'granted') {
          await subscribeToPush(data.token);
        }

        onLogin();
      } else {
        let errorMessage = 'Google login failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMessage = errorData.message;
        } catch (e) {
          console.error('Non-JSON error response from API');
        }
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Google login error:', err);
      toast.error('An error occurred during Google login.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Logged in successfully!');

        if (Notification.permission === 'granted') {
          await subscribeToPush(data.token);
        }

        onLogin();
      } else {
        let errorMessage = 'Invalid email or password';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.error('Non-JSON error response from API');
        }
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An error occurred during login.');
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6">
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
              <Droplet className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Sign in to continue to BloodLink
          </p>

          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error('Google login failed');
              }}
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-[#111111] text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="email"
                  required
                  type="email"
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Password
                </label>
                <a href="#" className="text-sm text-red-500 hover:text-red-400">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="password"
                  required
                  type="password"
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 mt-6"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-red-500 hover:text-red-400 font-medium"
            >
              Register now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
