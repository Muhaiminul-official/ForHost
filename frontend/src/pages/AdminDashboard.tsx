import { useState, useMemo, useEffect } from 'react';
import { Shield, Users, Activity, FileText, AlertTriangle, BarChart3, Search, Trash2, ToggleRight, Droplet, LogOut, TrendingUp, TrendingDown, Edit, MoreVertical, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, requestsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/users`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          fetch('/api/requests', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          // Map MongoDB _id to id
          setUsers(usersData.map((u: any) => ({ 
            ...u, 
            id: u._id, 
            blood: u.bloodGroup || 'N/A',
            studentId: u.studentId || 'N/A',
            joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'
          })));
        }
        
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRequests(requestsData.map((r: any) => ({ 
            ...r, 
            id: r._id, 
            patient: r.patientName, 
            blood: r.bloodGroup, 
            hospital: r.hospitalName, 
            neededBy: r.requiredDate,
            createdBy: r.createdBy?.name || 'Unknown'
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: 'Total Donors', value: users.length.toString(), icon: Users, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', trend: '+12%', trendUp: true },
    { label: 'Available Donors', value: users.filter(u => u.status === 'Available').length.toString(), icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', trend: '+5%', trendUp: true },
    { label: 'Total Requests', value: requests.length.toString(), icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: '-2%', trendUp: false },
    { label: 'Active Requests', value: requests.filter(r => r.status === 'Active').length.toString(), icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', trend: '+8%', trendUp: true },
  ];

  const handleDeleteUser = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-900 dark:text-white">Are you sure you want to delete this user?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${id}`, { 
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                  setUsers(users.filter(u => u.id !== id));
                  toast.success('User deleted successfully');
                } else {
                  toast.error('Failed to delete user');
                }
              } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('An error occurred while deleting user');
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleDeleteRequest = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-900 dark:text-white">Are you sure you want to delete this request?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/requests/${id}`, { 
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                  setRequests(requests.filter(r => r.id !== id));
                  toast.success('Request deleted successfully');
                } else {
                  toast.error('Failed to delete request');
                }
              } catch (error) {
                console.error('Error deleting request:', error);
                toast.error('An error occurred while deleting request');
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleToggleUserStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    const newStatus = user.status === 'Available' ? 'Unavailable' : 'Available';
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleToggleRole = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    const newRole = user.role === 'Admin' ? 'User' : 'Admin';
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleToggleRequestStatus = async (id: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;
    
    const newStatus = request.status === 'Active' ? 'Fulfilled' : 'Active';
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/requests/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleUpdatePriority = async (id: string, newPriority: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/requests/${id}/priority`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ priority: newPriority })
      });
      
      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, priority: newPriority } : r));
      }
    } catch (error) {
      console.error('Error updating request priority:', error);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white selection:bg-red-500/30 font-sans">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-600/5 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <Shield className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {greeting}, Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Here's what's happening with BloodLink today.</p>
            </div>
          </div>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 text-gray-700 dark:text-gray-300 hover:text-red-400 border border-gray-300 dark:border-white/10 hover:border-red-500/30 px-5 py-2.5 rounded-xl font-medium transition-all w-fit group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Logout
            </button>
          )}
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
            <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Syncing with database...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index} 
              className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-300 dark:border-white/10 transition-colors"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100`} />
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{stat.label}</p>
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 ${stat.bg} ${stat.border} border rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 relative z-10">
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${stat.trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-white dark:bg-[#111111]/80 backdrop-blur-md p-1.5 rounded-xl w-fit border border-gray-200 dark:border-white/5">
          {['analytics', 'users', 'requests'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors z-10 ${activeTab === tab ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-black/10 dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {tab === 'analytics' && <BarChart3 className="w-4 h-4" />}
              {tab === 'users' && <Users className="w-4 h-4" />}
              {tab === 'requests' && <FileText className="w-4 h-4" />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'analytics' && <AnalyticsTab users={users} requests={requests} />}
            {activeTab === 'users' && <UsersTab users={users} onDelete={handleDeleteUser} onToggleRole={handleToggleRole} onToggleUserStatus={handleToggleUserStatus} />}
            {activeTab === 'requests' && <RequestsTab requests={requests} onDelete={handleDeleteRequest} onToggleStatus={handleToggleRequestStatus} onUpdatePriority={handleUpdatePriority} />}
          </motion.div>
        </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

function AnalyticsTab({ users, requests }: { users: any[], requests: any[] }) {
  const bloodGroupData = useMemo(() => {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return groups.map(bg => ({
      name: bg,
      count: users.filter(u => u.blood === bg).length
    })).filter(g => g.count > 0);
  }, [users]);

  const divisionData = useMemo(() => {
    const divisions: { [key: string]: number } = {};
    users.forEach(u => {
      const div = u.division || 'Unknown';
      divisions[div] = (divisions[div] || 0) + 1;
    });
    return Object.keys(divisions)
      .map(d => ({ name: d, donors: divisions[d] }))
      .sort((a, b) => b.donors - a.donors)
      .slice(0, 5);
  }, [users]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const past6Months = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { month: months[d.getMonth()], year: d.getFullYear(), users: 0 };
    });

    users.forEach(u => {
      const date = new Date(u.createdAt || Date.now()); 
      const match = past6Months.find(m => m.month === months[date.getMonth()] && m.year === date.getFullYear());
      if (match) {
        match.users++;
      }
    });
    return past6Months.map(m => ({ month: m.month, users: m.users }));
  }, [users]);

  const recentActivities = useMemo(() => {
    const activities: any[] = [];
    users.forEach(u => {
      activities.push({
        id: `u-${u.id}`,
        type: 'registration',
        user: u.name || 'A user',
        date: new Date(u.createdAt || Date.now()),
        icon: Users,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
      });
    });
    requests.forEach(r => {
      activities.push({
        id: `r-${r.id}`,
        type: r.status === 'Fulfilled' ? 'fulfilled' : 'request',
        user: r.patient || 'A patient',
        date: new Date(r.createdAt || Date.now()),
        icon: r.status === 'Fulfilled' ? CheckCircle2 : FileText,
        color: r.status === 'Fulfilled' ? 'text-green-500' : 'text-yellow-500',
        bg: r.status === 'Fulfilled' ? 'bg-green-500/10' : 'bg-yellow-500/10'
      });
    });
    
    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10).map(a => {
      const diff = Date.now() - a.date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      let timeStr = 'Just now';
      if (minutes > 0 && minutes < 60) timeStr = `${minutes} min ago`;
      else if (hours > 0 && hours < 24) timeStr = `${hours} hours ago`;
      else if (days > 0) timeStr = `${days} days ago`;
      return { ...a, time: timeStr };
    });
  }, [users, requests]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 min-h-[380px] flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-500" /> Blood Group Distribution
            </h3>
            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bloodGroupData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  stroke="none"
                >
                  {bloodGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 min-h-[380px] flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" /> Donors by Division
            </h3>
            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={divisionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="donors" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 min-h-[400px] flex flex-col shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" /> Monthly Registrations
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Donors</span>
          </div>
        </div>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="users" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#111' }} activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" /> Recent Activities
          </h3>
          <button className="text-sm text-red-400 hover:text-red-300 transition-colors">View All</button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:border-white/5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                <activity.icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.type === 'registration' && <><span className="font-medium">{activity.user}</span> registered as a new donor.</>}
                  {activity.type === 'request' && <>New blood request for <span className="font-medium">{activity.user}</span>.</>}
                  {activity.type === 'fulfilled' && <>Blood request for <span className="font-medium">{activity.user}</span> was fulfilled.</>}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="text-center text-gray-500 py-4 text-sm">No recent activities found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users, onDelete, onToggleRole, onToggleUserStatus }: { users: any[], onDelete: (id: string) => void, onToggleRole: (id: string) => void, onToggleUserStatus: (id: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    user.studentId?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-black/5 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{users.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Available Donors</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{users.filter(u => u.status === 'Available').length}</p>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Admins</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{users.filter(u => u.role === 'Admin').length}</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
            <Shield className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage all registered donors and admins.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" 
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-white/10">
            <tr>
              <th className="pb-4 font-medium px-4">User</th>
              <th className="pb-4 font-medium px-4">Student ID</th>
              <th className="pb-4 font-medium px-4">Blood</th>
              <th className="pb-4 font-medium px-4">Role</th>
              <th className="pb-4 font-medium px-4">Status</th>
              <th className="pb-4 font-medium px-4">Joined</th>
              <th className="pb-4 font-medium px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-black/[0.03] dark:bg-white/[0.03] transition-colors group">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/10"
                    />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{user.studentId}</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-red-500/30 text-red-500 text-xs font-bold bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                    {user.blood}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    {user.status === 'Available' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-500" />}
                    <span className={user.status === 'Available' ? 'text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                      {user.status}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {user.joined}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onToggleRole(user.id)} className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors" title="Toggle Role">
                      <Shield className="w-4 h-4" />
                    </button>
                    <button onClick={() => onToggleUserStatus(user.id)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Toggle Status">
                      <ToggleRight className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit User">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(user.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete User">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Search className="w-8 h-8 mb-3 opacity-50" />
                    <p>No users found matching "{searchTerm}"</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RequestsTab({ requests, onDelete, onToggleStatus, onUpdatePriority }: { requests: any[], onDelete: (id: string) => void, onToggleStatus: (id: string) => void, onUpdatePriority: (id: string, priority: string) => void }) {
  const [filter, setFilter] = useState('All Requests');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req => {
    let matchFilter = true;
    if (filter !== 'All Requests') {
      matchFilter = req.status === filter;
    }
    
    let matchSearch = true;
    if (searchTerm.trim() !== '') {
      matchSearch = 
        req.patient?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
        req.hospital?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        req.blood?.toLowerCase()?.includes(searchTerm.toLowerCase());
    }

    return matchFilter && matchSearch;
  });

  return (
    <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-black/5 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{requests.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Active Requests</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{requests.filter(r => r.status === 'Active').length}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Fulfilled</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{requests.filter(r => r.status === 'Fulfilled').length}</p>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Blood Requests</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor and manage emergency blood requests.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" 
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-48 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none cursor-pointer"
          >
            <option>All Requests</option>
            <option>Active</option>
            <option>Fulfilled</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-white/10">
            <tr>
              <th className="pb-4 font-medium px-4">Patient Info</th>
              <th className="pb-4 font-medium px-4">Blood</th>
              <th className="pb-4 font-medium px-4">Hospital</th>
              <th className="pb-4 font-medium px-4">Priority</th>
              <th className="pb-4 font-medium px-4">Needed By</th>
              <th className="pb-4 font-medium px-4">Status</th>
              <th className="pb-4 font-medium px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
              <tr key={req.id} className="hover:bg-black/[0.03] dark:bg-white/[0.03] transition-colors group">
                <td className="py-4 px-4">
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{req.patient}</p>
                    <p className="text-gray-500 text-xs">Req by: {req.createdBy}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-red-500/30 text-red-500 text-xs font-bold bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                    {req.blood}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{req.hospital}</td>
                <td className="py-4 px-4">
                  <select
                    value={req.priority || 'Medium'}
                    onChange={(e) => onUpdatePriority(req.id, e.target.value)}
                    className={`inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border focus:outline-none cursor-pointer ${
                      req.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      req.priority === 'Medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}
                  >
                    <option value="Low" className="bg-gray-100 dark:bg-[#1a1a1a] text-blue-500">Low</option>
                    <option value="Medium" className="bg-gray-100 dark:bg-[#1a1a1a] text-orange-500">Medium</option>
                    <option value="High" className="bg-gray-100 dark:bg-[#1a1a1a] text-red-500">High</option>
                  </select>
                </td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {req.neededBy}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${req.status === 'Active' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                    {req.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onToggleStatus(req.id)} className={`p-2 rounded-lg transition-colors ${req.status === 'Active' ? 'text-green-400 hover:bg-green-500/10' : 'text-yellow-400 hover:bg-yellow-500/10'}`} title={req.status === 'Active' ? 'Mark as Fulfilled' : 'Mark as Active'}>
                      <ToggleRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(req.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Request">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-8 h-8 mb-3 opacity-50" />
                    <p>No requests found for this filter</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
