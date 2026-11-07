import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiShieldCheck, 
  HiLockClosed, 
  HiEnvelope, 
  HiDevicePhoneMobile, 
  HiQrCode,
  HiCheck, 
  HiClipboardDocument, 
  HiArrowDownTray,
  HiExclamationTriangle,
  HiXMark,
  HiArrowPath,
  HiKey
} from 'react-icons/hi2';
import { 
  get2FAConfig, 
  save2FAConfig, 
  generateBase32Secret, 
  getAuthenticatorSetup, 
  dispatchOTP, 
  enableTwoFactor, 
  disableTwoFactor,
  generateBackupRecoveryCodes
} from '../../services/twoFactorService';
import toast from 'react-hot-toast';

export default function TwoFactorSettingsCard({ user }) {
  const userEmail = user?.email || 'wa363969@gmail.com';
  const [config, setConfig] = useState(() => get2FAConfig(userEmail));
  
  // Wizard state: 'idle' | 'configuring' | 'recovery_codes'
  const [wizardStep, setWizardStep] = useState('idle');
  const [selectedType, setSelectedType] = useState('authenticator'); // 'email' | 'sms' | 'authenticator'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [authenticatorData, setAuthenticatorData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    setConfig(get2FAConfig(userEmail));

    const handleConfigChange = (e) => {
      if (e.detail) setConfig(e.detail);
    };
    window.addEventListener('nexora_2fa_config_changed', handleConfigChange);
    return () => window.removeEventListener('nexora_2fa_config_changed', handleConfigChange);
  }, [userEmail]);

  function startSetup(type) {
    setSelectedType(type);
    setVerificationCode('');
    setWizardStep('configuring');

    if (type === 'authenticator') {
      const secret = generateBase32Secret();
      const setup = getAuthenticatorSetup(userEmail, secret);
      setAuthenticatorData(setup);
    } else if (type === 'email') {
      const res = dispatchOTP(userEmail, 'email');
      if (res.success) {
        toast.success(`6-digit code sent to ${userEmail}!`);
        toast(`NEXORA Code: ${res.code}`, { icon: '🔐' });
      } else {
        toast.error(res.error || 'Failed to dispatch email code');
      }
    }
  }

  function handleSendSmsCode() {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }
    const res = dispatchOTP(userEmail, 'sms', phoneNumber.trim());
    if (res.success) {
      toast.success(`6-digit SMS code dispatched to ${phoneNumber}!`);
      toast(`NEXORA Code: ${res.code}`, { icon: '📱' });
    } else {
      toast.error(res.error || 'Failed to dispatch SMS');
    }
  }

  async function handleConfirmEnable(e) {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setSubmitting(true);
    try {
      const res = await enableTwoFactor(
        userEmail,
        selectedType,
        verificationCode.trim(),
        authenticatorData?.secret,
        phoneNumber
      );

      if (res.success) {
        toast.success('Two-Step Verification Enabled!');
        setConfig(get2FAConfig(userEmail));
        setWizardStep('recovery_codes');
      } else {
        toast.error(res.error || 'Invalid verification code');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleDisable() {
    if (!window.confirm('Are you sure you want to disable Two-Step Verification? Your account will be less secure.')) {
      return;
    }
    disableTwoFactor(userEmail);
    setConfig(get2FAConfig(userEmail));
    setWizardStep('idle');
    toast.success('Two-Step Verification disabled.');
  }

  function copyAllRecoveryCodes() {
    const codes = config.recoveryCodes.map(r => r.code).join('\n');
    navigator.clipboard.writeText(codes);
    setCopiedCodes(true);
    toast.success('All backup recovery codes copied!');
    setTimeout(() => setCopiedCodes(false), 2500);
  }

  function downloadRecoveryCodes() {
    const text = `NEXORA 2FA EMERGENCY RECOVERY CODES\nAccount: ${userEmail}\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes in a secure location. Each code can only be used once if you lose access to your verification device.\n\n` +
      config.recoveryCodes.map((r, i) => `${i + 1}. ${r.code} ${r.used ? '[USED]' : '[ACTIVE]'}`).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-recovery-codes-${userEmail.replace(/[^a-z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recovery codes downloaded (.txt)');
  }

  function handleRegenerateCodes() {
    if (!window.confirm('Regenerating will invalidate all existing recovery codes. Continue?')) {
      return;
    }
    const fresh = generateBackupRecoveryCodes();
    const updated = { ...config, recoveryCodes: fresh };
    save2FAConfig(userEmail, updated);
    setConfig(updated);
    toast.success('New recovery codes generated!');
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-navy-900/80 border border-white/10 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HiShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Two-Step Verification (2FA)</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                config.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}>
                {config.enabled ? 'ACTIVE ✓' : 'DISABLED'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Protect your account against unauthorized access with a second verification challenge upon sign-in.
            </p>
          </div>
        </div>

        {config.enabled && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRecoveryModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors cursor-pointer"
            >
              Backup Codes ({config.recoveryCodes.filter(r => !r.used).length}/8)
            </button>
            <button
              onClick={handleDisable}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              Disable 2FA
            </button>
          </div>
        )}
      </div>

      {/* ─── STATE 1: 2FA IS CURRENTLY DISABLED ─── */}
      {!config.enabled && wizardStep === 'idle' && (
        <div className="space-y-4">
          <span className="text-xs font-bold text-gray-300 block">Choose a verification method to activate:</span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Authenticator App */}
            <div
              onClick={() => startSetup('authenticator')}
              className="p-4 rounded-2xl bg-navy-950/60 hover:bg-navy-950 border border-white/5 hover:border-violet-500/40 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                  <HiQrCode className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[9px] font-bold">
                  RECOMMENDED
                </span>
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                Authenticator App
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Google Authenticator, Microsoft Authenticator, or Authy with dynamic 30s rotating TOTP.
              </p>
            </div>

            {/* Email OTP */}
            <div
              onClick={() => startSetup('email')}
              className="p-4 rounded-2xl bg-navy-950/60 hover:bg-navy-950 border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <HiEnvelope className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                Email Verification
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Receive an encrypted 6-digit one-time code to <strong>{userEmail}</strong> on each sign-in attempt.
              </p>
            </div>

            {/* SMS OTP */}
            <div
              onClick={() => startSetup('sms')}
              className="p-4 rounded-2xl bg-navy-950/60 hover:bg-navy-950 border border-white/5 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <HiDevicePhoneMobile className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                SMS Code
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Receive security verification codes directly on your mobile device.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── STATE 2: CONFIGURING METHOD ─── */}
      {!config.enabled && wizardStep === 'configuring' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-navy-950 border border-white/10 space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HiShieldCheck className="w-4 h-4 text-blue-400" />
              <span>
                {selectedType === 'authenticator' && 'Setup Google / Microsoft Authenticator'}
                {selectedType === 'email' && `Verify Email (${userEmail})`}
                {selectedType === 'sms' && 'Configure SMS Verification'}
              </span>
            </h4>
            <button
              onClick={() => setWizardStep('idle')}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Authenticator QR Setup */}
          {selectedType === 'authenticator' && authenticatorData && (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-2 bg-white rounded-2xl shadow-xl shrink-0">
                <img
                  src={authenticatorData.qrCodeUrl}
                  alt="2FA QR Code"
                  className="w-36 h-36 rounded-lg"
                />
              </div>

              <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
                <p>1. Open <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong> on your phone.</p>
                <p>2. Tap <strong>+</strong> and scan this QR code.</p>
                <div className="pt-1">
                  <span className="text-[10px] text-gray-400 block mb-0.5">Or enter secret key manually:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-300 bg-white/5 px-2.5 py-1 rounded-lg select-all">
                      {authenticatorData.secret}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(authenticatorData.secret);
                        toast.success('Secret key copied!');
                      }}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-gray-300"
                    >
                      <HiClipboardDocument className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SMS Setup */}
          {selectedType === 'sms' && (
            <div className="max-w-md space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendSmsCode}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    Send SMS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form to confirm code */}
          <form onSubmit={handleConfirmEnable} className="max-w-md space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Enter the 6-digit confirmation code:
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-base tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWizardStep('idle')}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || verificationCode.length < 6}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-lg disabled:opacity-40"
              >
                {submitting ? 'Verifying...' : 'Verify & Enable 2FA'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ─── STATE 3: RECOVERY CODES PROMPT (AFTER ACTIVATION) ─── */}
      {wizardStep === 'recovery_codes' && config.recoveryCodes && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4"
        >
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <HiKey className="w-5 h-5" />
            <span>Save Your Backup Recovery Codes</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            If you ever lose access to your primary 2FA device, you can sign in using these one-time recovery codes. Store them somewhere safe like a password manager.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs font-bold text-white bg-navy-950 p-4 rounded-xl border border-white/10">
            {config.recoveryCodes.map((r, i) => (
              <div key={i} className="p-2 rounded bg-white/5 text-center">
                {r.code}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex gap-2">
              <button
                onClick={copyAllRecoveryCodes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                {copiedCodes ? <HiCheck className="w-4 h-4 text-emerald-400" /> : <HiClipboardDocument className="w-4 h-4" />}
                <span>{copiedCodes ? 'Copied ✓' : 'Copy All'}</span>
              </button>
              <button
                onClick={downloadRecoveryCodes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                <HiArrowDownTray className="w-4 h-4" />
                <span>Download .txt</span>
              </button>
            </div>

            <button
              onClick={() => setWizardStep('idle')}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
            >
              ✓ I Have Stored These Codes
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── ACTIVE 2FA STATUS DETAILS ─── */}
      {config.enabled && (
        <div className="p-4 rounded-2xl bg-navy-950 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="font-bold text-white">
                Primary Method: {config.type === 'authenticator' ? 'Google / Microsoft Authenticator' : config.type === 'sms' ? `SMS to ${config.verifiedPhone}` : `Email OTP to ${userEmail}`}
              </div>
              <div className="text-[11px] text-gray-500">
                Active since {new Date(config.enabledAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <HiShieldCheck className="w-4 h-4" />
            <span>High Security Enforced</span>
          </div>
        </div>
      )}

      {/* ─── BACKUP RECOVERY CODES INSPECTION MODAL ─── */}
      <AnimatePresence>
        {showRecoveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl"
            >
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-white"
              >
                <HiXMark className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <HiKey className="w-5 h-5 text-amber-400" />
                  Backup Recovery Codes
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Single-use emergency codes. Keep them in a secure place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold bg-navy-950 p-4 rounded-2xl border border-white/10">
                {config.recoveryCodes.map((r, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-center ${
                      r.used
                        ? 'bg-rose-500/10 text-rose-400 line-through opacity-50'
                        : 'bg-white/5 text-white'
                    }`}
                  >
                    {r.code} {r.used && '(Used)'}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={copyAllRecoveryCodes}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    Copy
                  </button>
                  <button
                    onClick={downloadRecoveryCodes}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    Download
                  </button>
                </div>

                <button
                  onClick={handleRegenerateCodes}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
