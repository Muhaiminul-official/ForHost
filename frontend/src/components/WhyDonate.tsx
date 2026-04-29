import { Heart, Shield, Clock, Zap, Globe, Users } from 'lucide-react';

export default function WhyDonate() {
  const reasons = [
    {
      icon: Heart,
      title: 'Save Lives',
      description: 'A single donation can save up to 3 lives. Be someone\'s hero today.',
      highlight: false
    },
    {
      icon: Shield,
      title: 'Health Benefits',
      description: 'Regular donation reduces iron overload and improves cardiovascular health.',
      highlight: false
    },
    {
      icon: Clock,
      title: 'Quick & Easy',
      description: 'The entire process takes only 30-45 minutes of your time.',
      highlight: true
    },
    {
      icon: Zap,
      title: 'Instant Match',
      description: 'Our platform instantly connects you with nearby donors matching your blood type.',
      highlight: false
    },
    {
      icon: Globe,
      title: 'Campus Network',
      description: 'Access donors across all universities in Bangladesh through one platform.',
      highlight: false
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join a growing community of 850+ student donors making a difference.',
      highlight: false
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Donate Blood?</h2>
          <p className="text-gray-600 dark:text-gray-400">Every drop counts. Here's why your donation matters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-2xl border ${reason.highlight ? 'bg-red-50 dark:bg-[#1a1111] border-red-500/30' : 'bg-gray-50 dark:bg-[#161616] border-gray-200 dark:border-white/5'} hover:border-red-500/50 transition-colors group`}
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <reason.icon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{reason.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
