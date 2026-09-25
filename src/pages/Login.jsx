import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import { FaGoogle, FaMicrosoft, FaGithub } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import TwoFactorChallenge from '../components/auth/TwoFactorChallenge';
import OAuthSecurityModal from '../components/auth/OAuthSecurityModal';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2FA Challenge state
  const [pending2FAUser, setPending2FAUser] = useState(null);

  // Real OAuth Security Modal
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState('google');

  const [loading, setLoading] = useState(false);
  const { login, complete2FALogin, loginWithOAuthProvider } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.requires2FA) {
        setPending2FAUser(res.pendingUser);
        toast('Two-step verification required for this account', { icon: '🛡️' });
        return;
      }
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  function handleOAuthSignIn(provider) {
    setActiveProvider(provider);
    setSecurityModalOpen(true);
  }

  async function handleOAuthSuccess(accountDetails) {
    setSecurityModalOpen(false);
    setLoading(true);
    try {
      const res = await loginWithOAuthProvider(
        accountDetails.provider,
        accountDetails.email,
        accountDetails.name
      );
      if (res?.requires2FA) {
        setPending2FAUser(res.pendingUser);
        toast('Two-step verification required for this account', { icon: '🛡️' });
        return;
      }
      toast.success(`${accountDetails.provider === 'google' ? 'Google' : accountDetails.provider} verification complete! Welcome, ${accountDetails.name}! 🎉`);
      navigate('/dashboard');
    } catch (e) {
      toast.error('Authentication error');
    } finally {
      setLoading(false);
    }
  }

  function handle2FAVerified(authenticatedUser) {
    complete2FALogin(authenticatedUser);
    setPending2FAUser(null);
    toast.success('Identity verified! Redirecting to dashboard...');
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-black gradient-text">NEXORA</h1>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Welcome back. Sign in to your workspace.</p>
        </div>

        {/* Conditional View: 2FA Challenge vs Standard Login */}
        {pending2FAUser ? (
          <TwoFactorChallenge
            pendingUser={pending2FAUser}
            onVerified={handle2FAVerified}
            onCancel={() => setPending2FAUser(null)}
          />
        ) : (
          <div className="bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Third-Party OAuth 2.0 Sign-In Buttons */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center mb-1">
                Sign In with OAuth 2.0 — Real Google Verification
              </span>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                  title="Sign in with Google"
                >
                  <FaGoogle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="truncate">Google</span>
                </button>

                {/* Microsoft */}
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('microsoft')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                  title="Sign in with Microsoft"
                >
                  <FaMicrosoft className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">Microsoft</span>
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                  title="Sign in with GitHub"
                >
                  <FaGithub className="w-4 h-4 text-gray-200 shrink-0" />
                  <span className="truncate">GitHub</span>
                </button>
              </div>

              <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                🔒 Official Google Identity & OAuth 2.0 Security Gate
              </p>
            </div>

            {/* Google / Microsoft / GitHub Verification Security Modal */}
            <OAuthSecurityModal
              isOpen={securityModalOpen}
              onClose={() => setSecurityModalOpen(false)}
              provider={activeProvider}
              onSuccess={handleOAuthSuccess}
            />

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-navy-800 px-3 text-[11px] text-gray-400 uppercase font-medium tracking-wider">
                or email & password
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Standard Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">Email Address</label>
                <div className="relative">
                  <HiEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs transition-all"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="block text-xs font-semibold text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                  >
                    {showPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-xs uppercase tracking-wider cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-white/5">
              <p className="text-gray-400 text-xs">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
            ← Back to NEXORA Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
