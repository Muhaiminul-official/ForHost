import React from 'react';
import { Droplet, MapPin, Phone } from 'lucide-react';
import { Donor } from '../types';

interface DonorCardProps {
  donor: Donor;
  onClick: () => void;
}

const DonorCard: React.FC<DonorCardProps> = ({ donor, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 cursor-pointer hover:border-gray-300 dark:border-white/10 transition-colors"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{donor.name}</h3>
          <p className="text-xs text-gray-500">ID: {donor.studentId}</p>
        </div>
        <div className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-sm border border-red-500/20">
          <Droplet className="w-4 h-4" /> {donor.bloodGroup}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 text-red-500/70" /> 
          {donor.upazila}, {donor.district}, {donor.division}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="w-4 h-4 text-red-500/70" /> 
          {donor.phone}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1a1a1a] px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">
          <div className={`w-1.5 h-1.5 rounded-full ${donor.status === 'Available' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          {donor.status === 'Available' ? 'Available' : 'Not Available'}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${donor.phone}`; }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Phone className="w-4 h-4" /> Call Donor
        </button>
      </div>
    </div>
  );
};

export default DonorCard;
