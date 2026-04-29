import { Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-[#161616] to-[#111111] border border-red-500/20 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Droplet className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Ready to Make a Difference?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Register today and become part of our growing community of life-savers.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/register')} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-lg font-medium transition-colors flex items-center gap-2">
                <Droplet className="w-5 h-5" />
                Register Now
              </button>
              <button onClick={() => navigate('/find-donors')} className="bg-gray-100 dark:bg-[#1a1a1a] hover:bg-[#222] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white px-8 py-3.5 rounded-lg font-medium transition-colors">
                Browse Donors
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
