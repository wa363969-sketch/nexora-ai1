import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiQuestionMarkCircle } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: 'What makes NEXORA different from traditional project management platforms?',
      a: 'NEXORA brings AI directly into your day-to-day workflow instead of treating it as an afterthought. From generating full user stories to auto-prioritizing tasks and producing real database-driven analytics, NEXORA acts as an intelligent partner that actively cuts administrative overhead.'
    },
    {
      q: 'Can I bring my own AI API key (Gemini or OpenAI)?',
      a: 'Yes! NEXORA supports configurable providers including Gemini 2.0 Flash / Pro and OpenAI GPT-4o / GPT-4o-mini. You can configure your keys via environment variables or workspace settings with zero frontend exposure.'
    },
    {
      q: 'How does team permissions and role-based access work?',
      a: 'NEXORA uses Appwrite team authentication and role scopes. You can assign users as Admins, Team Leaders, Standard Members, or Read-Only Guests. Each role strictly bounds what projects, tasks, and system settings a user can alter.'
    },
    {
      q: 'Are the analytics charts live or generated placeholders?',
      a: 'All analytics, completion percentages, overdue metrics, and velocity counts in NEXORA are computed live from your actual project and task database collections. When you mark a task complete or create a new subtask, your graphs update synchronously.'
    },
    {
      q: 'Is my company data kept private and secure?',
      a: 'Absolutely. We enforce Appwrite session controls, client-side input validation, sanitization, and strict database permissions. Your data is isolated and never used for public AI foundation model training.'
    },
    {
      q: 'Can I export or migrate my data at any time?',
      a: 'Yes, NEXORA allows instant JSON/CSV exports of your tasks, projects, comments, and conversation history so your team maintains 100% data sovereignty.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-navy-950 relative border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            <HiQuestionMarkCircle className="w-4 h-4" /> Got Questions?
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about getting started, scaling your team, and AI capabilities.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                  <HiChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* WhatsApp direct help card */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#25D366]/10 via-navy-900/60 to-blue-500/10 border border-[#25D366]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0">
              <FaWhatsapp className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Have more questions or need custom integration?</p>
              <p className="text-xs text-gray-400">Our engineering support team is available directly on WhatsApp 24/7.</p>
            </div>
          </div>
          <a
            href="https://wa.me/923404942126?text=Hi%20NEXORA%2C%20I%20have%20a%20question%20from%20the%20FAQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-lg shadow-[#25D366]/25 transition-all hover:scale-105 shrink-0"
          >
            <FaWhatsapp className="w-4 h-4" />
            Chat: 03404942126
          </a>
        </div>
      </div>
    </section>
  );
}
