import { useState } from 'react';
import { 
  HiQuestionMarkCircle, 
  HiMagnifyingGlass, 
  HiBookOpen, 
  HiSparkles, 
  HiShieldCheck,
  HiChatBubbleLeftRight,
  HiEnvelope
} from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';

const SUPPORT_EMAIL = 'wa363969@gmail.com';
const WHATSAPP_URL  = 'https://wa.me/923404942126?text=Hello%20NEXORA%20Support%2C%20I%20need%20help%20with%3A%20';

export default function HelpCenter() {
  const [query, setQuery] = useState('');

  const guides = [
    {
      title: 'Connecting to Appwrite Cloud',
      category: 'Setup & Infrastructure',
      desc: 'How to provision collections, configure environment keys, and setup user permission scopes.'
    },
    {
      title: 'Using the AI Co-Pilot for Sprint Sizing',
      category: 'AI Assistant',
      desc: 'Prompt patterns to break user stories into measurable task tickets with realistic deadlines.'
    },
    {
      title: 'Role-Based Access Control Guide',
      category: 'Security & Teams',
      desc: 'Understand differences between Admins, Lead Architects, Members, and Read-Only Guests.'
    },
    {
      title: 'Keyboard Shortcuts & Fast Navigation',
      category: 'Productivity',
      desc: 'Use Ctrl+K / Cmd+K command palette to navigate any project, board, or modal instantly.'
    }
  ];

  const filtered = guides.filter(g => 
    g.title.toLowerCase().includes(query.toLowerCase()) || 
    g.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-blue-900/30 via-navy-900 to-violet-900/30 border border-white/10 text-center space-y-4">
        <h1 className="text-3xl font-black text-white">How can we help your team?</h1>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Explore implementation guides, architectural references, and AI configuration tips.
        </p>

        <div className="max-w-md mx-auto relative pt-2">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search docs, guides, Appwrite setups..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((g, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer space-y-2 group"
          >
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
              {g.category}
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
              {g.title}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {g.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Contact Support Banner */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <HiChatBubbleLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Still need assistance?</h4>
            <p className="text-xs text-gray-400">
              Reach our admin directly via email or WhatsApp — real support, real response.
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              <span className="text-gray-300 font-mono">{SUPPORT_EMAIL}</span> · WhatsApp: <span className="text-[#25D366] font-mono">03404942126</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=NEXORA%20Support%20Inquiry`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
          >
            <HiEnvelope className="w-3.5 h-3.5" /> Email Support
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/35 border border-[#25D366]/30 text-[#25D366] font-semibold text-xs transition-colors"
          >
            <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
