import { Droplet, User, Menu, X, Home, Search, PlusCircle, Info, Users, Phone, LogOut, Shield, Bell, Sun, Moon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
  link?: string;
}

export default function Navbar({ isLoggedIn, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const currentPage = location.pathname.replace('/', '') || 'home';

  const loadUser = () => {
    if (isLoggedIn) {
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          const firstName = savedUser.name ? savedUser.name.split(' ')[0] : (savedUser.fullName ? savedUser.fullName.split(' ')[0] : 'Profile');
          setUserName(firstName);
        } catch (e) {
          setUserName('Profile');
        }
      } else {
        setUserName('Profile');
      }
    } else {
      setUserName('');
    }
  };

  const loadNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    loadUser();
    loadNotifications();
    window.addEventListener('userUpdated', loadUser);
    
    let socket: any = null;
    if (isLoggedIn) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      const token = localStorage.getItem('token');
      socket = io(import.meta.env.VITE_API_URL || undefined, { auth: { token } });
      
      socket.on('notification', (newNotification: any) => {
        setNotifications(prev => [newNotification, ...prev]);

        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-[#111111] shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-gray-200 dark:border-white/10`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Bell className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New Notification</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{newNotification.message}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-white/10">
              <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-500 hover:text-red-400 focus:outline-none">
                Close
              </button>
            </div>
          </div>
        ), { duration: 5000, position: 'top-right' });
      });
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('userUpdated', loadUser);
      document.removeEventListener('mousedown', handleClickOutside);
      if (socket) socket.disconnect();
    };
  }, [isLoggedIn]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // In a real app, there'd be an API for this: PUT /api/notifications/read-all
    // For now we'll update locally and sequentially call APIs if needed, but lets just clear unread
    notifications.filter(n => !n.read).forEach(n => markAsRead(n._id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'find-donors', label: 'Find Donors' },
    ...(isLoggedIn ? [{ id: 'request-blood', label: 'Request Blood' }] : []),
    { id: 'about', label: 'About' },
    { id: 'team', label: 'Team' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    navigate(`/${id}`);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
              <Droplet className="w-6 h-6 text-red-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-900 dark:text-white">BloodLink</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === link.id
                      ? 'text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-full'
                      : 'text-gray-600 dark:text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {currentPage !== 'admin' && (
                isLoggedIn ? (
                  <>
                    <div className="relative" ref={notificationRef}>
                      <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-600 dark:text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </button>

                      {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                          <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#111111]">
                            <h3 className="text-gray-900 dark:text-white font-medium">Notifications</h3>
                            {unreadCount > 0 && (
                              <button onClick={markAllAsRead} className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">
                                Mark all as read
                              </button>
                            )}
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map(notification => (
                                <div 
                                  key={notification._id} 
                                  onClick={() => {
                                    markAsRead(notification._id);
                                    setShowNotifications(false);
                                    if (notification.link) {
                                      navigate(notification.link);
                                    }
                                  }}
                                  className={`p-4 border-b border-gray-100 dark:border-white/5 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!notification.read ? 'bg-red-50 dark:bg-red-500/5' : ''}`}
                                >
                                  <div className="flex gap-3">
                                    <div className="mt-1">
                                      <div className={`w-2 h-2 rounded-full ${!notification.read ? 'bg-red-500' : 'bg-transparent'}`}></div>
                                    </div>
                                    <div>
                                      <p className={`text-sm ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {notification.message}
                                      </p>
                                      <span className="text-xs text-gray-400 mt-1 block">
                                        {formatTime(new Date(notification.createdAt).getTime())}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center text-gray-500 text-sm">
                                No notifications yet
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleNavClick('profile')}
                      className={`hidden md:flex items-center gap-2 border border-gray-200 dark:border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-900 dark:text-white px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        currentPage === 'profile' ? 'bg-gray-50 dark:bg-black/5 dark:bg-white/5 border-gray-300 dark:border-gray-300 dark:border-white/20' : ''
                      }`}
                    >
                      <User className="w-4 h-4 text-red-500" />
                      {userName || 'Profile'}
                    </button>
                  </>
                ) : (
                  <div className="hidden md:flex items-center gap-4">
                    <button 
                      onClick={() => handleNavClick('login')}
                      className="text-gray-600 dark:text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => handleNavClick('register')}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all"
                    >
                      Register
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 z-50 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          <button onClick={() => handleNavClick('home')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentPage === 'home' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => handleNavClick('find-donors')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentPage === 'find-donors' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Find Donors</span>
          </button>
          {isLoggedIn && (
            <button onClick={() => handleNavClick('request-blood')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentPage === 'request-blood' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              <PlusCircle className="w-5 h-5" />
              <span className="text-[10px] font-medium">Request</span>
            </button>
          )}
          <button onClick={() => handleNavClick(isLoggedIn ? 'profile' : 'login')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${['profile', 'login', 'register'].includes(currentPage) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">{isLoggedIn ? 'Profile' : 'Login'}</span>
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isMobileMenuOpen || ['about', 'team', 'contact'].includes(currentPage) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Mobile More Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-[#111111] border-t border-gray-200 dark:border-white/5 rounded-t-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-full duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-900 dark:text-white">More Options</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 dark:text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <button onClick={() => handleNavClick('about')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium ${currentPage === 'about' ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : 'text-gray-700 dark:text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <Info className="w-5 h-5" /> About Us
              </button>
              <button onClick={() => handleNavClick('team')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium ${currentPage === 'team' ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : 'text-gray-700 dark:text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <Users className="w-5 h-5" /> Our Team
              </button>
              <button onClick={() => handleNavClick('contact')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium ${currentPage === 'contact' ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : 'text-gray-700 dark:text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <Phone className="w-5 h-5" /> Contact
              </button>
              
              {isLoggedIn && currentPage !== 'admin' && (
                <>
                  <div className="h-px bg-gray-200 dark:bg-black/10 dark:bg-white/10 my-2"></div>
                  <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
