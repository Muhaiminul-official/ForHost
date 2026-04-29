import { Target, Heart, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About <span className="text-red-500">BloodLink</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Connecting blood donors with people in need across university campuses in Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-8">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              To create a reliable, fast, and accessible blood donation network within universities, ensuring no patient suffers due to a shortage of blood donors.
            </p>
          </div>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-8">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Our Values</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              We believe in community, compassion, and the power of collective action. Every student donor can be a lifesaver — and we make it easy to connect.
            </p>
          </div>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-8">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">How It Works</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Students register with their blood group and location. When someone needs blood, they search our database and instantly connect with available donors nearby.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Our Journey</h2>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-red-500/30 bg-white dark:bg-[#111111] text-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 p-6 rounded-2xl">
                <div className="text-red-500 text-sm font-bold mb-1">2024</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Platform Launch</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">BloodLink started with 50 student donors at a single university.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-red-500/30 bg-white dark:bg-[#111111] text-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 p-6 rounded-2xl">
                <div className="text-red-500 text-sm font-bold mb-1">2025</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Growing Fast</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Expanded to 850+ donors across multiple universities in Bangladesh.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-red-500/30 bg-white dark:bg-[#111111] text-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 p-6 rounded-2xl">
                <div className="text-red-500 text-sm font-bold mb-1">2026</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Saving Lives</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Over 320 lives saved through our platform connections.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
