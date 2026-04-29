import { Droplet, Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-[#111111]">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 blur-[100px] rounded-full mix-blend-screen" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            University Blood Donation Platform
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
            Donate Blood,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Save Lives
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
            Join our university community of blood donors. Help save lives by registering as a donor or find the blood you need in an emergency.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => navigate('/register')} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              <Heart className="w-5 h-5" />
              Register as Donor
            </button>
            <button onClick={() => navigate('/find-donors')} className="flex items-center gap-2 bg-gray-100 dark:bg-[#1a1a1a] hover:bg-[#222] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Find Donors
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
