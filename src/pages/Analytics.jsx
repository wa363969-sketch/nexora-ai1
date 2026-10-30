import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  HiChartBar,
  HiCheckCircle,
  HiExclamationTriangle,
  HiSparkles,
  HiGlobeAlt,
  HiUser,
  HiArrowTrendingUp,
  HiCpuChip,
} from 'react-icons/hi2';
import { getProjects, getTasks, getAllClientWorkspaces, getSubscription } from '../services/dataService';
import { calculateProgress, isOverdue } from '../lib/utils';
import ProgressBar from '../components/ui/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = 'wa363969@gmail.com';

const STATUS_COLORS = {
  'todo': '#3b82f6',
  'in-progress': '#eab308',
  'in-review': '#8b5cf6',
  'done': '#10b981',
};

const PRIORITY_COLORS = {
  'urgent': '#f43f5e',
  'high': '#f97316',
  'medium': '#eab308',
  'low': '#10b981',
};

const PLAN_BADGE = {
  starter: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  pro: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  enterprise: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

export default function Analytics() {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [viewMode, setViewMode] = useState('personal'); // 'personal' | 'platform'
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [viewMode]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      if (viewMode === 'platform' && isAdmin) {
        const clients = getAllClientWorkspaces();
        setAllClients(clients);

        const aggProjects = clients.flatMap(c => c.projects || []);
        const aggTasks    = clients.flatMap(c => c.tasks || []);
        setProjects(aggProjects);
        setTasks(aggTasks);
        setSubscription(null);
      } else {
        const [pList, tList, sub] = await Promise.all([
          getProjects(),
          getTasks(),
          getSubscription(),
        ]);
        setProjects(pList);
        setTasks(tList);
        setSubscription(sub);
        setAllClients([]);
      }
    } catch (e) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }

  const totalProjects    = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalTasks       = tasks.length;
  const completedTasks   = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks  = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks        = tasks.filter(t => t.status === 'todo').length;
  const inReviewTasks    = tasks.filter(t => t.status === 'in-review').length;
  const overdueTasks     = tasks.filter(t => t.status !== 'done' && isOverdue(t.deadline)).length;
  const resolutionRate   = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // AI usage from subscription
  const aiUsed = subscription?.aiTokensUsed ?? 0;
  const aiMax  = subscription?.aiTokensMax  ?? 500;
  const aiPct  = Math.min(100, Math.round((aiUsed / aiMax) * 100));
  const planId = subscription?.planId || 'starter';

  // Status Pie
  const statusCounts = [
    { name: 'To Do',       value: todoTasks,       color: STATUS_COLORS.todo         },
    { name: 'In Progress', value: inProgressTasks, color: STATUS_COLORS['in-progress']},
    { name: 'In Review',   value: inReviewTasks,   color: STATUS_COLORS['in-review'] },
    { name: 'Done',        value: completedTasks,  color: STATUS_COLORS.done         },
  ].filter(s => s.value > 0);

  // Priority Bar
  const priorityData = [
    { name: 'Urgent', count: tasks.filter(t => t.priority === 'urgent').length,  fill: PRIORITY_COLORS.urgent },
    { name: 'High',   count: tasks.filter(t => t.priority === 'high').length,    fill: PRIORITY_COLORS.high   },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length,  fill: PRIORITY_COLORS.medium },
    { name: 'Low',    count: tasks.filter(t => t.priority === 'low').length,     fill: PRIORITY_COLORS.low    },
  ];

  // Weekly velocity — derived from real task createdAt if available, else ratio estimate
  function buildWeeklyData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (totalTasks === 0) return days.map(d => ({ day: d, created: 0, completed: 0 }));
    // Try real date distribution
    const now = new Date();
    const dayBuckets = days.map((day, idx) => {
      const target = new Date(now);
      const currentDay = now.getDay(); // 0=Sun
      const adjustedCurrent = currentDay === 0 ? 6 : currentDay - 1; // Mon=0
      const diff = idx - adjustedCurrent;
      target.setDate(now.getDate() + diff);
      const dateStr = target.toISOString().split('T')[0];
      const created   = tasks.filter(t => (t.createdAt || '').startsWith(dateStr)).length;
      const completed = tasks.filter(t => t.status === 'done' && (t.updatedAt || '').startsWith(dateStr)).length;
      return { day, created, completed };
    });
    // If all zeros (no date metadata), fall back to ratio spread
    const hasRealData = dayBuckets.some(d => d.created > 0 || d.completed > 0);
    if (hasRealData) return dayBuckets;
    const weights = [0.15, 0.25, 0.20, 0.25, 0.15, 0.05, 0.05];
    return days.map((day, i) => ({
      day,
      created:   Math.round(totalTasks    * weights[i]),
      completed: Math.round(completedTasks * weights[i]),
    }));
  }
  const weeklyVelocityData = buildWeeklyData();

  const clientSummaries = allClients.map(c => ({
    name:     c.displayName || c.email,
    email:    c.email,
    plan:     c.subscription?.planId || 'starter',
    projects: (c.projects || []).length,
    tasks:    (c.tasks || []).length,
    done:     (c.tasks || []).filter(t => t.status === 'done').length,
    overdue:  (c.tasks || []).filter(t => t.status !== 'done' && isOverdue(t.deadline)).length,
    rate:     (c.tasks || []).length > 0
      ? Math.round(((c.tasks || []).filter(t => t.status === 'done').length / (c.tasks || []).length) * 100)
      : 0,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HiChartBar className="w-7 h-7 text-emerald-400" />
            {viewMode === 'platform' ? 'Platform-wide Analytics' : 'Workspace Analytics'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {viewMode === 'platform'
              ? `Aggregated across ${allClients.length} registered clients • Admin View`
              : `Personal workspace of ${user?.name || user?.email || 'You'}`
            }
            {subscription && viewMode === 'personal' && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${PLAN_BADGE[planId] || PLAN_BADGE.starter}`}>
                {planId} plan
              </span>
            )}
          </p>
        </div>

        {/* Admin toggle */}
        {isAdmin && (
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('personal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'personal'
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <HiUser className="w-3.5 h-3.5" /> My Workspace
            </button>
            <button
              onClick={() => setViewMode('platform')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'platform'
                  ? 'bg-violet-500 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <HiGlobeAlt className="w-3.5 h-3.5" /> All Clients
            </button>
          </div>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="uppercase font-semibold">Total Projects</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <HiChartBar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{totalProjects}</div>
          <div className="text-xs text-gray-400">{completedProjects} completed</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="uppercase font-semibold">Resolution Rate</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <HiCheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{resolutionRate}%</div>
          <div className="text-xs text-gray-400">{completedTasks} of {totalTasks} tasks done</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="uppercase font-semibold">Overdue Tasks</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <HiExclamationTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-3xl font-extrabold mb-1 ${overdueTasks > 0 ? 'text-rose-400' : 'text-white'}`}>
            {overdueTasks}
          </div>
          <div className="text-xs text-gray-400">
            {overdueTasks > 0 ? 'Needs triage' : 'All on schedule ✓'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="uppercase font-semibold">
              {viewMode === 'platform' ? 'Total Clients' : 'AI Tokens Used'}
            </span>
            <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              {viewMode === 'platform' ? <HiGlobeAlt className="w-4 h-4" /> : <HiSparkles className="w-4 h-4" />}
            </span>
          </div>
          {viewMode === 'platform' ? (
            <>
              <div className="text-3xl font-extrabold text-white mb-1">{allClients.length}</div>
              <div className="text-xs text-gray-400">registered on platform</div>
            </>
          ) : (
            <>
              <div className="text-3xl font-extrabold text-white mb-1">{aiUsed}<span className="text-base font-normal text-gray-400">/{aiMax}</span></div>
              <div className="mt-2">
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${aiPct > 85 ? 'bg-rose-500' : aiPct > 60 ? 'bg-amber-500' : 'bg-violet-500'}`}
                    style={{ width: `${aiPct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">{aiPct}% of monthly quota</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Status Breakdown (mini KPIs) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'To Do',       value: todoTasks,       color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
          { label: 'In Progress', value: inProgressTasks, color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
          { label: 'In Review',   value: inReviewTasks,   color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Done',        value: completedTasks,  color: 'text-emerald-400',bg: 'bg-emerald-500/10'},
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border border-white/10 ${s.bg}`}>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Throughput */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Task Throughput</h3>
              <p className="text-xs text-gray-400">Created vs Resolved across current week</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Created
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved
              </span>
            </div>
          </div>
          <div className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVelocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="created"   fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="completed" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Status Distribution</h3>
            <p className="text-xs text-gray-400">Active breakdown across workflow states</p>
          </div>
          {statusCounts.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusCounts} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {statusCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                {statusCounts.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-400">{s.name}:</span>
                    <span className="font-bold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-gray-500">
              No tasks yet
            </div>
          )}
        </div>
      </div>

      {/* ── Priority Breakdown ── */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Priority Breakdown</h3>
          <p className="text-xs text-gray-400">Task count by urgency level</p>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} width={50} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[0,4,4,0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Project Completion Meters ── */}
      {projects.length > 0 && (
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Project Completion Meters</h3>
            <p className="text-xs text-gray-400">
              {viewMode === 'platform' ? `All ${allClients.length} clients combined` : 'Your projects — calculated from real task data'}
            </p>
          </div>
          <div className="space-y-4 pt-2">
            {projects.slice(0, viewMode === 'platform' ? 12 : 20).map(p => {
              const pTasks   = tasks.filter(t => t.projectId === (p.$id || p.id));
              const progress = calculateProgress(pTasks);
              return (
                <div key={p.$id || p.id || p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#3b82f6' }} />
                      <span className="font-semibold text-white">{p.name}</span>
                      {p.category && <span className="text-gray-500 text-[11px]">({p.category})</span>}
                    </div>
                    <span className="font-bold text-gray-300">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Admin: Per-client Table (platform view only) ── */}
      {viewMode === 'platform' && isAdmin && clientSummaries.length > 0 && (
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Per-Client Performance Table</h3>
            <p className="text-xs text-gray-400">Live data for every registered client</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-left">
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold text-center">Projects</th>
                  <th className="pb-3 font-semibold text-center">Tasks</th>
                  <th className="pb-3 font-semibold text-center">Done</th>
                  <th className="pb-3 font-semibold text-center">Overdue</th>
                  <th className="pb-3 font-semibold text-center">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clientSummaries.map(c => (
                  <tr key={c.email} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white truncate max-w-[160px]">{c.name}</div>
                      <div className="text-gray-500 text-[10px]">{c.email}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${PLAN_BADGE[c.plan] || PLAN_BADGE.starter}`}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-3 text-center font-semibold text-white">{c.projects}</td>
                    <td className="py-3 text-center font-semibold text-white">{c.tasks}</td>
                    <td className="py-3 text-center font-semibold text-emerald-400">{c.done}</td>
                    <td className="py-3 text-center font-semibold">
                      <span className={c.overdue > 0 ? 'text-rose-400' : 'text-gray-500'}>{c.overdue}</span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.rate > 70 ? 'bg-emerald-500' : c.rate > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${c.rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-white">{c.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
