import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-20 bg-white dark:bg-[#111111]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What People Say</h2>
          <p className="text-gray-600 dark:text-gray-400">Stories from our community of donors and recipients.</p>
        </div>

        <div className="relative bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/5 rounded-2xl p-8 md:p-12 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10">
            <Quote className="w-12 h-12 text-red-500/20 mb-6" />
            
            <p className="text-xl md:text-2xl text-gray-900 dark:text-white font-medium leading-relaxed mb-10">
              "When my brother needed AB+ blood urgently, we found 3 donors nearby through BloodLink. Forever grateful to this community!"
            </p>
            
            <div className="flex items-end justify-between">
              <div>
                <h4 className="text-gray-900 dark:text-white font-bold mb-1">Nusrat Jahan</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pharmacy Student, Recipient</p>
                <span className="inline-block px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded">AB+</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] flex items-center justify-center text-gray-900 dark:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <div className="w-4 h-1.5 rounded-full bg-red-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
                <button className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] flex items-center justify-center text-gray-900 dark:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
