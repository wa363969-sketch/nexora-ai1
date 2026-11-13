import { useState } from 'react';
import { 
  HiCog6Tooth, 
  HiLockClosed, 
  HiSun, 
  HiMoon, 
  HiCpuChip, 
  HiBell, 
  HiServerStack,
  HiCheck
} from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import TwoFactorSettingsCard from '../components/settings/TwoFactorSettingsCard';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updatePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Preference states
  const [defaultModel, setDefaultModel] = useState('gemini-3.5-flash-lite');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [desktopAlerts, setDesktopAlerts] = useState(true);

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoadingPassword(true);
    try {
      await updatePassword(oldPassword, newPassword);
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      toast.error(e.message || 'Failed to update password');
    } finally {
      setLoadingPassword(false);
    }
  }

  function handleSavePreferences(e) {
    e.preventDefault();
    toast.success('Workspace preferences saved');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <HiCog6Tooth className="w-7 h-7 text-blue-400" /> Account & Workspace Settings
        </h1>
        <p className="text-xs text-gray-400">
          Configure security, default AI engines, theme styling, and infrastructure telemetry.
        </p>
      </div>

      {/* Security: Password Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HiLockClosed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Security & Password</h3>
            <p className="text-xs text-gray-400">Update your account authentication credentials</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingPassword}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            {loadingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Two-Step Verification (2FA) */}
      <TwoFactorSettingsCard user={user} />

      {/* AI & Intelligence Preferences */}
      <div className="p-6 sm:p-8 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <HiCpuChip className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Default AI Engine</h3>
            <p className="text-xs text-gray-400">Choose the foundation model for background co-pilot actions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', tag: 'Fastest Latency', speed: 'Ultra-fast smart replies' },
            { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', tag: 'Complex Reasoning', speed: 'Balanced deep synthesis' },
            { id: 'gpt-4o', name: 'OpenAI GPT-4o', tag: 'Omni Multimodal', speed: 'Broad world knowledge' },
          ].map(m => (
            <div
              key={m.id}
              onClick={() => setDefaultModel(m.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                defaultModel === m.id
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 bg-navy-950/40 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{m.name}</span>
                {defaultModel === m.id && <HiCheck className="w-4 h-4 text-violet-400" />}
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-300 font-medium">
                {m.tag}
              </span>
              <p className="text-[11px] text-gray-400 mt-2">{m.speed}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance & System Telemetry */}
      <div className="p-6 sm:p-8 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HiServerStack className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">System Status & Environment</h3>
            <p className="text-xs text-gray-400">Runtime backend configuration diagnostics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-navy-950/80 border border-white/5 space-y-1">
            <div className="text-gray-400">Appwrite Endpoint</div>
            <div className="text-white truncate">{import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-950/80 border border-white/5 space-y-1">
            <div className="text-gray-400">Database Engine</div>
            <div className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Connected & Synchronized
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
