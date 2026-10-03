import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiSparkles, HiPlay, HiUserGroup, HiClock, HiCheckBadge, HiShieldCheck, HiArrowRight, HiDevicePhoneMobile } from 'react-icons/hi2';
import DemoModal from '../DemoModal';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stats = [
  { icon: HiUserGroup, value: '10K+', label: 'Teams' },
  { icon: HiClock, value: '99.9%', label: 'Uptime' },
  { icon: HiCheckBadge, value: '50M+', label: 'Tasks Managed' },
];

export default function Hero() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexora_user_session');
      if (raw) setUser(JSON.parse(raw));
    } catch {}

    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capture install prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstallApp() {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } else {
      // Fallback for iOS / unsupported browsers
      alert('To install NEXORA:\n📱 iOS: Tap Share → "Add to Home Screen"\n🤖 Android: Tap menu (⋮) → "Add to Home Screen"');
    }
  }

  const isAdmin = Boolean(
    user?.email?.toLowerCase() === 'wa363969@gmail.com' ||
    user?.role === 'admin' ||
    user?.labels?.includes('admin')
  );

  return (
    <>
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[120px] animate-pulse" />
          <div className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/15 blur-[120px] animate-pulse [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[150px] animate-pulse [animation-delay:4s]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] animate-pulse [animation-delay:3s]" />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            {user ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm">
                {isAdmin ? (
                  <>
                    <HiShieldCheck className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-violet-200">Logged in as Administrator</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300">ROOT</span>
                  </>
                ) : (
                  <>
                    <HiSparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-200">Active Workspace: <strong className="text-white">{user.name || user.email}</strong></span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">ONLINE</span>
                  </>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <HiSparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Introducing NEXORA AI Assistant</span>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-[10px] text-white font-bold">
                  ★
                </span>
              </div>
            )}
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
          >
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Work Smarter
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            {user ? (
              isAdmin ? (
                <span>Your multi-tenant executive console is ready. Supervise all client workspaces, AI token rates, and team governance in real time.</span>
              ) : (
                <span>Your workspace is connected and synchronized. Jump straight back into your Kanban boards, team calendars, and AI Co-Pilot.</span>
              )
            ) : (
              <span>The all-in-one workspace that combines AI assistance, project management, task tracking, team collaboration, and productivity analytics.</span>
            )}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                {isAdmin ? "Open Admin Console" : "Go to My Dashboard"}
                <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                Start Free Trial
                <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            <button
              onClick={() => setIsDemoOpen(true)}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-300 backdrop-blur-sm cursor-pointer hover:border-blue-500/40"
            >
              <HiPlay className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>

            {/* PWA Install App Button */}
            {!isInstalled ? (
              <button
                onClick={handleInstallApp}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-200 hover:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm cursor-pointer animate-pulse hover:animate-none"
              >
                <HiDevicePhoneMobile className="w-5 h-5 group-hover:scale-110 transition-transform" />
                📱 Install App — Free
              </button>
            ) : (
              <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <HiCheckBadge className="w-5 h-5" />
                App Installed ✓
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
