import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HiViewColumns, 
  HiListBullet, 
  HiCalendarDays, 
  HiCheckCircle, 
  HiArrowsPointingOut,
  HiClock,
  HiArrowRight
} from 'react-icons/hi2';

export default function TaskFeatures() {
  return (
    <section id="tasks" className="py-24 bg-navy-950 relative border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4 tracking-wide uppercase">
              <HiViewColumns className="w-4 h-4" /> Multi-Modal Task Hub
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
              Task Management, <span className="gradient-text">Reimagined</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Seamlessly toggle between an interactive drag-and-drop Kanban board, detailed tabular lists, and multi-month calendar timelines. Every task holds subtasks, attachments, comments, and priority tags.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <HiCheckCircle className="w-4 h-4" />
                </div>
                <span>Fluid drag-and-drop status transitions powered by @dnd-kit</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="p-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <HiCheckCircle className="w-4 h-4" />
                </div>
                <span>Subtask checklists with auto-calculated parent completion %</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="p-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  <HiCheckCircle className="w-4 h-4" />
                </div>
                <span>Instant keyboard shortcuts: J/K navigation, C to create, F to filter</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold text-xs transition-all hover:scale-105"
              >
                <HiViewColumns className="w-4 h-4" />
                Launch Interactive Kanban Board
                <HiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* Visual Kanban preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-navy-900/90 border border-white/10 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-semibold flex items-center gap-1.5 border border-blue-500/30">
                    <HiViewColumns className="w-4 h-4" /> Kanban Board
                  </div>
                  <div className="px-3 py-1 rounded-md bg-white/5 text-gray-400 text-xs font-medium flex items-center gap-1.5 hover:text-white">
                    <HiListBullet className="w-4 h-4" /> List
                  </div>
                  <div className="px-3 py-1 rounded-md bg-white/5 text-gray-400 text-xs font-medium flex items-center gap-1.5 hover:text-white">
                    <HiCalendarDays className="w-4 h-4" /> Calendar
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <HiClock className="w-3.5 h-3.5" /> 18 Tasks Active
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Column 1 */}
                <div className="bg-navy-950/80 rounded-xl p-3 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                    <span>TO DO</span>
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px] text-gray-300">2</span>
                  </div>
                  <div className="p-3 rounded-lg bg-navy-900 border border-white/10 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">Urgent</span>
                      <span className="text-[10px] text-gray-500">DEV-104</span>
                    </div>
                    <p className="font-semibold text-white">Setup OAuth2 SSO Flow</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-2/3" />
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="bg-navy-950/80 rounded-xl p-3 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                    <span>IN PROGRESS</span>
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[11px] text-blue-400">1</span>
                  </div>
                  <div className="p-3 rounded-lg bg-navy-900 border border-blue-500/40 text-xs space-y-2 shadow-lg shadow-blue-500/10">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400">High</span>
                      <span className="text-[10px] text-gray-500">UI-302</span>
                    </div>
                    <p className="font-semibold text-white">Design Dark Mode Tokens</p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>4 / 5 subtasks</span>
                      <span className="text-emerald-400">80%</span>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="bg-navy-950/80 rounded-xl p-3 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <span>DONE</span>
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] text-emerald-400">3</span>
                  </div>
                  <div className="p-3 rounded-lg bg-navy-900/60 border border-white/5 text-xs space-y-2 opacity-80">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">Completed</span>
                    <p className="font-semibold text-gray-300 line-through">Appwrite Cloud Integration</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
