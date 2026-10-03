import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const whatsappUrl = "https://wa.me/923404942126?text=Hi%20NEXORA%20Team%2C%20I%20have%20an%20inquiry%20about%20the%20platform";

  return (
    <footer className="bg-navy-950 border-t border-white/10 pt-16 pb-12 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand block */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl font-black gradient-text tracking-wider">NEXORA</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v2.4
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm text-sm mb-5 leading-relaxed">
              Everything You Need to Work Smarter. The unified AI-powered project workspace combining task tracking, real-time analytics, and automated delivery.
            </p>
            
            <div className="text-xs text-gray-400 flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All systems operational • Appwrite Cloud Connected</span>
            </div>

            {/* Direct WhatsApp Contact Button */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 text-[#25D366] text-xs font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-[#25D366]/10"
              >
                <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                <span>Chat on WhatsApp: <strong className="font-mono text-white">03404942126</strong></span>
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link to="/#ai-assistant" className="hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link to="/#projects" className="hover:text-white transition-colors">Project Hub</Link></li>
              <li><Link to="/#tasks" className="hover:text-white transition-colors">Kanban Board</Link></li>
              <li><Link to="/#analytics" className="hover:text-white transition-colors">Live Analytics</Link></li>
              <li><Link to="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Workspace links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/tasks" className="hover:text-white transition-colors">Task Tracking</Link></li>
              <li><Link to="/calendar" className="hover:text-white transition-colors">Team Calendar</Link></li>
              <li><Link to="/teams" className="hover:text-white transition-colors">Team Spaces</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Console</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Trust & Contact</h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center & Docs</Link></li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#25D366] hover:underline"
                >
                  <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp Support
                </a>
              </li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} NEXORA Inc. All rights reserved. "Everything You Need to Work Smarter."</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300">Terms</Link>
            <Link to="/help" className="hover:text-gray-300">Support</Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">WhatsApp</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
