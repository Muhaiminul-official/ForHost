import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Droplet, Loader2 } from 'lucide-react';
import { Donor } from '../types';
import DonorCard from '../components/DonorCard';
import DonorModal from '../components/DonorModal';
import { useLocationData } from '../hooks/useLocationData';

export default function FindDonors() {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  const [bloodGroup, setBloodGroup] = useState('All Groups');
  const [division, setDivision] = useState('All Divisions');
  const [district, setDistrict] = useState('All Districts');
  const [upazila, setUpazila] = useState('All Upazilas');

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users`);
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            let currentUserId = null;
            try {
              const userStr = localStorage.getItem('user');
              if (userStr) {
                const userObj = JSON.parse(userStr);
                currentUserId = userObj._id || userObj.id;
              }
            } catch (e) {
              // Ignore parsing errors
            }
            const filteredData = data.filter((u: any) => u.role !== 'admin' && u._id !== currentUserId);
            setDonors(filteredData.map((u: any) => ({
              _id: u._id,
              name: u.name,
              email: u.email,
              studentId: u.studentId,
              department: u.department,
              batch: u.batch,
              dob: u.dob,
              bloodGroup: u.bloodGroup,
              division: u.division || 'Unknown',
              district: u.district || 'Unknown',
              upazila: u.upazila || 'Unknown',
              address: u.address,
              phone: u.phone || 'N/A',
              lastDonation: u.lastDonation || 'Never',
              medicalConditions: u.medicalConditions,
              status: u.status || 'Available',
              role: u.role,
              createdAt: u.createdAt
            })));
          } else {
             const text = await response.text();
             console.error('Expected JSON but received:', text.substring(0, 100));
             throw new Error('Invalid content type');
          }
        }
      } catch (error: any) {
        console.error('Error fetching donors (network error)', error?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  const {
    divisions: apiDivisions,
    districts: apiDistricts,
    upazilas: apiUpazilas,
    loadingDivisions,
    loadingDistricts
  } = useLocationData(division, district);

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDivision(e.target.value);
    setDistrict('All Districts');
    setUpazila('All Upazilas');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrict(e.target.value);
    setUpazila('All Upazilas');
  };

  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchBloodGroup = bloodGroup === 'All Groups' || donor.bloodGroup === bloodGroup;
      const matchDivision = division === 'All Divisions' || donor.division === division;
      const matchDistrict = district === 'All Districts' || donor.district === district;
      const matchUpazila = upazila === 'All Upazilas' || donor.upazila === upazila;
      return matchBloodGroup && matchDivision && matchDistrict && matchUpazila;
    });
  }, [donors, bloodGroup, division, district, upazila]);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium mb-6">
            <Search className="w-4 h-4" />
            Find Blood Donors
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Search for Donors</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Filter donors by blood group and location to find the help you need.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {bloodGroups.map(bg => (
            <button 
              key={bg} 
              onClick={() => setBloodGroup(bloodGroup === bg ? 'All Groups' : bg)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${
                bloodGroup === bg 
                  ? 'bg-red-500 border-red-500 text-white' 
                  : 'bg-white dark:bg-[#111111] border-gray-300 dark:border-white/10 hover:border-red-500/50 hover:bg-red-500/5 text-white'
              }`}
            >
              <Droplet className={`w-4 h-4 ${bloodGroup === bg ? 'text-gray-900 dark:text-white' : 'text-red-500'}`} />
              {bg}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 md:p-8 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Blood Group</label>
              <select 
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
              >
                <option value="All Groups">All Groups</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Division</label>
              <div className="relative">
                <select 
                  value={division}
                  onChange={handleDivisionChange}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none disabled:opacity-50"
                  disabled={loadingDivisions}
                >
                  <option value="All Divisions">{loadingDivisions ? 'Loading...' : 'All Divisions'}</option>
                  {apiDivisions.map(div => <option key={div.division} value={div.division}>{div.division}</option>)}
                </select>
                {loadingDivisions && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">District</label>
              <div className="relative">
                <select 
                  value={district}
                  onChange={handleDistrictChange}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none disabled:opacity-50"
                  disabled={division === 'All Divisions' || loadingDistricts}
                >
                  <option value="All Districts">{loadingDistricts ? 'Loading...' : 'All Districts'}</option>
                  {apiDistricts.map(dist => <option key={dist.district} value={dist.district}>{dist.district}</option>)}
                </select>
                {loadingDistricts && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Upazila</label>
              <select 
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors appearance-none disabled:opacity-50"
                disabled={district === 'All Districts'}
              >
                <option value="All Upazilas">All Upazilas</option>
                {apiUpazilas.map(upz => <option key={upz} value={upz}>{upz}</option>)}
              </select>
            </div>
            <div>
              <button 
                onClick={() => {
                  setBloodGroup('All Groups');
                  setDivision('All Divisions');
                  setDistrict('All Districts');
                  setUpazila('All Upazilas');
                }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">Found <span className="text-red-500 font-bold">{filteredDonors.length}</span> donor{filteredDonors.length !== 1 && 's'}</p>
        </div>

        {filteredDonors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map(donor => (
              <DonorCard key={donor._id} donor={donor} onClick={() => setSelectedDonor(donor)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl">
            <Droplet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No donors found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters to find more donors.</p>
            <button 
              onClick={() => {
                setBloodGroup('All Groups');
                setDivision('All Divisions');
                setDistrict('All Districts');
                setUpazila('All Upazilas');
              }}
              className="mt-6 text-red-500 hover:text-red-400 font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {selectedDonor && (
        <DonorModal donor={selectedDonor} onClose={() => setSelectedDonor(null)} />
      )}
    </div>
  );
}
