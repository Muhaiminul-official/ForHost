import { Droplet, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  return (
    <footer className="bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Droplet className="w-6 h-6 text-red-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">BloodLink</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Connecting blood donors with people in need across university campuses.
            </p>
          </div>
          
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/find-donors" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Find Donors</Link></li>
              <li><Link to="/register" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Register</Link></li>
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Contact</Link></li>
              <li><Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Admin Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6">Blood Groups</h4>
            <div className="flex flex-wrap gap-2">
              {bloodGroups.map(bg => (
                <Link key={bg} to="/find-donors" className="px-2 py-1 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/5 hover:border-red-500/50 text-red-500 text-xs font-medium rounded transition-colors">
                  {bg}
                </Link>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6">Emergency</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Need blood urgently?</p>
            <Link to="/find-donors" className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1 transition-colors">
              Search Donors Now &rarr;
            </Link>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 dark:border-white/5 text-center flex flex-col items-center justify-center">
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by BloodLink Team &copy; 2026
          </p>
        </div>
      </div>
      
      {/* Floating Action Button */}
      {/*
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/20 flex items-center justify-center transition-transform hover:scale-105 z-50"
        aria-label="Scroll to top"
      >
        <Droplet className="w-6 h-6" />
      </button>
      */}
    </footer>
  );
}
