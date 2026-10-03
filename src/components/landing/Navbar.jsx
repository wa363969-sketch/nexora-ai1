import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiBars3, HiXMark, HiShieldCheck } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const whatsappUrl = "https://wa.me/923404942126?text=Hi%20NEXORA%20Team%2C%20I%20have%20an%20inquiry%20about%20the%20platform";

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexora_user_session');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isAdmin = Boolean(
    user?.email?.toLowerCase() === 'wa363969@gmail.com' ||
    user?.role === 'admin' ||
    user?.labels?.includes('admin')
  );

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-navy-950/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
            : 'bg-navy-950/40 backdrop-blur-md border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-500/20">
                N
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:to-violet-400 transition-all duration-300 tracking-wider">
                NEXORA
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
              <Link
                to="/video-guide"
                className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <span>🎓 Video Guide</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-black">PAID</span>
              </Link>
            </div>

            {/* Desktop Action & Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#25D366] hover:text-white bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-lg transition-all duration-200 hover:scale-105"
                title="Direct WhatsApp: 03404942126"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {user ? (
                // Logged-in view
                <div className="flex items-center gap-2.5">
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all shadow-md shadow-violet-500/20"
                    >
                      <HiShieldCheck className="w-4 h-4" />
                      Admin Console
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:from-blue-600 hover:to-violet-600 transition-all shadow-md shadow-blue-500/20"
                    >
                      My Dashboard
                    </Link>
                  )}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white border border-white/20">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                </div>
              ) : (
                // Guest view
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:from-blue-600 hover:to-violet-600 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Slide-out Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-navy-900/95 backdrop-blur-xl border-l border-white/10 z-50 md:hidden"
            >
              <div className="p-6 pt-20 flex flex-col gap-6">
                {/* WhatsApp Mobile CTA */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  Chat on WhatsApp: 03404942126
                </a>

                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </motion.a>
                ))}

                <div className="border-t border-white/10 pt-6 mt-2 flex flex-col gap-3">
                  {user ? (
                    <Link
                      to={isAdmin ? "/admin" : "/dashboard"}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-center text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg"
                    >
                      {isAdmin ? '👑 Open Admin Console' : 'Open My Dashboard'}
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-center text-sm text-gray-300 hover:text-white border border-white/10 rounded-lg transition-colors duration-200"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:from-blue-600 hover:to-violet-600 transition-all duration-200"
                      >
                        Get Started Free
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
