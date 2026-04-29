import { useState, useEffect } from 'react';
import { MapPin, Bell, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToPush } from '../utils/push';

export default function PermissionsPrompt({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show if not previously prompted
    const prompted = localStorage.getItem('permissions_prompted');
    if (!prompted) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    } else if (isLoggedIn) {
      // If already prompted and logged in, just try to initialize silently
      const token = localStorage.getItem('token');
      if (token && Notification.permission === 'granted') {
         subscribeToPush(token);
      }
    }
  }, [isLoggedIn]);

  const handleAllow = async () => {
    try {
      // 1. Request Location First
      if ('geolocation' in navigator) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => resolve(err),
            { enableHighAccuracy: true }
          );
        });
      }

      // 2. Request Notifications
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }

      // 3. If granted and logged in, subscribe immediately!
      if (Notification.permission === 'granted' && isLoggedIn) {
        const token = localStorage.getItem('token');
        if (token) {
          await subscribeToPush(token);
        }
      }
    } catch (error) {
      console.error('Permission error:', error);
    } finally {
      localStorage.setItem('permissions_prompted', 'true');
      setIsOpen(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('permissions_prompted', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4">
              <button onClick={handleSkip} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg relative z-10 border border-red-500/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Enable Permissions
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm">
              BloodLink requires location and push notifications to function optimally on your device and deliver urgent alerts.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Location Services</h3>
                  <p className="text-xs text-gray-500">Helps us find nearby blood donors and urgent requests exactly exactly where you are.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Push Notifications</h3>
                  <p className="text-xs text-gray-500">Essential for receiving direct requests and status updates from the community instantly.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAllow}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                Allow All Permissions
              </button>
              <button 
                onClick={handleSkip}
                className="w-full bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 font-medium py-3 px-6 rounded-xl transition-all text-sm"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
