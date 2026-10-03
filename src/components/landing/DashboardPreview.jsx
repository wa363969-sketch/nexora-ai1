import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiMiniChartBar,
  HiUsers,
  HiClipboardDocumentCheck,
  HiClock,
  HiBell,
  HiSparkles,
  HiArrowTrendingUp,
  HiFolder,
} from 'react-icons/hi2';

const sidebarItems = [
  { icon: HiMiniChartBar, label: 'Dashboard', active: true },
  { icon: HiFolder, label: 'Projects' },
  { icon: HiClipboardDocumentCheck, label: 'Tasks' },
  { icon: HiUsers, label: 'Team' },
  { icon: HiSparkles, label: 'AI Assistant' },
];

const tasks = [
  { title: 'Design system update', status: 'In Progress', color: 'bg-blue-500', progress: 72 },
  { title: 'API integration', status: 'Review', color: 'bg-violet-500', progress: 90 },
  { title: 'User testing', status: 'Todo', color: 'bg-amber-500', progress: 15 },
];

export default function DashboardPreview() {
  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 8 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto"
        style={{ perspective: '1200px' }}
      >
        <div className="relative group">
          {/* Outer glow border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-blue-500/30 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Main Dashboard Container */}
          <div className="relative bg-navy-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            {/* Top Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <Link to="/dashboard" className="px-4 py-1 rounded-md bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
                  app.nexora.io/dashboard →
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <HiBell className="w-4 h-4 text-gray-500" />
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-400" />
              </div>
            </div>

            <div className="flex min-h-[400px] sm:min-h-[480px]">
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-48 border-r border-white/5 p-3 gap-1">
                <div className="flex items-center gap-2 px-3 py-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                    N
                  </div>
                  <span className="text-sm font-semibold text-white">NEXORA</span>
                </div>
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      item.active
                        ? 'bg-white/10 text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Main Content */}
              <div className="flex-1 p-4 sm:p-6 space-y-4">
                {/* Greeting */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">Good morning, Alex</h3>
                    <p className="text-xs text-gray-500">You have 5 tasks due today</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <HiSparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs text-gray-400">Ask AI</span>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Projects', value: '24', change: '+3', icon: HiFolder },
                    { label: 'Active Tasks', value: '128', change: '+12', icon: HiClipboardDocumentCheck },
                    { label: 'Team Members', value: '18', change: '+2', icon: HiUsers },
                    { label: 'Completion', value: '87%', change: '+5%', icon: HiArrowTrendingUp },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/5 border border-white/5 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-[10px] text-emerald-400">{stat.change}</span>
                      </div>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Activity & Tasks Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Mini Chart */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-medium text-gray-300">Activity Overview</h4>
                      <span className="text-[10px] text-gray-500">This week</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-24">
                      {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end">
                          <div
                            className="w-full rounded-sm bg-gradient-to-t from-blue-500/80 to-violet-500/80"
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i} className="text-[9px] text-gray-600 flex-1 text-center">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-medium text-gray-300">Recent Tasks</h4>
                      <Link to="/tasks" className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
                    </div>
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.title} className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${task.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-300 truncate">{task.title}</p>
                            <div className="mt-1 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${task.color}`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
