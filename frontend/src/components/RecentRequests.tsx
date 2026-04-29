import { AlertCircle, Droplet, MapPin, Calendar, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RecentRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/requests`);
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            // Get only the most recent 3 active requests
            const recentPending = data
              .filter((req: any) => req.status === 'Active')
              .slice(0, 3);
            setRequests(recentPending);
          } else {
            const text = await response.text();
            console.error('Expected JSON but received:', text.substring(0, 100));
            throw new Error('Invalid content type');
          }
        } else {
          console.error('Failed to fetch recent requests: HTTP', response.status);
        }
      } catch (error: any) {
        console.error('Failed to fetch recent requests (network error)', error?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          Loading recent requests...
        </div>
      </section>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Recent Blood Requests</h2>
          <p className="text-gray-600 dark:text-gray-400">People who urgently need blood donors.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req, index) => (
            <div key={index} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold tracking-wider uppercase">
                  <AlertCircle className="w-4 h-4" />
                  {req.priority === 'High' ? 'Urgent Request' : 'Blood Request'}
                </div>
                <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-3 py-1 rounded-full font-bold text-sm">
                  <Droplet className="w-3 h-3" />
                  {req.bloodGroup}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">For: {req.patientName}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow">{req.message}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <span>{req.hospitalName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>Needed by: {new Date(req.requiredDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <a href={`tel:${req.contactNumber}`} className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors mt-auto">
                <Phone className="w-4 h-4" />
                Contact Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
