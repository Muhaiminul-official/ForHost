import React, { useState } from 'react';
import { Droplet, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLocationData } from '../hooks/useLocationData';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { subscribeToPush } from '../utils/push';

export default function Register({ onLogin }: { onLogin: () => void }) {
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const navigate = useNavigate();

  const {
    divisions,
    districts,
    upazilas,
    loadingDivisions,
    loadingDistricts
  } = useLocationData(selectedDivision, selectedDistrict);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Logged in with Google! Set up your profile next.');
        
        if (Notification.permission === 'granted') {
          await subscribeToPush(data.token);
        }
        
        onLogin();
        navigate('/profile');
      } else {
        let errorMessage = 'Google login failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMessage = errorData.message;
        } catch (e) {
          console.error("Non-JSON error response from API");
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
    const data = Object.fromEntries(formData.entries());
    data.division = selectedDivision;
    data.district = selectedDistrict;
    data.upazila = selectedUpazila;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          password: data.password,
          studentId: data.studentId,
          department: data.department,
          batch: data.batch,
          dob: data.dob,
          bloodGroup: data.bloodGroup,
          phone: data.phone,
          division: data.division,
          district: data.district,
          upazila: data.upazila
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.token && responseData.user) {
          localStorage.setItem('token', responseData.token);
          localStorage.setItem('user', JSON.stringify(responseData.user));
          
          if (Notification.permission === 'granted') {
            await subscribeToPush(responseData.token);
          }
          
          onLogin();
          toast.success('Registration successful! You are now logged in.');
          navigate('/profile');
        } else {
          toast.success('Registration successful! Please login.');
          navigate('/login');
        }
      } else {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMessage = `Registration failed: ${errorData.message}`;
        } catch (e) {
          console.error("Non-JSON error response from API");
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('An error occurred during registration.');
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-3xl w-full px-4 sm:px-6">
        
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
            <UserPlus className="w-4 h-4" />
            Join BloodLink
          </span>
        </div>
        
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">Register as Donor</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-10">Fill in your details to become a blood donor.</p>

        <div className="flex justify-center mb-6">
           <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error('Google login failed');
              }}
           />
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-[#0a0a0a] text-gray-500">Or register with email</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Full Name *</label>
                <input 
                  name="fullName"
                  required
                  type="text" 
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                  placeholder="Your full name" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Student ID *</label>
                <input 
                  name="studentId"
                  required
                  type="text" 
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                  placeholder="e.g., 0272320005101116" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Department *</label>
                <input 
                  name="department"
                  required
                  type="text" 
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                  placeholder="e.g., CSE" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Batch *</label>
                <input 
                  name="batch"
                  required
                  type="text" 
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                  placeholder="e.g., 21" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email *</label>
                <input 
                  name="email"
                  required
                  type="email" 
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                  placeholder="you@university.edu" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Password *</label>
                <input 
                  name="password"
                  required
                  type="password" 
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                  placeholder="Min 6 characters" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Phone *</label>
                <input 
                  name="phone"
                  required
                  type="tel" 
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                  placeholder="+880 1XXX-XXXXXX" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Blood Group *</label>
                <select name="bloodGroup" required defaultValue="" className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none">
                  <option value="" disabled>Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Date of Birth *</label>
              <input 
                name="dob"
                required
                type="date" 
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors [color-scheme:dark]" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Division *</label>
                <div className="relative">
                  <select 
                    value={selectedDivision}
                    onChange={(e) => {
                      setSelectedDivision(e.target.value);
                      setSelectedDistrict('');
                      setSelectedUpazila('');
                    }}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none disabled:opacity-50"
                    disabled={loadingDivisions}
                  >
                    <option value="" disabled>{loadingDivisions ? 'Loading...' : 'Select Division'}</option>
                    {divisions.map(div => (
                      <option key={div.division} value={div.division}>{div.division}</option>
                    ))}
                  </select>
                  {loadingDivisions && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">District *</label>
                <div className="relative">
                  <select 
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedUpazila('');
                    }}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none disabled:opacity-50"
                    disabled={!selectedDivision || loadingDistricts}
                  >
                    <option value="" disabled>{loadingDistricts ? 'Loading...' : 'Select District'}</option>
                    {districts.map(dist => (
                      <option key={dist.district} value={dist.district}>{dist.district}</option>
                    ))}
                  </select>
                  {loadingDistricts && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Upazila *</label>
                <select 
                  value={selectedUpazila}
                  onChange={(e) => setSelectedUpazila(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none disabled:opacity-50"
                  disabled={!selectedDistrict}
                >
                  <option value="" disabled>Select Upazila</option>
                  {upazilas.map(upz => (
                    <option key={upz} value={upz}>{upz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Full Address</label>
              <input 
                name="address"
                type="text" 
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                placeholder="House, Road, Area..." 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Medical Conditions (if any)</label>
              <textarea 
                name="medicalConditions"
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors min-h-[100px]" 
                placeholder="Please mention any medical conditions, allergies, or medications you are currently taking..." 
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#e53e3e] hover:bg-[#c53030] text-white px-4 py-3.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 mt-8"
            >
              <Droplet className="w-5 h-5" />
              Register as Donor
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-red-500 hover:text-red-400 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
