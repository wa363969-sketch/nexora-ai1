import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiChartPie, HiArrowTrendingUp, HiBolt, HiClock, HiCheckBadge, HiArrowRight } from 'react-icons/hi2';

export default function AnalyticsFeatures() {
  return (
    <section id="analytics" className="py-24 bg-navy-900/40 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            <HiChartPie className="w-4 h-4" /> Real-World Analytics
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Insights Calculated from <span className="gradient-text">Real Records</span>
          </h2>
          <p className="text-gray-400 text-lg">
            No vanity metrics. NEXORA computes live velocity charts, project completion percentages, sprint burndowns, and overdue counts straight from your database records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weekly Velocity</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <HiArrowTrendingUp className="w-3.5 h-3.5" /> +28.4%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-2">94.2 pts</div>
            <p className="text-xs text-gray-400 mb-6">Average story points resolved per engineering sprint cycle.</p>
            {/* Visual mini bar chart */}
            <div className="h-24 flex items-end gap-2 pt-4">
              {[40, 55, 48, 70, 65, 88, 94].map((val, idx) => (
                <div key={idx} className="flex-1 bg-white/5 hover:bg-emerald-500/40 rounded-t transition-all group relative flex flex-col justify-end">
                  <div
                    style={{ height: `${val}%` }}
                    className="w-full bg-gradient-to-t from-emerald-500/60 to-emerald-400 rounded-t"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Task Completion</span>
              <span className="text-xs font-bold text-blue-400">86% On-Time</span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-2">1,248 Tasks</div>
            <p className="text-xs text-gray-400 mb-6">Completed across all active team spaces this quarter.</p>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Frontend Platform</span>
                  <span className="text-white">92%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[92%] h-full bg-blue-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Backend Infrastructure</span>
                  <span className="text-white">78%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[78%] h-full bg-violet-500 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Productivity Gain</span>
              <span className="text-xs font-bold text-violet-400">Saved 420 hrs</span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-2">3.4x Faster</div>
            <p className="text-xs text-gray-400 mb-6">From initial task spec to completed staging deployment.</p>
            <div className="p-3 rounded-xl bg-navy-950/80 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-300">
                <span>AI Subtask Generation</span>
                <span className="text-emerald-400 font-semibold">+4.2 hrs/wk</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>Auto Sprint Summaries</span>
                <span className="text-emerald-400 font-semibold">+2.8 hrs/wk</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-all hover:scale-105"
          >
            <HiChartPie className="w-4 h-4" />
            Explore Live Performance Analytics
            <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
