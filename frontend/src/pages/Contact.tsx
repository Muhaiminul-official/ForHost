import { MessageSquare, Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Have questions? Reach out to our team. We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="text-gray-900 dark:text-white font-medium">support@bloodlink.edu</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                <p className="text-gray-900 dark:text-white font-medium">+880 1711-000000</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                <p className="text-gray-900 dark:text-white font-medium">University Campus, Dhaka, Bangladesh</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Support Hours</p>
                <p className="text-gray-900 dark:text-white font-medium">24/7 Emergency Support</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 md:p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Name</label>
                  <input type="text" placeholder="Your name" className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email</label>
                  <input type="email" placeholder="you@email.com" className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Subject</label>
                <input type="text" placeholder="What's this about?" className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Message</label>
                <textarea rows={6} placeholder="Your message..." className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors resize-none"></textarea>
              </div>
              
              <button type="button" className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
