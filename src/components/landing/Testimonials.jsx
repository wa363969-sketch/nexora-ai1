import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi2';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Sarah Jenkins',
      role: 'Staff Software Architect',
      team: 'Distributed Systems Guild',
      avatar: 'SJ',
      rating: 5,
      quote: 'NEXORA replaced three fragmented tools for our 40-engineer organization. Having the Gemini 2.0 streaming AI natively alongside our Kanban board and sprint milestones cut our planning cycle from 4 hours down to 45 minutes.'
    },
    {
      name: 'Marcus Vance',
      role: 'Director of Product',
      team: 'Fintech Cloud Platform',
      avatar: 'MV',
      rating: 5,
      quote: 'The real database-backed analytics are refreshing. We do not get static guesses; our burnup rates and backlog distributions reflect exactly what developers commit in real-time. The UI design is clean, fast, and remarkably responsive.'
    },
    {
      name: 'Elena Rostova',
      role: 'Engineering Operations Lead',
      team: 'Modern Infrastructure Lab',
      avatar: 'ER',
      rating: 5,
      quote: 'Appwrite authentication and role management combined with automated subtask decomposition gives us the enterprise rigor we require without the administrative bloat of legacy platforms. An indispensable daily driver.'
    }
  ];

  return (
    <section className="py-24 bg-navy-900/30 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            User Testimonials
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Trusted by Builders <span className="gradient-text">Around the Globe</span>
          </h2>
          <p className="text-gray-400 text-lg">
            See how forward-thinking product teams accelerate their workflow every day with NEXORA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300"
            >
              <div>
                <div className="flex gap-1 text-amber-400 mb-6">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <HiStar key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic mb-8">
                  "{r.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow">
                  {r.avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{r.name}</h4>
                  <p className="text-gray-400 text-xs">{r.role} • {r.team}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
