import React, { useState } from 'react';
import { Droplet, MapPin, Phone, X, IdCard, User, Mail, Calendar, MessageCircle, BookOpen, Users, Activity, Map, Clock, AlertCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Donor } from '../types';
import toast from 'react-hot-toast';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-start gap-3">
    <div className="text-red-500 mt-0.5 shrink-0">
      {icon}
    </div>
    <div className="text-gray-700 dark:text-gray-300 text-base">
      <span className="text-gray-600 dark:text-gray-400">{label}:</span> <span className="text-gray-900 dark:text-white font-medium ml-1">{value || 'Not specified'}</span>
    </div>
  </div>
);

interface DonorModalProps {
  donor: Donor;
  onClose: () => void;
}

const DonorModal: React.FC<DonorModalProps> = ({ donor, onClose }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Request form state
  const [contactInfo, setContactInfo] = useState('');
  const [message, setMessage] = useState('');

  if (!donor) return null;

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

  const formatLocation = () => {
    const parts = [donor.upazila, donor.district, donor.division].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  const isEligible = React.useMemo(() => {
    if (donor.status !== 'Available') return false;
    if (!donor.lastDonation || donor.lastDonation === 'Never') return true;
    const lastDate = new Date(donor.lastDonation);
    if (isNaN(lastDate.getTime())) return true;
    const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 90; // 3 months
  }, [donor.lastDonation, donor.status]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo) {
       toast.error("Please provide your contact information.");
       return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to send direct requests.');
        setIsSubmitting(false);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/direct-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          donorId: donor.id || donor._id,
          contactInfo,
          message
        })
      });

      if (response.ok) {
        toast.success(`Request sent to ${donor.name}! They will be notified.`);
        setShowRequestForm(false);
        setContactInfo('');
        setMessage('');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to send request.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl w-full max-w-4xl overflow-hidden relative shadow-xl max-h-[90vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 sm:p-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pr-10">
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xl px-4 py-2 rounded-xl flex items-center gap-2">
              <Droplet className="w-5 h-5" />
              {donor.bloodGroup || 'N/A'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{donor.name || 'Donor Name'}</h1>
          </div>

          {!showRequestForm ? (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${donor.status === 'Available' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${donor.status === 'Available' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">
                    {donor.status === 'Available' ? 'Available' : 'Not Available'}
                  </span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isEligible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}`}>
                  <span className="text-sm font-medium">
                    {isEligible ? 'Eligible to Donate' : 'Not Eligible Yet'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-8">
                <DetailItem icon={<IdCard className="w-5 h-5" />} label="Student ID" value={donor.studentId} />
                <DetailItem icon={<BookOpen className="w-5 h-5" />} label="Department" value={donor.department} />
                <DetailItem icon={<Users className="w-5 h-5" />} label="Batch" value={donor.batch} />
                <DetailItem icon={<Map className="w-5 h-5" />} label="Address" value={donor.area} />
                <DetailItem icon={<MapPin className="w-5 h-5" />} label="Location" value={formatLocation()} />
                <DetailItem icon={<Mail className="w-5 h-5" />} label="Email" value={donor.email} />
                <DetailItem icon={<Phone className="w-5 h-5" />} label="Phone" value={donor.phone} />
                <DetailItem icon={<Clock className="w-5 h-5" />} label="Last Donation" value={donor.lastDonation && donor.lastDonation !== 'Never' ? formatDate(donor.lastDonation) : 'Never'} />
                <DetailItem icon={<Calendar className="w-5 h-5" />} label="Date of Birth" value={formatDate(donor.dob)} />
              </div>
              
              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-white/5 mb-8">
                <DetailItem icon={<AlertCircle className="w-5 h-5" />} label="Medical Conditions" value={donor.medicalConditions || 'None reported'} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowRequestForm(true)}
                  disabled={!isEligible}
                  title={!isEligible ? "This donor is currently not eligible to donate" : ""}
                  className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${isEligible ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed hidden'}`}
                >
                  <Send className="w-5 h-5" /> Request Blood Direct
                </button>
                <div className="flex gap-4 flex-1">
                  <button 
                    onClick={() => window.location.href = `tel:${donor.phone}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" /> Call
                  </button>
                  <button 
                    onClick={() => window.open(`https://wa.me/${donor.phone?.replace(/[^0-9]/g, '')}`, '_blank')}
                    className="flex-1 bg-[#128C7E] hover:bg-[#075E54] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 border-t border-gray-200 dark:border-white/5 pt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Send Direct Request to {donor.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">They will receive a notification and can accept or decline your request from their profile.</p>

              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Your Contact details (Phone/Hospital) *</label>
                  <input 
                    type="text" 
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="E.g., 017XXXXX at Dhaka Medical" 
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Message (Optional)</label>
                  <textarea 
                    rows={3} 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="We urgently need blood by tomorrow..." 
                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                  ></textarea>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white py-3 rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition-colors flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {isSubmitting ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorModal;
