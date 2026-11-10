import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { HiXMark } from 'react-icons/hi2';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);
  const phoneNumber = '923404942126';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi%20NEXORA%20Team%2C%20I%20have%20an%20inquiry%20about%20the%20platform`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 select-none">
      {/* Tooltip speech bubble */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 10 }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-900/95 border border-[#25D366]/40 shadow-xl shadow-black/40 text-xs text-white backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <div>
              <p className="font-semibold text-white">Need help or a custom plan?</p>
              <p className="text-[11px] text-gray-400">Chat on WhatsApp: <span className="text-[#25D366] font-mono font-medium">03404942126</span></p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="ml-2 text-gray-400 hover:text-white transition-colors"
              title="Dismiss"
            >
              <HiXMark className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative group w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/50 transition-all duration-300 focus:outline-none"
        aria-label="Chat on WhatsApp 03404942126"
        title="Chat on WhatsApp (+92 340 4942126)"
      >
        {/* Pulse rings */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />
        <span className="absolute -inset-0.5 rounded-full bg-[#25D366]/20 pointer-events-none" />

        <FaWhatsapp className="w-8 h-8 relative z-10 transition-transform group-hover:rotate-6" />

        {/* Live status dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-navy-950" />
      </motion.a>
    </div>
  );
}
