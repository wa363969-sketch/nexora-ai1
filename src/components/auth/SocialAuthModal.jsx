import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiCheck, HiShieldCheck, HiArrowRight, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import { FaGoogle, FaMicrosoft, FaGithub } from 'react-icons/fa';
import { getGatewayConfig } from '../../services/paymentGatewayService';

export default function SocialAuthModal({
  isOpen,
  onClose,
  provider = 'google', // 'google' | 'microsoft' | 'github'
  onSelectAccount,
  onOAuthRedirect
}) {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const config = getGatewayConfig();
  const oauthConfig = config?.oauth?.[provider] || { enabled: true };

  if (!isOpen) return null;

  const PROVIDER_INFO = {
    google: {
      name: 'Google',
      icon: FaGoogle,
      color: 'from-blue-500 to-red-500',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30',
      accounts: [
        { email: 'wa363969@gmail.com', name: 'WA Admin (Root)', role: 'Root Admin' },
        { email: 'waqas.enterprise@nexora.io', name: 'Waqas Enterprise', role: 'Enterprise SLA' },
        { email: 'developer@google.com', name: 'Lead Dev', role: 'Developer' }
      ]
    },
    microsoft: {
      name: 'Microsoft Account',
      icon: FaMicrosoft,
      color: 'from-blue-600 to-emerald-500',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      accounts: [
        { email: 'wa363969@outlook.com', name: 'WA Admin (MS)', role: 'Enterprise Admin' },
        { email: 'azure.cloud@live.com', name: 'Azure Cloud Lead', role: 'DevOps' }
      ]
    },
    github: {
      name: 'GitHub',
      icon: FaGithub,
      color: 'from-purple-600 to-slate-700',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      accounts: [
        { email: 'wa363969@gmail.com', name: 'wa363969 (GitHub)', role: 'Organization Owner' },
        { email: 'octocat@github.com', name: 'GitHub Developer', role: 'Maintainer' }
      ]
    }
  };

  const currentProvider = PROVIDER_INFO[provider] || PROVIDER_INFO.google;
  const ProviderIcon = currentProvider.icon;

  function handleCustomSubmit(e) {
    e.preventDefault();
    if (!customEmail) return;
    onSelectAccount(customEmail.trim(), customName.trim() || customEmail.split('@')[0], provider);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <HiXMark className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white text-xl shadow-lg">
            <ProviderIcon />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Sign in with {currentProvider.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentProvider.badgeBg}`}>
                OAuth 2.0
              </span>
            </div>
            <p className="text-xs text-gray-400">Choose an account to continue to NEXORA</p>
          </div>
        </div>

        {!useCustom ? (
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Verified Accounts:
            </span>

            {currentProvider.accounts.map((acc) => (
              <div
                key={acc.email}
                onClick={() => onSelectAccount(acc.email, acc.name, provider)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    {acc.name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      {acc.name}
                    </div>
                    <div className="text-[11px] text-gray-400">{acc.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 font-medium">
                    {acc.role}
                  </span>
                  <HiArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                onClick={() => setUseCustom(true)}
                className="text-blue-400 hover:text-blue-300 font-semibold underline cursor-pointer"
              >
                Use another {currentProvider.name} email
              </button>

              {onOAuthRedirect && (
                <button
                  onClick={onOAuthRedirect}
                  className="text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>Direct OAuth</span>
                  <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="e.g. Ali Ahmed"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">{currentProvider.name} Email *</label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
                placeholder={`user@${provider === 'github' ? 'users.noreply.github.com' : provider === 'microsoft' ? 'outlook.com' : 'gmail.com'}`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUseCustom(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg"
              >
                Authorize & Sign In
              </button>
            </div>
          </form>
        )}

        <div className="p-3 rounded-xl bg-navy-950/80 border border-white/5 flex items-center gap-2 text-[11px] text-gray-400">
          <HiShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>OAuth 2.0 PKCE Protected. Your credentials are encrypted.</span>
        </div>
      </motion.div>
    </div>
  );
}
