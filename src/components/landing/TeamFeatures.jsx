import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiUserGroup, HiShieldCheck, HiChatBubbleOvalLeftEllipsis, HiBellAlert, HiIdentification, HiArrowRight } from 'react-icons/hi2';

export default function TeamFeatures() {
  const cards = [
    {
      icon: HiUserGroup,
      title: 'Workspaces & Pods',
      description: 'Spin up dedicated team workspaces for Frontend, Backend, AI Research, Design, or Executive leadership.'
    },
    {
      icon: HiShieldCheck,
      title: 'Role-Based Access Control',
      description: 'Fine-tuned permissions for Owners, Admins, Members, and External Guests with immutable audit logs.'
    },
    {
      icon: HiChatBubbleOvalLeftEllipsis,
      title: 'Task Threads & Mentions',
      description: 'Discuss blockers directly inside tasks. Tag teammates with @mentions and notify them in real-time.'
    },
    {
      icon: HiBellAlert,
      title: 'Real-Time Activity Stream',
      description: 'Follow live project feeds showing who created tasks, adjusted timelines, or deployed releases.'
    }
  ];

  return (
    <section id="teams" className="py-24 bg-navy-900/40 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            <HiIdentification className="w-4 h-4" /> Seamless Collaboration
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Built for High-Trust, <span className="gradient-text">High-Speed Teams</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Keep every engineer, designer, and stakeholder completely aligned with unified workspaces and instant updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.06] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/teams"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 font-semibold text-xs transition-all hover:scale-105"
          >
            <HiUserGroup className="w-4 h-4" />
            Explore Team Workspaces & Roles
            <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
