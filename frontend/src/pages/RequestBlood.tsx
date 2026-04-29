import { useState, FormEvent, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, Droplet, CheckCircle2, Loader2, MapPin, Calendar, Phone, List, PlusCircle, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLocationData } from '../hooks/useLocationData';
import { io } from 'socket.io-client';
import { checkEligibilityLocal } from '../utils/eligibility';

export default function RequestBlood() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'received'>('list');
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [loadingDirect, setLoadingDirect] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  
  const requestRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    divisions,
    districts,
    upazilas,
    loadingDivisions,
    loadingDistricts
  } = useLocationData(selectedDivision, selectedDistrict);

  useEffect(() => {
    if (activeTab === 'list') {
      const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/requests`);
          if (response.ok) {
            const data = await response.json();
            const filtered = data.filter((r: any) => r.status === 'Active' || r.status === 'Accepted');
            setRequests(filtered);
          } else {
             console.error('Failed to fetch requests, server responded:', response.status);
          }
        } catch (error) {
          console.error('Failed to fetch requests (Network error or server down):', error);
        } finally {
          setLoadingRequests(false);
        }
      };
      fetchRequests();
    } else if (activeTab === 'received') {
      const fetchDirectRequests = async () => {
        setLoadingDirect(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/direct-requests?type=received`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setReceivedRequests(data);
          } else {
            console.error('Failed to fetch direct requests, server responded:', response.status);
          }
        } catch (error) {
          console.error(`Failed to fetch received requests:`, error);
        } finally {
          setLoadingDirect(false);
        }
      };
      fetchDirectRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlight = params.get('highlight');
    const tab = params.get('tab');
    if (tab === 'received') {
      setActiveTab('received');
    } else if (highlight) {
      setActiveTab('list');
      setHighlightId(highlight);
      setTimeout(() => {
        if (requestRefs.current[highlight]) {
          requestRefs.current[highlight]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); // Give it a little time to fetch and render
    }
  }, [location.search, requests.length]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let socket: any = null;
    
    if (token) {
      socket = io(import.meta.env.VITE_API_URL || undefined, { auth: { token } });
    } else {
      socket = io(import.meta.env.VITE_API_URL || undefined);
    }

    socket.on('new-blood-request', (newReq: any) => {
      setRequests(prev => {
        // Prevent duplicates
        if (prev.some(req => req._id === newReq._id)) return prev;
        
        toast('A new blood request was posted!', { icon: '🩸' });
        return [newReq, ...prev];
      });
    });

    socket.on('blood-request-updated', (updatedReq: any) => {
      setRequests(prev => prev.map(req => req._id === updatedReq._id ? updatedReq : req));
    });

    socket.on('blood-request-deleted', (deletedReqId: string) => {
      setRequests(prev => prev.filter(req => req._id !== deletedReqId));
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleCancelRequest = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this blood request?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        toast.success('Request cancelled successfully.');
        setRequests(prev => prev.filter(req => req._id !== id));
      } else {
        const errorData = await response.json();
        toast.error(`Failed to cancel: ${errorData.message}`);
      }
    } catch (error) {
       toast.error('An error occurred while cancelling the request.');
    }
  };

  const handleRespondRequest = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to respond to a request.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/requests/${id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('You have successfully offered to donate! The requester will be notified.');
        const updatedRequest = await response.json();
        setRequests(prev => prev.map(req => req._id === id ? updatedRequest : req));
      } else {
        const errorData = await response.json();
        toast.error(`Failed to respond: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('An error occurred while responding.');
    }
  };

  const handleReviewResponse = async (requestId: string, donorId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/requests/${requestId}/responses/${donorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Donor response ${status.toLowerCase()} successfully!`);
        const updatedRequest = await response.json();
        setRequests(prev => prev.map(req => req._id === requestId ? updatedRequest : req));
      } else {
        const errorData = await response.json();
        toast.error(`Failed to review response: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error reviewing response:', error);
      toast.error('An error occurred while reviewing the response.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientName || !bloodGroup || !hospitalName || !selectedDivision || !selectedDistrict || !contactNumber || !requiredDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const userId = user?.id || user?._id;
      
      if (!user || !userId) {
        toast.error('You must be logged in to request blood.');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          patientName,
          bloodGroup,
          hospitalName,
          contactNumber,
          division: selectedDivision,
          district: selectedDistrict,
          upazila: selectedUpazila,
          requiredDate,
          message,
          createdBy: userId
        })
      });

      if (response.ok) {
        toast.success('Blood request submitted successfully! Donors have been notified.');
        
        // Reset form
        setPatientName('');
        setBloodGroup('');
        setHospitalName('');
        setSelectedDivision('');
        setSelectedDistrict('');
        setSelectedUpazila('');
        setContactNumber('');
        setRequiredDate('');
        setMessage('');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to submit request: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('An error occurred while submitting the request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium mb-6">
            <AlertCircle className="w-4 h-4" />
            Emergency Blood Request
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Request <span className="text-red-500">Blood</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Submit an emergency blood request to reach potential donors quickly</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-red-500/50'
            }`}
          >
            <List className="w-5 h-5" />
            All Requests
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-red-500/50'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            Create Request
          </button>
          
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'received'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-red-500/50'
            }`}
          >
            <Droplet className="w-5 h-5" />
            Direct Received
          </button>
        </div>

        {activeTab === 'create' ? (
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request Details</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Fill in the details below. Fields marked * are required.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Patient Name *</label>
                <input 
                  type="text" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name" 
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Blood Group *</label>
                <select 
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                >
                  <option value="">Select blood group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Hospital Name *</label>
              <input 
                type="text" 
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Enter hospital name" 
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Division *</label>
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
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">District *</label>
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
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Upazila</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Contact Number *</label>
                <input 
                  type="tel" 
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+880 1XXX-XXXXXX" 
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Required Date *</label>
                <input 
                  type="date" 
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-red-500 transition-colors" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Additional Message</label>
              <textarea 
                rows={4} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any additional details (e.g., number of bags needed, urgency level)..." 
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Blood Request'}
            </button>
          </form>
        </div>
        ) : activeTab === 'list' ? (
          <div className="space-y-6">
            {loadingRequests ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-12 text-center text-gray-600 dark:text-gray-400">
                No active blood requests found at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((req, index) => {
                  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                  const isCreator = currentUser.id === req.createdBy?._id || currentUser._id === req.createdBy?._id;
                  const isHighlighted = highlightId === req._id;
                  
                  return (
                    <div 
                      key={index} 
                      ref={el => requestRefs.current[req._id] = el}
                      className={`border rounded-2xl p-6 flex flex-col transition-all duration-700 ${
                        isHighlighted ? 'ring-4 ring-red-500 shadow-xl shadow-red-500/20 scale-[1.02]' 
                        : req.status === 'Accepted' ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-500/20' 
                        : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-white/5 hover:border-red-500/30'
                      }`}
                    >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-red-500 text-xs font-bold tracking-wider uppercase">
                        <AlertCircle className="w-4 h-4" />
                        {req.priority === 'High' ? 'Urgent Request' : 'Blood Request'}
                      </div>
                      <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-3 py-1 rounded-full font-bold text-sm">
                        <Droplet className="w-3 h-3" />
                        {req.bloodGroup}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">For: {req.patientName}</h3>
                    <p className="text-xs text-gray-500 mb-2">Requested by: <span className="font-medium text-gray-700 dark:text-gray-300">{req.createdBy?.name || 'Unknown'}</span></p>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">{req.message || 'No additional details provided.'}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                        <span>{req.hospitalName}{req.upazila ? `, ${req.upazila}` : ''}{req.district ? `, ${req.district}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                        <span>Needed by: {new Date(req.requiredDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {req.status === 'Accepted' ? (
                      <div className="flex flex-col gap-3 mt-auto">
                        <div className="w-full text-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-3 rounded-lg font-medium border border-green-200 dark:border-green-500/30 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Accepted by {req.acceptedBy?.name || 'a donor'}
                        </div>
                        {currentUser && (isCreator || (currentUser.id === req.acceptedBy?._id || currentUser._id === req.acceptedBy?._id || currentUser.id === req.acceptedBy || currentUser._id === req.acceptedBy)) ? (() => {
                          // The creator contacts the donor's phone, the donor contacts the requester's requested number.
                          const contactPhone = isCreator ? req.acceptedBy?.phone : req.contactNumber;
                          const contactLabel = isCreator ? 'Donor' : 'Requester';
                          
                          if (!contactPhone) return null;
                          
                          return (
                            <div className="grid grid-cols-2 gap-3">
                              <a href={`tel:${contactPhone}`} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white py-2.5 rounded-lg font-medium transition-colors text-sm">
                                <Phone className="w-4 h-4" />
                                Call {contactLabel}
                              </a>
                              <a href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] dark:bg-[#25D366]/20 dark:hover:bg-[#25D366]/30 py-2.5 rounded-lg font-medium transition-colors text-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                WhatsApp
                              </a>
                            </div>
                          );
                        })() : null}
                      </div>
                    ) : isCreator ? (
                      <div className="mt-auto">
                        <div className="w-full flex items-center gap-2 mb-4">
                          <div className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-medium transition-colors">
                             Your Request is Active
                          </div>
                          <button 
                            onClick={() => handleCancelRequest(req._id)}
                            className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white dark:bg-red-500/10 dark:hover:bg-red-500 p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0 border border-red-500/20"
                            title="Cancel Request"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        {req.donorResponses && req.donorResponses.length > 0 && (
                          <div className="border-t border-gray-100 dark:border-white/5 pt-4">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Donor Responses ({req.donorResponses.length})</h4>
                            <div className="space-y-3">
                              {req.donorResponses.map((resp: any, i: number) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-black/20 p-3 rounded-xl text-sm border border-gray-100 dark:border-white/5">
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                      {resp.donor?.name || 'Unknown'}
                                      <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{resp.donor?.bloodGroup}</span>
                                    </p>
                                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                                      <Phone className="w-3 h-3" /> {resp.donor?.phone || 'Hidden'}
                                    </p>
                                  </div>
                                  {resp.status === 'Pending' && req.status === 'Active' && (
                                    <div className="flex gap-2 shrink-0">
                                      <button onClick={() => { console.log('Accepting:', resp.donor); handleReviewResponse(req._id, resp.donor?._id || resp.donor, 'Accepted')}} className="text-green-700 font-bold px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-lg transition-colors">Accept</button>
                                      <button onClick={() => { console.log('Rejecting:', resp.donor); handleReviewResponse(req._id, resp.donor?._id || resp.donor, 'Rejected')}} className="text-red-700 font-bold px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors">Reject</button>
                                    </div>
                                  )}
                                  {resp.status === 'Accepted' && <span className="text-green-600 font-bold px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg">Accepted</span>}
                                  {resp.status === 'Rejected' && <span className="text-red-500 font-medium text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg">Rejected</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {(!req.donorResponses || req.donorResponses.length === 0) && (
                          <div className="border-t border-gray-100 dark:border-white/5 pt-4 text-center text-sm text-gray-500">
                            No donors have responded yet.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <a href={`tel:${req.contactNumber}`} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white py-2.5 rounded-lg font-medium transition-colors">
                          <Phone className="w-4 h-4" />
                          Call
                        </a>
                        {(() => {
                           const myResponse = req.donorResponses?.find((r: any) => r.donor?._id === currentUser.id || r.donor === currentUser.id || r.donor?._id === currentUser._id);
                           
                           if (myResponse) {
                             if (myResponse.status === 'Pending') {
                               return <div className="w-full text-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 py-2.5 rounded-lg font-medium border border-yellow-200 dark:border-yellow-900/30 text-sm flex items-center justify-center">Response Pending</div>;
                             }
                             if (myResponse.status === 'Accepted') {
                               return <div className="w-full text-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-500 py-2.5 rounded-lg font-medium border border-green-200 dark:border-green-900/30 text-sm flex items-center justify-center">You were Accepted!</div>;
                             }
                             if (myResponse.status === 'Rejected') {
                               return <div className="w-full text-center bg-gray-50 dark:bg-white/5 text-gray-500 py-2.5 rounded-lg font-medium border border-gray-200 dark:border-white/10 text-sm flex items-center justify-center">Offer Rejected</div>;
                             }
                           }

                           const isCurrentUserEligible = currentUser && checkEligibilityLocal(currentUser);

                           return (
                             <button 
                               onClick={() => handleRespondRequest(req._id)}
                               disabled={!isCurrentUserEligible}
                               title={!isCurrentUserEligible ? "You are currently not eligible to donate" : ""}
                               className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${isCurrentUserEligible ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                             >
                               <CheckCircle2 className="w-4 h-4" />
                               Offer to Donate
                             </button>
                           );
                        })()}
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'received' && (
          <div className="w-full space-y-6">
            {loadingDirect ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            ) : receivedRequests.length === 0 ? (
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-12 text-center text-gray-600 dark:text-gray-400">
                No direct requests received yet. Wait for people to find you via Find Donors.
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
                    
                    <div className="space-y-3 mb-6 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                      <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Requester Blood Group:</span> {req.requester?.bloodGroup || 'N/A'}</p>
                      <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Contact Info provided:</span> {req.contactInfo}</p>
                      {req.message && (
                        <p className="text-gray-700 dark:text-gray-300 mt-2 italic border-t border-gray-200 dark:border-white/10 pt-2 text-sm text-gray-500">"{req.message}"</p>
                      )}
                    </div>

                    {req.status === 'Pending' && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 flex flex-wrap gap-4 justify-end">
                        <button 
                          onClick={async () => {
                            try {
                              const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/direct-requests/${req._id}/status`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({ status: 'Declined' })
                              });
                              if (response.ok) {
                                toast.success(`Request declined`);
                                setReceivedRequests(prev => prev.map(r => r._id === req._id ? { ...r, status: 'Declined' } : r));
                              }
                            } catch (e) {
                              toast.error('Failed to decline request');
                            }
                          }}
                          className="px-6 py-2 rounded-xl text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-gray-300 dark:border-white/10"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/direct-requests/${req._id}/status`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({ status: 'Accepted' })
                              });
                              if (response.ok) {
                                toast.success(`Request accepted`);
                                setReceivedRequests(prev => prev.map(r => r._id === req._id ? { ...r, status: 'Accepted' } : r));
                              }
                            } catch (e) {
                              toast.error('Failed to accept request');
                            }
                          }}
                          className="px-6 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
