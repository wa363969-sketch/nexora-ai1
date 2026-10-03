import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiSparkles, 
  HiArrowRight, 
  HiFolder, 
  HiCheckCircle, 
  HiShieldCheck, 
  HiUsers,
  HiCpuChip,
  HiArrowTopRightOnSquare
} from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';
import { getProjects, getTasks, getSubscription, getAllClientWorkspaces } from '../../services/dataService';

const ADMIN_EMAIL = 'wa363969@gmail.com';

export default function UserDashboardStrip() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexora_user_session');
      if (raw) {
        const u = JSON.parse(raw);
        setUser(u);
        loadUserStats(u);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  async function loadUserStats(u) {
    try {
      const isAdmin = Boolean(
        u?.email?.toLowerCase() === ADMIN_EMAIL ||
        u?.role === 'admin' ||
        u?.labels?.includes('admin')
      );

      const [projects, tasks, sub] = await Promise.all([
        getProjects(),
        getTasks(),
        getSubscription(),
      ]);

      if (isAdmin) {
        const allClients = getAllClientWorkspaces();
        const clientCount = allClients.filter(c => !c.isAdmin).length;
        const totalAi = allClients.reduce((acc, c) => acc + (c.aiQueriesUsed || 0), 0);
        setStats({
          isAdmin: true,
          clientCount,
          activeProjects: projects.length,
          totalTasks: tasks.length,
          aiQueriesUsed: totalAi || (sub.aiQueriesUsed || 218),
          planName: 'Enterprise SLA (Owner)',
        });
      } else {
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const doneTasks = tasks.filter(t => t.status === 'done').length;
        setStats({
          isAdmin: false,
          activeProjects,
          totalProjects: projects.length,
          doneTasks,
          totalTasks: tasks.length,
          planName: sub.planName || 'Starter Free',
          aiUsed: sub.aiQueriesUsed || 0,
          maxAi: sub.maxAiQueries || 100,
          displayName: u.name || u.email?.split('@')[0] || 'Client',
        });
      }
    } catch (e) {
      console.warn('Failed to load strip stats:', e);
    } finally {
      setLoading(false);
    }
  }

  if (!user || loading || !stats) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-40 w-full mt-16 lg:mt-20 border-b shadow-lg"
      >
        {stats.isAdmin ? (
          // ================= ADMIN STRIP =================
          <div className="bg-gradient-to-r from-violet-950/95 via-navy-950/95 to-purple-950/95 border-violet-500/30 backdrop-blur-xl px-4 py-3 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Left: Admin Identity */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-black uppercase tracking-wider">
                  <HiShieldCheck className="w-4 h-4 text-violet-400" />
                  Admin Superuser
                </div>
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                  {user.email}
                </span>

                {/* Platform Overview Pills */}
                <div className="flex items-center gap-4 text-xs text-gray-300 ml-1">
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                    <HiUsers className="w-3.5 h-3.5 text-blue-400" />
                    <strong className="text-white font-bold">{stats.clientCount}</strong> Clients
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                    <HiFolder className="w-3.5 h-3.5 text-emerald-400" />
                    <strong className="text-white font-bold">{stats.activeProjects}</strong> Master Projects
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                    <HiCheckCircle className="w-3.5 h-3.5 text-teal-400" />
                    <strong className="text-white font-bold">{stats.totalTasks}</strong> Tasks
                  </span>
                  <span className="hidden lg:flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                    <HiCpuChip className="w-3.5 h-3.5 text-purple-400" />
                    <strong className="text-white font-bold">{stats.aiQueriesUsed.toLocaleString()}</strong> AI Prompts
                  </span>
                </div>
              </div>

              {/* Right: Quick Admin Nav */}
              <div className="flex items-center gap-2.5">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-lg shadow-lg shadow-violet-500/25 transition-all"
                >
                  <HiShieldCheck className="w-3.5 h-3.5" />
                  Admin Console
                  <HiArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                  Workspace
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // ================= CLIENT STRIP =================
          <div className="bg-gradient-to-r from-blue-950/95 via-navy-950/95 to-slate-950/95 border-blue-500/25 backdrop-blur-xl px-4 py-3 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Left: Client greeting & live stats */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {stats.displayName.slice(0, 2)}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    Welcome back, <span className="text-blue-400">{stats.displayName}</span>
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {stats.planName}
                </span>

                {/* Real-time personal work metrics */}
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    <HiFolder className="w-3.5 h-3.5 text-blue-400" />
                    <strong className="text-white font-bold">{stats.activeProjects}</strong> Active Projects
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <strong className="text-white font-bold">{stats.doneTasks}</strong> / {stats.totalTasks} Done
                  </span>
                  <span className="hidden sm:flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    <HiSparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <strong className="text-white font-bold">{stats.aiUsed}</strong> / {stats.maxAi} AI
                  </span>
                </div>
              </div>

              {/* Right: Quick Action to Dashboard */}
              <div className="flex items-center gap-2">
                <Link
                  to="/tasks"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                >
                  My Tasks
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-lg shadow-lg shadow-blue-500/25 transition-all"
                >
                  Go to My Dashboard
                  <HiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
