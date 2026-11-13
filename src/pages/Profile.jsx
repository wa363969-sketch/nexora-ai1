import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HiUser, 
  HiEnvelope, 
  HiShieldCheck, 
  HiCamera, 
  HiCheckBadge,
  HiBriefcase,
  HiSparkles,
  HiCreditCard
} from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/ui/Avatar';
import { getSubscription } from '../services/dataService';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [sub, setSub] = useState(null);

  useEffect(() => {
    getSubscription().then(setSub).catch(() => {});
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await updateProfile(name.trim());
      toast.success('Profile updated successfully');
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = user?.labels?.includes('admin') || user?.role === 'admin' || user?.email?.includes('admin') || user?.email === 'wa363969@gmail.com';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <HiUser className="w-7 h-7 text-blue-400" /> User Profile & Credentials
        </h1>
        <p className="text-xs text-gray-400">
          Manage your personal identity, avatar, and system role permissions.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-8 rounded-2xl bg-navy-900 border border-white/10 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <Avatar name={user?.name || 'User'} size="2xl" />
            <button
              onClick={() => toast('Avatar upload connected via Appwrite Storage Buckets', { icon: '📷' })}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 transition-colors"
              title="Upload Avatar"
            >
              <HiCamera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-white">{user?.name || 'Workspace User'}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isAdmin ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}>
                {isAdmin ? 'System Administrator' : 'Engineering Lead'}
              </span>
            </div>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-500 justify-center sm:justify-start">
              <span className="flex items-center gap-1.5">
                <HiBriefcase className="w-4 h-4 text-gray-400" /> Core Engineering Guild
              </span>
              <span className="flex items-center gap-1.5">
                <HiShieldCheck className="w-4 h-4 text-emerald-400" /> Appwrite Cloud Verified
              </span>
              <Link to="/subscriptions" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition">
                <HiCreditCard className="w-4 h-4 text-violet-400" />
                <span>Tier: {sub?.planName || 'Free Starter'} ({sub?.status === 'trialing' ? '14-Day Trial' : 'Active'})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="pt-6 border-t border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950/80 border border-white/5 text-gray-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
