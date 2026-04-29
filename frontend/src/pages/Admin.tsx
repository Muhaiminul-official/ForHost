import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function Admin() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    setIsAdminLoggedIn(localStorage.getItem('isAdminLoggedIn') === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsAdminLoggedIn(false);
  };

  if (!isAdminLoggedIn) {
    return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
