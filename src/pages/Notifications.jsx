import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiBell, 
  HiCheck, 
  HiCheckBadge, 
  HiExclamationTriangle, 
  HiClock,
  HiTrash
} from 'react-icons/hi2';
import { getNotifications, markNotificationAsRead, markAllNotificationsRead } from '../services/dataService';
import { formatRelativeTime } from '../lib/utils';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setLocalNotifs] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const { setNotifications: syncGlobalStore } = useStore();

  useEffect(() => {
    loadNotifs();
  }, []);

  async function loadNotifs() {
    const list = await getNotifications();
    setLocalNotifs(list);
    syncGlobalStore(list);
  }

  async function handleMarkRead(id) {
    const updated = await markNotificationAsRead(id);
    setLocalNotifs(updated);
    syncGlobalStore(updated);
    toast.success('Marked as read');
  }

  async function handleMarkAllRead() {
    const updated = await markAllNotificationsRead();
    setLocalNotifs(updated);
    syncGlobalStore(updated);
    toast.success('All notifications marked as read');
  }

  const filtered = notifications.filter(n => filter === 'all' || !n.read);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HiBell className="w-7 h-7 text-blue-400" /> Notification Center
          </h1>
          <p className="text-xs text-gray-400">
            Real-time deadline warnings, task assignments, and milestone alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-navy-900 border border-white/10 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'all' ? 'bg-white/10 text-white font-semibold' : 'text-gray-400'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'unread' ? 'bg-white/10 text-white font-semibold' : 'text-gray-400'}`}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white font-medium text-xs border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <HiCheck className="w-4 h-4 text-emerald-400" /> Mark All Read
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-navy-900/40 border border-white/5">
            <HiBell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Notifications</h3>
            <p className="text-xs text-gray-400">You're completely caught up with all workspace events.</p>
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n.$id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.read 
                  ? 'bg-navy-950/40 border-white/5 opacity-70' 
                  : 'bg-navy-900/80 border-blue-500/30 shadow-lg'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  n.type === 'assignment' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  n.type === 'warning' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {n.type === 'warning' ? <HiExclamationTriangle className="w-5 h-5" /> : <HiCheckBadge className="w-5 h-5" />}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">{n.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2">{n.message}</p>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <HiClock className="w-3.5 h-3.5" /> {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.$id)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-blue-400 font-semibold shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
