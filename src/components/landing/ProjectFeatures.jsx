import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HiFolderOpen, 
  HiCalendarDays, 
  HiChartBar, 
  HiUserGroup, 
  HiTag, 
  HiAdjustmentsHorizontal,
  HiCheckBadge,
  HiArrowRight
} from 'react-icons/hi2';

export default function ProjectFeatures() {
  const cards = [
    {
      icon: HiFolderOpen,
      title: 'Dynamic Project Workspaces',
      description: 'Organize high-stakes projects with custom categories, deadlines, priority weightings, and rich Markdown briefs.'
    },
    {
      icon: HiCalendarDays,
      title: 'Milestones & Deadlines',
      description: 'Set realistic release targets with real-time countdown alerts, overdue warnings, and smart schedule estimation.'
    },
    {
      icon: HiChartBar,
      title: 'Automated Progress Tracking',
      description: 'Watch completion meters dynamically recalculate as subtasks move from backlog to done without manual rollups.'
    },
    {
      icon: HiUserGroup,
      title: 'Team Allocation',
      description: 'Assign project leads, balance cross-functional contributors, and maintain strict visibility with granular role permissions.'
    },
    {
      icon: HiTag,
      title: 'Categories & Tagging',
      description: 'Color-code projects across Engineering, Design, Growth, Product, and Operations for instant filtering.'
    },
    {
      icon: HiAdjustmentsHorizontal,
      title: 'Status Workflows',
      description: 'Transition projects smoothly through Planning, Active, Review, Paused, and Completed states with complete audit trails.'
    }
  ];

  return (
    <section id="projects" className="py-24 bg-navy-900/50 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            <HiCheckBadge className="w-4 h-4" /> Enterprise-Grade Control
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Manage Projects with <span className="gradient-text">Absolute Precision</span>
          </h2>
          <p className="text-gray-400 text-lg">
            From two-person startups to distributed international engineering teams, NEXORA turns chaos into structured, predictable delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.06] transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500/20 to-violet-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
          >
            <HiFolderOpen className="w-4 h-4" />
            Explore Projects Workspace
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
