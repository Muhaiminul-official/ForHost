import { X, MapPin, Calendar, Phone, Droplet, User, AlertCircle } from 'lucide-react';

interface RequestModalProps {
  request: any;
  onClose: () => void;
}

export default function RequestModal({ request, onClose }: RequestModalProps) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Droplet className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blood Request</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
                  {request.bloodGroup}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold">
                  <AlertCircle className="w-3 h-3" />
                  {request.priority || 'Urgent'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-1 text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Patient Name</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium pl-7">{request.patientName}</p>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-1 text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium pl-7">{request.hospitalName}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm pl-7 mt-1">
                {request.upazila}, {request.district}, {request.division}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-1 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Required Date</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium pl-7">
                  {new Date(request.requiredDate).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-1 text-gray-500 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Contact</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium pl-7">{request.contactNumber}</p>
              </div>
            </div>

            {request.message && (
              <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Message</span>
                <p className="text-gray-900 dark:text-white text-sm leading-relaxed">{request.message}</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
            <a 
              href={`tel:${request.contactNumber}`}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
