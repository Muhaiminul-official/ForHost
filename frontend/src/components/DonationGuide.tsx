import { Clock, Droplet, Heart, AlertTriangle, Utensils } from 'lucide-react';
import { useState } from 'react';

export default function DonationGuide() {
  const [activeTab, setActiveTab] = useState('before');

  const tabs = [
    { id: 'before', label: 'Before Donation', icon: Clock },
    { id: 'during', label: 'During Donation', icon: Droplet },
    { id: 'after', label: 'After Donation', icon: Heart },
    { id: 'eligibility', label: 'Eligibility', icon: AlertTriangle },
    { id: 'foods', label: 'Best Foods', icon: Utensils },
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#111111]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Donation Guide</h2>
          <p className="text-gray-600 dark:text-gray-400">Everything you need to know before, during, and after donating.</p>
        </div>

        <div className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-white/5 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="p-8">
            {activeTab === 'before' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Before Donation</h3>
                </div>
                
                <ul className="space-y-4">
                  {[
                    "Get a good night's sleep",
                    "Eat a healthy meal",
                    "Drink plenty of water",
                    "Avoid fatty foods"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-500 text-xs font-bold">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Other tabs content would go here, but we only see 'before' in the screenshot */}
            {activeTab !== 'before' && (
              <div className="text-gray-600 dark:text-gray-400 py-8 text-center">
                Content for {tabs.find(t => t.id === activeTab)?.label}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
