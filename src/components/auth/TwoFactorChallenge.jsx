import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiShieldCheck, 
  HiLockClosed, 
  HiEnvelope, 
  HiDevicePhoneMobile, 
  HiKey,
  HiArrowPath,
  HiArrowLeft
} from 'react-icons/hi2';
import { dispatchOTP, verifyTwoFactorChallenge } from '../../services/twoFactorService';
import toast from 'react-hot-toast';

export default function TwoFactorChallenge({ pendingUser, onVerified, onCancel }) {
  const [code, setCode] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const config = pendingUser?.twoFactorConfig || { type: 'email' };
  const userEmail = pendingUser?.email || '';

  // Auto dispatch OTP if email or SMS
  useEffect(() => {
    if (config.type === 'email' || config.type === 'sms') {
      handleResendOTP(true);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  function handleResendOTP(isInitial = false) {
    const res = dispatchOTP(userEmail, config.type, config.verifiedPhone);
    if (res.success) {
      setResendCooldown(60);
      if (!isInitial) {
        toast.success(`New 6-digit code sent to ${res.target}!`);
      }
      // In development / demo, notify code in toast for immediate testing
      toast((t) => (
        <span className="text-xs">
          <strong>NEXORA Security Code:</strong> <span className="font-mono text-emerald-400 font-bold">{res.code}</span> (Valid for 5m)
        </span>
      ), { duration: 8000, icon: '🔐' });
    } else {
      toast.error(res.error || 'Failed to dispatch code');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyTwoFactorChallenge(userEmail, code.trim(), isRecoveryMode);
      if (result.success) {
        toast.success('Two-Step Verification Successful!');
        onVerified(pendingUser);
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (err) {
      toast.error('An unexpected verification error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-navy-800/90 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <HiShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Two-Step Verification</h2>
            <p className="text-xs text-gray-400">Account protected by 2FA</p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="p-3.5 rounded-2xl bg-navy-950/80 border border-white/10 flex items-center gap-3 text-xs text-gray-300">
        {isRecoveryMode ? (
          <HiKey className="w-5 h-5 text-amber-400 shrink-0" />
        ) : config.type === 'authenticator' ? (
          <HiLockClosed className="w-5 h-5 text-violet-400 shrink-0" />
        ) : config.type === 'sms' ? (
          <HiDevicePhoneMobile className="w-5 h-5 text-emerald-400 shrink-0" />
        ) : (
          <HiEnvelope className="w-5 h-5 text-blue-400 shrink-0" />
        )}
        <div className="leading-relaxed">
          {isRecoveryMode ? (
            <span>Enter one of your 8-character emergency backup recovery codes (e.g. <strong>XXXX-XXXX</strong>).</span>
          ) : config.type === 'authenticator' ? (
            <span>Enter the 6-digit dynamic code from your <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong> app.</span>
          ) : config.type === 'sms' ? (
            <span>Enter the 6-digit SMS verification code sent to your mobile <strong>{config.verifiedPhone || 'device'}</strong>.</span>
          ) : (
            <span>Enter the 6-digit security code dispatched to <strong>{userEmail}</strong>.</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            {isRecoveryMode ? 'Emergency Recovery Code' : '6-Digit Verification Code'}
          </label>
          <input
            type="text"
            required
            autoFocus
            maxLength={isRecoveryMode ? 12 : 6}
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder={isRecoveryMode ? 'ABCD-1234' : '••••••'}
            className="w-full px-4 py-3 text-center tracking-[0.3em] font-mono text-xl font-bold rounded-2xl bg-navy-950 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 cursor-pointer"
        >
          {loading ? 'Verifying Code...' : 'Verify & Continue'}
        </button>

        {/* Resend and Recovery Toggles */}
        <div className="flex items-center justify-between text-xs pt-2">
          {!isRecoveryMode && (config.type === 'email' || config.type === 'sms') ? (
            <button
              type="button"
              disabled={resendCooldown > 0}
              onClick={() => handleResendOTP(false)}
              className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HiArrowPath className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'animate-spin'}`} />
              <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}</span>
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={() => {
              setIsRecoveryMode(!isRecoveryMode);
              setCode('');
            }}
            className="text-amber-400 hover:text-amber-300 underline font-semibold transition-colors cursor-pointer"
          >
            {isRecoveryMode ? 'Use Authenticator / OTP' : 'Use a Recovery Code'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
