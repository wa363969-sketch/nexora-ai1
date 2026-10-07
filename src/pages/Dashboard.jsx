import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiFolderOpen, 
  HiClipboardDocumentList, 
  HiCheckCircle, 
  HiExclamationTriangle,
  HiSparkles,
  HiPlus,
  HiArrowRight,
  HiCalendarDays,
  HiClock,
  HiUserGroup,
  HiChatBubbleBottomCenterText,
  HiDocumentText,
  HiArrowDownTray
} from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { getProjects, getTasks, updateTask, createTask } from '../services/dataService';
import { calculateProgress, formatDate, getPriorityColor, getStatusColor, isOverdue } from '../lib/utils';
import ProgressBar from '../components/ui/ProgressBar';
import StandupModal from '../components/StandupModal';
import SpecToKanbanModal from '../components/SpecToKanbanModal';
import ExportReportModal from '../components/ExportReportModal';
import VoiceTaskInput from '../components/VoiceTaskInput';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');

  // Modals state
  const [isStandupOpen, setIsStandupOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [pData, tData] = await Promise.all([getProjects(), getTasks()]);
      setProjects(pData);
      setTasks(tData);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTaskStatus(task) {
    const newStatus = task.status === 'done' ? 'in-progress' : 'done';
    try {
      const updated = await updateTask(task.$id, { status: newStatus });
      setTasks(prev => prev.map(t => t.$id === task.$id ? updated : t));
      toast.success(newStatus === 'done' ? 'Task completed!' : 'Task reopened');
    } catch (e) {
      toast.error('Failed to update task');
    }
  }

  function handleAiSubmit(e) {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    navigate('/ai-assistant?q=' + encodeURIComponent(aiPrompt));
  }

  async function handleVoiceTask(taskData) {
    try {
      const created = await createTask({
        ...taskData,
        projectId: projects[0]?.$id || 'proj-1',
        projectName: projects[0]?.name || 'Active Sprint'
      });
      setTasks(prev => [created, ...prev]);
    } catch (e) {
      toast.error('Failed to save voice task');
    }
  }

  // Real Database-Derived Statistics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const overdueTasks = tasks.filter(t => t.status !== 'done' && isOverdue(t.deadline)).length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overallTaskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects,
      desc: `${projects.filter(p => p.status === 'active').length} active right now`,
      icon: HiFolderOpen,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-400',
    },
    {
      label: 'Completed Projects',
      value: `${completedProjects} / ${totalProjects}`,
      desc: `${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% completion rate`,
      icon: HiCheckCircle,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Pending Tasks',
      value: pendingTasks,
      desc: `${overallTaskProgress}% overall resolution rate`,
      icon: HiClipboardDocumentList,
      color: 'from-violet-500 to-indigo-500',
      textColor: 'text-violet-400',
    },
    {
      label: 'Overdue Warnings',
      value: overdueTasks,
      desc: overdueTasks > 0 ? 'Requires immediate triage' : 'All deadlines healthy',
      icon: HiExclamationTriangle,
      color: 'from-rose-500 to-pink-500',
      textColor: overdueTasks > 0 ? 'text-rose-400' : 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/40 via-navy-900 to-violet-900/40 border border-white/10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              NEXORA Intelligence Online
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name || 'Architect'}</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              "Everything You Need to Work Smarter." You have {pendingTasks} pending tasks and {overdueTasks} urgent items across your active workspaces.
            </p>
          </div>

          {/* Quick Actions & AI Superpowers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsStandupOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 font-semibold text-xs border border-violet-500/30 flex items-center gap-1.5 transition-all shadow-md"
            >
              <HiSparkles className="w-4 h-4 text-violet-400" /> AI Standup
            </button>
            <button
              onClick={() => setIsSpecModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-semibold text-xs border border-blue-500/30 flex items-center gap-1.5 transition-all shadow-md"
            >
              <HiDocumentText className="w-4 h-4 text-blue-400" /> Spec-to-Kanban
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <HiArrowDownTray className="w-4 h-4" /> Export
            </button>
            <Link
              to="/tasks?create=true"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              <HiPlus className="w-4 h-4" /> New Task
            </Link>
          </div>
        </div>

        {/* AI Quick Co-Pilot bar with Voice input */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <form onSubmit={handleAiSubmit} className="flex gap-2 items-center">
            <div className="relative flex-1">
              <HiSparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ask NEXORA AI: 'Analyze blockers in Mobile App v2' or 'Decompose sprint tasks'..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950/70 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <VoiceTaskInput onTaskRecorded={handleVoiceTask} />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-violet-300 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              Prompt AI <HiArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </motion.div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</span>
              <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${s.textColor}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{s.value}</div>
            <p className="text-xs text-gray-400">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout: Projects vs Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Projects */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HiFolderOpen className="w-5 h-5 text-blue-400" /> Active Projects
              </h2>
              <p className="text-xs text-gray-400">Database tracked progress & deadlines</p>
            </div>
            <Link to="/projects" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <HiArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map(p => {
              const projectTasks = tasks.filter(t => t.projectId === p.$id);
              const progress = calculateProgress(projectTasks);
              return (
                <div
                  key={p.$id}
                  onClick={() => navigate(`/projects/${p.$id}`)}
                  className="p-4 rounded-xl bg-navy-900/60 border border-white/5 hover:border-blue-500/40 hover:bg-white/[0.03] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#3b82f6' }} />
                        <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                          {p.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-400 border border-white/10">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPriorityColor(p.priority)}`}>
                      {p.priority}
                    </span>
                  </div>

                  <div className="pt-2">
                    <ProgressBar value={progress} showLabel size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-3 border-t border-white/5 mt-3">
                    <span className="flex items-center gap-1.5">
                      <HiUserGroup className="w-3.5 h-3.5 text-gray-400" /> Lead: {p.teamLead}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiClock className="w-3.5 h-3.5 text-gray-400" /> Due {formatDate(p.deadline)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Urgent Tasks & Quick Toggles */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HiClipboardDocumentList className="w-5 h-5 text-violet-400" /> Priority Sprint Tasks
              </h2>
              <p className="text-xs text-gray-400">Click circle to mark complete</p>
            </div>
            <Link to="/kanban" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
              Open Board <HiArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 5).map(t => {
              const isDone = t.status === 'done';
              return (
                <div
                  key={t.$id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isDone
                      ? 'bg-navy-950/40 border-white/5 opacity-60'
                      : 'bg-navy-900/60 border-white/10 hover:border-violet-500/40'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTaskStatus(t)}
                    className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-white/30 hover:border-blue-400'
                    }`}
                  >
                    {isDone && <HiCheckCircle className="w-4 h-4 fill-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-semibold truncate ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                        {t.title}
                      </h4>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border shrink-0 ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                      <span className="truncate">{t.projectName}</span>
                      <span className={isOverdue(t.deadline) && !isDone ? 'text-rose-400 font-semibold' : ''}>
                        {formatDate(t.deadline)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick link card to Kanban */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-violet-900/30 border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Full Sprint Matrix</h4>
              <p className="text-[11px] text-gray-400">Reorder tasks via Drag-and-Drop</p>
            </div>
            <Link
              to="/kanban"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              Launch Board
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StandupModal
        isOpen={isStandupOpen}
        onClose={() => setIsStandupOpen(false)}
        tasks={tasks}
        user={user}
      />
      <SpecToKanbanModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        projects={projects}
        onTasksCreated={(newOnes) => setTasks(prev => [...newOnes, ...prev])}
      />
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        tasks={tasks}
        projects={projects}
      />
    </div>
  );
}
