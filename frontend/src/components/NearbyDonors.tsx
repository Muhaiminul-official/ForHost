import React, { useState, useEffect } from 'react';
import { MapPin, Users, Droplet, HeartPulse, Heart, Loader2, Navigation } from 'lucide-react';
import { Donor } from '../types';
import DonorCard from './DonorCard';
import DonorModal from './DonorModal';

export default function NearbyDonors() {
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyDonors, setNearbyDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [allDonors, setAllDonors] = useState<Donor[]>([]);

  const stats = [
    { icon: Users, value: '850+', label: 'Registered Donors' },
    { icon: Droplet, value: '8', label: 'Blood Groups' },
    { icon: HeartPulse, value: '320+', label: 'Lives Saved' },
    { icon: Heart, value: '620+', label: 'Active Donors' },
  ];

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
            const donors = data.filter((u: any) => u.status === 'Available' && u.role !== 'admin' && u._id !== currentUserId);
            setAllDonors(donors);
          } else {
             const text = await response.text();
             console.error('Expected JSON but received:', text.substring(0, 100));
             throw new Error('Invalid content type');
          }
        } else {
          console.error('Failed to fetch donors: HTTP', response.status);
        }
      } catch (error: any) {
        console.error('Failed to fetch donors (network error)', error?.message);
      }
    };
    fetchDonors();
  }, []);

  const detectLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use OpenStreetMap Nominatim API for reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
          const data = await response.json();
          
          if (data && data.address) {
            const subDist = data.address.county || data.address.city || data.address.town || data.address.suburb || "";
            const dist = data.address.state_district || "";
            const division = data.address.state || "";
            
            const displayParts = [];
            if (subDist) displayParts.push(`${subDist}`);
            if (dist && dist !== subDist) displayParts.push(`${dist}`);
            if (division) displayParts.push(`${division}`);
            
            const displayLocName = displayParts.join(", ");
            setLocationName(displayLocName || "Unknown Location");
            
            // Search terms for filtering
            const searchTerms = [subDist, dist, division].filter(Boolean).map(s => s.toLowerCase());
            
            // Filter donors based on detected location
            const filtered = allDonors.filter(d => {
              if (searchTerms.length === 0) return false;
              return searchTerms.some(term => 
                (d.district && d.district.toLowerCase().includes(term)) || 
                (d.division && d.division.toLowerCase().includes(term)) ||
                (d.upazila && d.upazila.toLowerCase().includes(term)) ||
                (d.district && term.includes(d.district.toLowerCase())) ||
                (d.division && term.includes(d.division.toLowerCase()))
              );
            });
            
            setNearbyDonors(filtered);
          } else {
            setLocationName("Location found, but address unknown");
            setNearbyDonors([]);
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          setLocationError("Failed to get address from coordinates");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location access denied. Please allow location access in your browser settings.");
        } else {
          setLocationError("Unable to retrieve your location. Please check your connection or try again.");
        }
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (allDonors.length > 0) {
      detectLocation();
    }
  }, [allDonors]);

  return (
    <section className="py-20 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Nearby Donors</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Find blood donors near your location instantly.</p>
          
          <div className="flex flex-col items-center gap-4">
            {loadingLocation ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#111111] border border-gray-300 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                Detecting your location...
              </div>
            ) : locationError ? (
              <div className="flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <MapPin className="w-4 h-4" />
                  {locationError}
                </div>
                <button 
                  onClick={detectLocation}
                  className="flex items-center gap-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1a1a1a] hover:bg-[#222] px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 transition-colors"
                >
                  <Navigation className="w-4 h-4" /> Retry Location
                </button>
              </div>
            ) : locationName ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/5 border border-red-500/20 text-sm">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-gray-700 dark:text-gray-300">Showing donors near <span className="text-red-500 font-medium">{locationName}</span></span>
              </div>
            ) : (
              <button 
                onClick={detectLocation}
                className="flex items-center gap-2 text-sm text-gray-900 dark:text-white bg-red-500 hover:bg-red-600 px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-red-500/20"
              >
                <Navigation className="w-4 h-4" /> Detect My Location
              </button>
            )}
          </div>
        </div>

        {!loadingLocation && !locationError && locationName && (
          <div className="mb-16">
            {nearbyDonors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyDonors.map(donor => (
                  <DonorCard key={donor._id} donor={donor} onClick={() => setSelectedDonor(donor)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No donors were found in your area.</p>
                <p className="text-gray-500">Please select another district.</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-8 text-center hover:border-gray-300 dark:border-white/10 transition-colors">
              <div className="w-12 h-12 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedDonor && (
        <DonorModal donor={selectedDonor} onClose={() => setSelectedDonor(null)} />
      )}
    </section>
  );
}
