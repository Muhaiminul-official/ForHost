import { User, Droplet, Mail, Phone, Shield, Crown } from 'lucide-react';

export default function Team() {
  const team = [
    {
      name: 'Dr. Aminul Islam',
      role: 'Admin & Founder',
      bloodGroup: 'O+',
      email: 'aminul@bloodlink.edu',
      phone: '+880 1711-000001',
      icon: Crown
    },
    {
      name: 'Tasnim Rahman',
      role: 'Moderator',
      bloodGroup: 'A+',
      email: 'tasnim@bloodlink.edu',
      phone: '+880 1812-000002',
      icon: Shield
    },
    {
      name: 'Sakib Hossain',
      role: 'Moderator',
      bloodGroup: 'B+',
      email: 'sakib@bloodlink.edu',
      phone: '+880 1913-000003',
      icon: Shield
    },
    {
      name: 'Nadia Sultana',
      role: 'Moderator',
      bloodGroup: 'AB+',
      email: 'nadia@bloodlink.edu',
      phone: '+880 1614-000004',
      icon: Shield
    }
  ];

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="text-red-500">Team</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Meet the people behind BloodLink who make this platform possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div key={index} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-8 text-center hover:border-gray-300 dark:border-white/10 transition-colors relative group">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
              
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 flex items-center justify-center mx-auto">
                  <User className="w-10 h-10 text-red-500/50" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-[#111111] rounded-full flex items-center justify-center border border-gray-200 dark:border-white/5">
                  <member.icon className="w-4 h-4 text-red-500" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
              <p className="text-red-500 text-sm font-medium mb-2">{member.role}</p>
              
              <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-6">
                <Droplet className="w-3 h-3" />
                {member.bloodGroup}
              </div>
              
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-red-500" />
                  {member.email}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" />
                  {member.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
