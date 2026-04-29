/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FindDonors from './pages/FindDonors';
import RequestBlood from './pages/RequestBlood';
import About from './pages/About';
import Team from './pages/Team';
import { setupOnMessageListener } from './utils/firebase';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import PermissionsPrompt from './components/PermissionsPrompt';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    try {
      const unsubscribe = setupOnMessageListener((payload: any) => {
          if(payload?.notification) {
            import('react-hot-toast').then(({ toast }) => {
                toast(payload.notification.body, {
                    icon: '🔔',
                    duration: 5000
                });
            });
          }
      });
      return () => {
         // @ts-ignore
         if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
      };
    } catch(e) {
      console.log('FCM Error: ', e)
    }

  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-900 dark:text-white font-sans selection:bg-red-500/30 pb-16 md:pb-0">
      <Toaster />
      <PermissionsPrompt isLoggedIn={isLoggedIn} />
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/find-donors" element={<FindDonors />} />
        <Route path="/request-blood" element={<RequestBlood />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/profile" element={isLoggedIn ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
