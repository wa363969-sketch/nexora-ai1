import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiSparkles, HiCommandLine, HiBolt, HiArrowPath, HiDocumentText, HiChatBubbleLeftRight, HiArrowRight } from 'react-icons/hi2';

export default function AIFeature() {
  const features = [
    {
      icon: HiSparkles,
      title: 'Context-Aware Assistance',
      description: 'Understands your active projects, deadlines, and backlog tasks to generate spot-on answers and recommendations.'
    },
    {
      icon: HiBolt,
      title: 'Real-Time Streaming Responses',
      description: 'Zero waiting time. Watch complex project breakdowns and code snippets stream token-by-token directly.'
    },
    {
      icon: HiDocumentText,
      title: 'Markdown & Code Rendering',
      description: 'Full GitHub-flavored syntax highlighting, copyable code blocks, tables, and task breakdown outlines.'
    },
    {
      icon: HiArrowPath,
      title: 'Regeneration & Branching',
      description: 'Switch between Gemini 2.0 Flash and GPT-4o on the fly. Refine prompts with conversation memory.'
    }
  ];

  return (
    <section id="ai-assistant" className="py-24 relative overflow-hidden bg-navy-950/80 border-t border-white/5">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            <HiSparkles className="w-4 h-4" /> Next-Gen Intelligence
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Meet Your AI Co-Pilot for <span className="gradient-text">Peak Velocity</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Say goodbye to context switching. Ask NEXORA AI to summarize team sprints, decompose user stories into subtasks, or draft technical documentation in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Feature list */}
          <div className="lg:col-span-5 space-y-6">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.05] transition-all"
              >
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-violet-500/30 text-violet-400 shrink-0">
                  <feat.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base mb-1">{feat.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            ))}

            <div className="pt-2">
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <HiSparkles className="w-4 h-4 text-yellow-300" />
                Launch AI Co-Pilot Live
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Chat Mockup */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-navy-900/90 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5 ml-2">
                    <HiCommandLine className="w-3.5 h-3.5 text-blue-400" /> nexora-ai-session-042
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Gemini 2.0 Flash
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 font-sans text-sm">
                <div className="flex gap-3 items-start justify-end">
                  <div className="max-w-[80%] bg-blue-600/20 border border-blue-500/30 text-blue-100 p-3.5 rounded-2xl rounded-tr-none shadow-sm">
                    Can you break down the "Mobile Payment Gateway" feature into sprint tasks with priority labels?
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    JD
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-500/30">
                    <HiSparkles className="w-4 h-4" />
                  </div>
                  <div className="max-w-[88%] bg-white/[0.04] border border-white/10 text-gray-200 p-4 rounded-2xl rounded-tl-none space-y-3">
                    <p className="text-gray-300">
                      Here is the prioritized engineering task breakdown for the <strong>Mobile Payment Gateway</strong> integration:
                    </p>
                    <div className="bg-navy-950/80 rounded-lg p-3 border border-white/5 space-y-2 font-mono text-xs text-gray-300">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                        <span className="text-white">1. Apple Pay & Google Pay SDK Bridge</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">P0 - Urgent</span>
                      </div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                        <span className="text-white">2. Webhook Listener & Idempotency Store</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30">P1 - High</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">3. Customer Fallback & Receipt Emails</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30">P2 - Medium</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 italic">
                      Would you like me to auto-insert these 3 tasks into your active Sprint Kanban board?
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-navy-950/60 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ask anything, generate tasks, draft code..."
                  disabled
                  value="Yes, assign P0 to Alex and add to Sprint 4"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 outline-none"
                />
                <Link
                  to="/ai-assistant"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5"
                >
                  Send <HiArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
