import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Save, Loader2, Droplet, Mail, Phone, MapPin, Calendar, Edit, RefreshCw, LogOut, X, AlertCircle, IdCard, BookOpen, Users, Map, Clock, Bell, Settings, Send, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLocationData } from '../hooks/useLocationData';
import { io } from 'socket.io-client';
import { checkEligibilityLocal } from '../utils/eligibility';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="text-red-500 mt-0.5 shrink-0">
      {icon}
    </div>
    <div className="text-gray-700 dark:text-gray-300 text-base">
      <span className="text-gray-600 dark:text-gray-400">{label}:</span> <span className="text-gray-900 dark:text-white font-medium ml-1">{value || 'Not specified'}</span>
    </div>
  </div>
);

export default function Profile({ onLogout }: { onLogout?: () => void }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'profile' | 'received' | 'sent'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'received' || tab === 'sent' || tab === 'profile') {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const user = await response.json();
          setUserData(user);
          setSelectedDivision(user.division || '');
          setSelectedDistrict(user.district || '');
          setSelectedUpazila(user.upazila || '');
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'received' || activeTab === 'sent') {
      const fetchDirectRequests = async () => {
        setLoadingRequests(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/direct-requests?type=${activeTab}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (activeTab === 'received') setReceivedRequests(data);
            else setSentRequests(data);
          } else {
            console.error(`Failed to fetch ${activeTab} requests, server status:`, response.status);
          }
        } catch (error) {
          console.error(`Failed to fetch ${activeTab} requests (network error)`);
        } finally {
          setLoadingRequests(false);
        }
      };
      fetchDirectRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL || undefined, { auth: { token } });

    socket.on("new-direct-request", (newReq: any) => {
      // Add to received requests if we are the donor
      if (userData?._id && newReq.donor?._id === userData._id) {
        setReceivedRequests(prev => [newReq, ...prev]);
        toast.success(`New blood request received from ${newReq.requester?.name}!`);
      }
    });

    socket.on("direct-request-updated", (updatedReq: any) => {
      // Update in our sent requests if we are the requester
      if (userData?._id && updatedReq.requester?._id === userData._id) {
        setSentRequests(prev => prev.map(req => req._id === updatedReq._id ? updatedReq : req));
      }
      // Or in received if we are donor
      if (userData?._id && updatedReq.donor?._id === userData._id) {
        setReceivedRequests(prev => prev.map(req => req._id === updatedReq._id ? updatedReq : req));
      }
    });

    socket.on("direct-request-cancelled", (cancelledReqId: string) => {
      setReceivedRequests(prev => prev.filter(req => req._id !== cancelledReqId));
      toast('A direct request to you was cancelled.', { icon: 'ℹ️' });
    });

    return () => {
      socket.disconnect();
    };
  }, [userData?._id]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/direct-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast.success(`Request ${newStatus.toLowerCase()}!`);
        // Refresh received requests
        setReceivedRequests(prev => prev.map(req => req._id === id ? { ...req, status: newStatus } : req));
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const executeCancelRequest = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/direct-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        toast.success('Request cancelled successfully!');
        setSentRequests(prev => prev.filter(req => req._id !== id));
        setCancelConfirmId(null);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to cancel request');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling the request');
    }
  };

  const {
    divisions,
    districts,
    upazilas,
    loadingDivisions,
    loadingDistricts
  } = useLocationData(selectedDivision, selectedDistrict);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.division = selectedDivision;
    data.district = selectedDistrict;
    data.upazila = selectedUpazila;
    
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        window.dispatchEvent(new Event('userUpdated'));
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          setIsEditing(false);
        }, 1000);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating profile');
    }
  };

  const toggleAvailability = async () => {
    setIsUpdatingAvailability(true);
    try {
      const newStatus = userData.status === 'Available' ? 'Unavailable' : 'Available';
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const updateDonation = async () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ lastDonation: today })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error updating donation date:', error);
    }
  };

  const getLocalDateString = (dateStr: string) => {
    if (!dateStr || dateStr === 'Never') return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatLocation = () => {
    const parts = [userData.upazila, userData.district, userData.division].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Never') return dateString || 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  const isEligible = () => {
    if (!userData.lastDonation || userData.lastDonation === 'Never') return true;
    const lastDate = new Date(userData.lastDonation);
    if (isNaN(lastDate.getTime())) return true;
    const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 90;
  };

  if (isEditing) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="max-w-3xl w-full px-4 sm:px-6">
          <div className="flex justify-between items-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
              <Edit className="w-4 h-4" />
              Edit Profile
            </span>
            <button 
              onClick={() => setIsEditing(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Update Details</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-10">Update your personal and medical details.</p>

          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Full Name *</label>
                  <input 
                    name="name"
                    type="text" 
                    defaultValue={userData.name || userData.fullName || ''}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                    placeholder="Your full name" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Student ID *</label>
                  <input 
                    name="studentId"
                    type="text" 
                    defaultValue={userData.studentId || ''}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                    placeholder="e.g., 0272320005101116" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Department *</label>
                  <input 
                    name="department"
                    type="text" 
                    defaultValue={userData.department || ''}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                    placeholder="e.g., CSE" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Batch *</label>
                  <input 
                    name="batch"
                    type="text" 
                    defaultValue={userData.batch || ''}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                    placeholder="e.g., 21" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email *</label>
                  <input 
                    name="email"
                    type="email" 
                    defaultValue={userData.email || ''}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                    placeholder="you@university.edu" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Phone *</label>
                  <input 
                    name="phone"
                    type="tel" 
                    defaultValue={userData.phone || ''}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                    placeholder="+880 1XXX-XXXXXX" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Blood Group *</label>
                  <select name="bloodGroup" value={userData.bloodGroup || ''} onChange={(e) => setUserData({...userData, bloodGroup: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none" required>
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Date of Birth *</label>
                  <input 
                    name="dob"
                    type="date" 
                    defaultValue={userData.dob || ''}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors [color-scheme:dark]" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Last Donation Date</label>
                  <input 
                    name="lastDonation"
                    type="date" 
                    defaultValue={getLocalDateString(userData.lastDonation)}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors [color-scheme:dark]" 
                  />
                </div>
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
                      required
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
                      required
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
                    required
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
                  defaultValue={userData.address || ''}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                  placeholder="House, Road, Area..." 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Medical Conditions (if any)</label>
                <textarea 
                  name="medicalConditions"
                  defaultValue={userData.medicalConditions || ''}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors min-h-[100px]" 
                  placeholder="Please mention any medical conditions, allergies, or medications you are currently taking..." 
                ></textarea>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-transparent border border-gray-300 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-white px-4 py-3.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[#e53e3e] hover:bg-[#c53030] text-white px-4 py-3.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center">
      <div className="max-w-4xl w-full px-4 sm:px-6 flex flex-col items-center">
        
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 w-full max-w-2xl bg-white dark:bg-[#111111] p-2 rounded-2xl border border-gray-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">My Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'received'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="hidden sm:inline">Received Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Sent Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

        {activeTab === 'settings' && (
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">App Settings</h2>
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-red-500" />
                  Notifications & Push
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Browser Permission</p>
                      <p className="text-xs text-gray-500">Status: {Notification.permission}</p>
                    </div>
                    {Notification.permission !== 'granted' ? (
                      <button 
                        onClick={async () => {
                          const permission = await Notification.requestPermission();
                          if (permission === 'granted') {
                            toast.success('Permission granted!');
                            window.location.reload();
                          }
                        }}
                        className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                      >
                        Grant Access
                      </button>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Push Subscription</p>
                      <p className="text-xs text-gray-500">Tokens: {userData?.pushSubscriptions?.length || 0} registered</p>
                    </div>
                    <button 
                      onClick={async () => {
                        const { subscribeToPush } = await import('../utils/push');
                        const token = localStorage.getItem('token');
                        if (token) {
                          toast.promise(subscribeToPush(token), {
                            loading: 'Registering push...',
                            success: 'Push registered successfully!',
                            error: 'Failed to register push.'
                          });
                        }
                      }}
                      className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg transition-colors border border-gray-200 dark:border-white/10"
                    >
                      Update Token
                    </button>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/notifications/test-push', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                          });
                          if (response.ok) {
                            const data = await response.json();
                            toast.success(data.message);
                          } else {
                            toast.error('Failed to send test push');
                          }
                        } catch (err) {
                          toast.error('Network error');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Send Test Notification
                    </button>
                    <p className="text-[10px] text-gray-500 mt-2 text-center">
                      This will trigger a real-time socket event AND a push notification to your device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-red-500" />
                  Account Management
                </h3>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 text-red-500 font-bold py-3 px-4 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="w-5 h-5" />
                  Logout from Account
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="w-full">
            {/* Profile Info Card */}
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-10 w-full shadow-xl">
              
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xl px-4 py-2 rounded-xl flex items-center gap-2">
                  <Droplet className="w-5 h-5" />
                  {userData.bloodGroup || 'N/A'}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{userData.name || userData.fullName || 'User Name'}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${userData.status === 'Available' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${userData.status === 'Available' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">
                    {userData.status === 'Available' ? 'Available' : 'Not Available'}
                  </span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isEligible() ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}`}>
                  <span className="text-sm font-medium">
                    {isEligible() ? 'Eligible to Donate' : 'Not Eligible Yet'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <DetailItem icon={<IdCard className="w-5 h-5" />} label="Student ID" value={userData.studentId} />
                <DetailItem icon={<BookOpen className="w-5 h-5" />} label="Department" value={userData.department} />
                <DetailItem icon={<Users className="w-5 h-5" />} label="Batch" value={userData.batch} />
                <DetailItem icon={<Map className="w-5 h-5" />} label="Address" value={userData.address} />
                <DetailItem icon={<MapPin className="w-5 h-5" />} label="Location" value={formatLocation()} />
                <DetailItem icon={<Mail className="w-5 h-5" />} label="Email" value={userData.email} />
                <DetailItem icon={<Phone className="w-5 h-5" />} label="Phone" value={userData.phone} />
                <DetailItem icon={<Clock className="w-5 h-5" />} label="Last Donation" value={userData.lastDonation && userData.lastDonation !== 'Never' ? formatDate(userData.lastDonation) : 'Never'} />
                <DetailItem icon={<Calendar className="w-5 h-5" />} label="Date of Birth" value={formatDate(userData.dob)} />
              </div>
              
              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-white/5">
                <DetailItem icon={<AlertCircle className="w-5 h-5" />} label="Medical Conditions" value={userData.medicalConditions || 'None reported'} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 w-full">
              <button 
                onClick={() => setIsEditing(true)}
                className="border border-red-500 text-gray-900 dark:text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-red-500/10 transition-colors font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
              
              <button 
                onClick={updateDonation}
                className="bg-red-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-red-600 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Update Donation
              </button>
              
              <button 
                onClick={toggleAvailability}
                disabled={isUpdatingAvailability}
                className="border border-gray-300 dark:border-white/10 text-red-500 px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium disabled:opacity-50"
              >
                {isUpdatingAvailability ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Droplet className="w-4 h-4" />
                )}
                {userData.status === 'Available' ? 'Set Unavailable' : 'Set Available'}
              </button>

              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="border border-gray-300 dark:border-white/10 text-red-500 px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'received' || activeTab === 'sent') && (
          <div className="w-full space-y-6">
            {loadingRequests ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            ) : (
              activeTab === 'received' ? (
                receivedRequests.length === 0 ? (
                  <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-12 text-center text-gray-600 dark:text-gray-400">
                    No requests received yet.
                  </div>
                ) : (
                  receivedRequests.map((req, idx) => (
                    <div key={req._id || idx} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request from {req.requester?.name}</h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Date: {new Date(req.createdAt).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                          req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          req.status === 'Accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <DetailItem 
                          icon={<Phone className="w-4 h-4" />} 
                          label="Requester Phone" 
                          value={
                            req.requester?.phone ? (
                              <span>{req.requester.phone}</span>
                            ) : 'N/A'
                          } 
                        />
                        <DetailItem icon={<AlertCircle className="w-4 h-4" />} label="Contact Info / Hospital" value={req.contactInfo} />
                      </div>
                      
                      {req.message && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300">
                          <strong>Message:</strong> {req.message}
                        </div>
                      )}

                      {req.status === 'Pending' ? (
                        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                          {(() => {
                             const eligible = checkEligibilityLocal(userData);
                             return (
                               <button 
                                 onClick={() => handleUpdateStatus(req._id, 'Accepted')} 
                                 disabled={!eligible}
                                 title={!eligible ? "You are not eligible to accept requests" : ""}
                                 className={`flex-1 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${eligible ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed hidden'}`}
                               >
                                 <CheckCircle className="w-5 h-5" /> Accept
                               </button>
                             );
                          })()}
                          <button onClick={() => handleUpdateStatus(req._id, 'Declined')} className="flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                            <XCircle className="w-5 h-5" /> Decline
                          </button>
                        </div>
                      ) : req.status === 'Accepted' && req.requester?.phone ? (
                        <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                          <a href={`tel:${req.requester.phone}`} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white py-2.5 rounded-lg font-medium transition-colors text-sm">
                            <Phone className="w-4 h-4" />
                            Call Requester
                          </a>
                          <a href={`https://wa.me/${req.requester.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] dark:bg-[#25D366]/20 dark:hover:bg-[#25D366]/30 py-2.5 rounded-lg font-medium transition-colors text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            WhatsApp
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ))
                )
              ) : (
                sentRequests.length === 0 ? (
                  <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-12 text-center text-gray-600 dark:text-gray-400">
                    You haven't sent any direct requests yet.
                  </div>
                ) : (
                  sentRequests.map((req, idx) => (
                    <div key={req._id || idx} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sent to {req.donor?.name}</h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Date: {new Date(req.createdAt).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                          req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          req.status === 'Accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <DetailItem 
                          icon={<Phone className="w-4 h-4" />} 
                          label="Donor Phone" 
                          value={
                            req.status === 'Accepted' && req.donor?.phone ? (
                              <span>{req.donor.phone}</span>
                            ) : req.status === 'Accepted' ? 'N/A' : 'Hidden until accepted'
                          } 
                        />
                        <DetailItem icon={<AlertCircle className="w-4 h-4" />} label="Contact Info Provided" value={req.contactInfo} />
                      </div>
                      {req.message && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300">
                          <strong>Your Message:</strong> {req.message}
                        </div>
                      )}
                      {req.status === 'Pending' ? (
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end">
                          {cancelConfirmId === req._id ? (
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Are you sure?</span>
                              <button onClick={() => executeCancelRequest(req._id)} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                                Yes, Cancel
                              </button>
                              <button onClick={() => setCancelConfirmId(null)} className="bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                                No
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setCancelConfirmId(req._id)} className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                              <X className="w-4 h-4" /> Cancel Request
                            </button>
                          )}
                        </div>
                      ) : req.status === 'Accepted' && req.donor?.phone ? (
                        <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                          <a href={`tel:${req.donor.phone}`} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white py-2.5 rounded-lg font-medium transition-colors text-sm">
                            <Phone className="w-4 h-4" />
                            Call Donor
                          </a>
                          <a href={`https://wa.me/${req.donor.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] dark:bg-[#25D366]/20 dark:hover:bg-[#25D366]/30 py-2.5 rounded-lg font-medium transition-colors text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            WhatsApp
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ))
                )
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
}
