import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HiPlay, 
  HiLockClosed, 
  HiCheckCircle, 
  HiShieldCheck, 
  HiSparkles,
  HiArrowRight,
  HiClipboardDocument,
  HiCreditCard,
  HiCheck,
  HiXMark,
  HiTv,
  HiAcademicCap,
  HiRocketLaunch,
  HiSpeakerWave,
  HiViewColumns,
  HiDocumentText,
  HiPhoto
} from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import NexoraAIVideoEngine, { VIDEO_SCENES } from '../components/video/NexoraAIVideoEngine';
import toast from 'react-hot-toast';

const GUIDE_STORAGE_KEY = 'nexora_video_guide_access';
const PRICE_PKR = '1,499';
const ORIGINAL_PRICE_PKR = '4,999';

export default function VideoGuide() {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'wa363969@gmail.com';

  const [hasAccess, setHasAccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Form states
  const [senderName, setSenderName] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('raast');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setHasAccess(true);
      return;
    }

    try {
      const accessData = localStorage.getItem(GUIDE_STORAGE_KEY);
      if (accessData) {
        const parsed = JSON.parse(accessData);
        if (parsed.status === 'approved' || parsed.email === user?.email) {
          setHasAccess(true);
        }
      }
    } catch {}
  }, [user, isAdmin]);

  function copyToClipboard(text, field) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2500);
  }

  function handlePaymentSubmit(e) {
    e.preventDefault();
    if (!trxId.trim()) {
      toast.error('Please enter the Transaction ID (TRX)');
      return;
    }

    setSubmitting(true);
    const order = {
      orderId: 'NEX-VOD-' + Date.now(),
      email: user?.email || 'guest@nexora.io',
      name: senderName || user?.name || 'Customer',
      senderAccount,
      trxId: trxId.trim(),
      paymentMethod,
      amount: PRICE_PKR,
      status: 'pending_approval',
      submittedAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('nexora_pending_video_orders') || '[]');
      existing.unshift(order);
      localStorage.setItem('nexora_pending_video_orders', JSON.stringify(existing));
      localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify(order));
    } catch {}

    setSubmitting(false);
    setShowCheckout(false);
    toast.success('Payment submitted! Admin will verify and activate your access.');
  }

  const whatsappMessage = encodeURIComponent(
    `Hello NEXORA Team! I have sent PKR ${PRICE_PKR} for the NEXORA AI Operational Video Guide.\n\nMy Details:\nName: ${senderName || user?.name || 'Customer'}\nEmail: ${user?.email || 'N/A'}\nTRX ID: ${trxId || 'N/A'}\nMethod: ${paymentMethod.toUpperCase()}`
  );

  return (
    <div className="min-h-screen bg-navy-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold mb-3">
              <HiSparkles className="w-4 h-4 text-blue-400" />
              <span>OFFICIAL NEXORA AI VIDEO GUIDE (BUILT-IN ENGINE)</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">70% OFF</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              How to Operate <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">NEXORA Platform</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-2xl">
              100% tailor-made AI guided video of the actual NEXORA platform. Watch real-time simulations of sprint boards, Super AI Gemini 3.5 prompts, 1-click PDF/Word exports, and 4K FLUX image generation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {hasAccess ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                <HiCheckCircle className="w-4 h-4" />
                <span>{isAdmin ? 'Admin VIP Unlocked ✓' : 'Premium Video Access Active ✓'}</span>
              </div>
            ) : (
              <button
                onClick={() => setShowCheckout(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <HiLockClosed className="w-4 h-4" />
                <span>Unlock All Modules (PKR {PRICE_PKR})</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Player & Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Interactive Video Tour Player */}
          <div className="lg:col-span-8 space-y-4">
            <NexoraAIVideoEngine
              hasAccess={hasAccess}
              onRequireUnlock={() => setShowCheckout(true)}
            />

            {/* Video Overview & Features Card */}
            <div className="p-6 rounded-2xl bg-navy-900/60 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HiTv className="w-5 h-5 text-blue-400" />
                  What You Learn in this Guided Video
                </h3>
                <span className="text-xs text-gray-400 font-mono">Total Duration: 01:30 • Synced AI Voice</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                    <HiViewColumns className="w-4 h-4 text-blue-400" />
                    <span>Multi-Client Workspaces</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Organize isolated client boards, monitor real-time velocity, and track task completion.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-300">
                    <HiRocketLaunch className="w-4 h-4 text-violet-400" />
                    <span>Agile Drag & Drop Kanban</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Move tasks between Backlog, In Progress, and Done with live progress indicators.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <HiSparkles className="w-4 h-4 text-amber-400" />
                    <span>Super AI Assistant (Gemini 3.5)</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Prompt the AI to write enterprise contracts, task breakdowns, and sprint architectures.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <HiDocumentText className="w-4 h-4 text-emerald-400" />
                    <span>Instant PDF & 4K Creative Studio</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    1-Click downloadable PDF/Word files and 4K FLUX marketing graphics.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Module List & Payment Verification */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Video Chapters (5)</span>
              <span className="text-xs font-normal text-emerald-400">Mod 1 is FREE</span>
            </h3>

            <div className="space-y-2.5">
              {VIDEO_SCENES.map((scene) => {
                const isUnlocked = hasAccess || scene.isFree;
                return (
                  <div
                    key={scene.id}
                    className={`p-4 rounded-2xl border transition-all text-left space-y-2 ${
                      scene.isFree
                        ? 'bg-blue-900/20 border-blue-500/30 shadow-md'
                        : isUnlocked
                        ? 'bg-navy-900/60 border-white/10'
                        : 'bg-navy-900/40 border-white/5 opacity-85'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-400">{scene.badge}</span>
                        {scene.isFree ? (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            FREE PREVIEW
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            PRO MODULE
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-gray-400 flex items-center gap-1.5">
                        {isUnlocked ? (
                          <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <HiLockClosed className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        0:18
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{scene.title}</h4>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{scene.urduTitle}</p>
                  </div>
                );
              })}
            </div>

            {/* Direct Bank Support Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-900/30 via-navy-900 to-navy-950 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-violet-400 font-bold text-xs">
                <HiShieldCheck className="w-4 h-4" />
                <span>Instant Bank & Raast Verification</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Unlock all chapters permanently. Transfer PKR {PRICE_PKR} to <strong>03404942126</strong> and send slip on WhatsApp.
              </p>
              <a
                href={`https://wa.me/923404942126?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold transition-all cursor-pointer"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Send Receipt on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* ─── CHECKOUT & BANK TRANSFER MODAL ─── */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setShowCheckout(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <HiXMark className="w-5 h-5" />
              </button>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  OFFICIAL ACCESS PASS
                </span>
                <h2 className="text-2xl font-black text-white mt-1">Unlock Video Guide Access</h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-emerald-400">PKR {PRICE_PKR}</span>
                  <span className="text-sm text-gray-500 line-through">PKR {ORIGINAL_PRICE_PKR}</span>
                  <span className="text-xs text-gray-400">• Lifetime access</span>
                </div>
              </div>

              {/* Bank Details Box */}
              <div className="p-4 rounded-2xl bg-navy-950 border border-white/10 space-y-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Official Receiving Accounts (Pakistan)
                </span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Raast / Instant Transfer:</span>
                      <strong className="text-white font-mono text-sm">03404942126</strong>
                    </div>
                    <button
                      onClick={() => copyToClipboard('03404942126', 'Raast Number')}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer"
                    >
                      {copiedField === 'Raast Number' ? <HiCheck className="w-4 h-4 text-emerald-400" /> : <HiClipboardDocument className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">EasyPaisa / JazzCash (Title: WA Admin):</span>
                      <strong className="text-white font-mono text-sm">03404942126</strong>
                    </div>
                    <button
                      onClick={() => copyToClipboard('03404942126', 'EasyPaisa')}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer"
                    >
                      {copiedField === 'EasyPaisa' ? <HiCheck className="w-4 h-4 text-emerald-400" /> : <HiClipboardDocument className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <HiShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Account Verified: Root Admin (wa363969@gmail.com)</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <span className="text-xs font-bold text-white block">Submit Payment Details:</span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Sender Mobile / Account</label>
                    <input
                      type="text"
                      value={senderAccount}
                      onChange={e => setSenderAccount(e.target.value)}
                      placeholder="0300xxxxxxx"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="raast">Raast Instant Transfer</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="bank">Direct Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Transaction ID (TRX ID / Reference) *</label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    placeholder="e.g. 847291038472"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Payment Proof'}
                </button>

                <div className="text-center pt-2">
                  <span className="text-[11px] text-gray-400 block mb-2">Or instant activate via WhatsApp:</span>
                  <a
                    href={`https://wa.me/923404942126?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#25D366] hover:underline"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>Send Screenshot to 03404942126</span>
                  </a>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
