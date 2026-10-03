import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCpuChip, HiArrowTrendingUp, HiBolt, HiClock, HiCheckCircle, HiArrowRight } from 'react-icons/hi2';

export default function AutomationFeatures() {
  const steps = [
    {
      title: 'Trigger: GitHub PR Merged',
      detail: 'Webhook triggers automated task resolution and flags QA review',
      badge: 'Event Trigger'
    },
    {
      title: 'Action: Auto-Assign QA Reviewer',
      detail: 'Smart load-balancing assigns the least loaded QA engineer',
      badge: 'Routing'
    },
    {
      title: 'Notify: Slack & In-App Alert',
      detail: 'Instant notification dispatched with direct link to staging build',
      badge: 'Broadcast'
    }
  ];

  return (
    <section id="automation" className="py-24 bg-navy-950 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
              <HiCpuChip className="w-4 h-4" /> Workflow Automation
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Put Repetitive Work on <span className="gradient-text">Autopilot</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Design powerful event-driven workflows that eliminate manual status checks, reassign stale cards, and ping teammates before deadlines slip.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-2xl font-black text-white mb-1">12+ hrs</div>
                <div className="text-xs text-gray-400">Saved per week per developer</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-2xl font-black text-emerald-400 mb-1">99.8%</div>
                <div className="text-xs text-gray-400">Zero missed SLA deadlines</div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold text-xs transition-all hover:scale-105"
              >
                <HiBolt className="w-4 h-4 text-yellow-400" />
                Configure Automated Workflows
                <HiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-violet-500">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="relative flex items-start gap-4 p-5 rounded-2xl bg-navy-900/90 border border-white/10 shadow-lg"
                >
                  <div className="absolute -left-[30px] top-6 w-5 h-5 rounded-full bg-navy-950 border-2 border-blue-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{step.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
