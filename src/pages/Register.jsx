import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiUser, HiSparkles } from 'react-icons/hi2';
import { FaGoogle, FaMicrosoft, FaGithub } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import OAuthSecurityModal from '../components/auth/OAuthSecurityModal';
import toast from 'react-hot-toast';

export default function Register() {
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'starter';
  const selectedBilling = searchParams.get('billing') || 'monthly';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Real OAuth Security Modal
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState('google');
  
  const [loading, setLoading] = useState(false);
  const { register, loginWithOAuthProvider } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, { selectedPlan, selectedBilling });
      toast.success(selectedPlan !== 'starter' ? `Account created! ${selectedPlan.toUpperCase()} trial active.` : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenSocial(provider) {
    setActiveProvider(provider);
    setSecurityModalOpen(true);
  }

  async function handleOAuthSuccess(accountDetails) {
    setSecurityModalOpen(false);
    setLoading(true);
    try {
      await loginWithOAuthProvider(
        accountDetails.provider,
        accountDetails.email,
        accountDetails.name,
        { selectedPlan, selectedBilling }
      );
      toast.success(`${accountDetails.provider === 'google' ? 'Google' : accountDetails.provider} verified! Welcome to NEXORA, ${accountDetails.name}! 🎉`);
      navigate('/dashboard');
    } catch (e) {
      toast.error(`${accountDetails.provider} registration failed`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
            <h1 className="text-3xl font-bold gradient-text">NEXORA</h1>
          </Link>
          <p className="text-gray-400 mt-2">Create your account to get started.</p>
        </div>

        {/* Form Card */}
        <div className="bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-5">
          {/* Selected Plan Notification Pill */}
          {selectedPlan && selectedPlan !== 'starter' && (
            <div className="p-3.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-xs text-violet-300 flex items-center justify-between shadow-inner">
              <span className="flex items-center gap-2 font-medium">
                <HiSparkles className="w-4 h-4 text-violet-400" />
                <span>Selected Plan: <strong className="text-white uppercase">{selectedPlan}</strong></span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/25 text-violet-200 border border-violet-500/40">
                14-Day Free Trial
              </span>
            </div>
          )}

          {/* Third-Party OAuth 2.0 Registration Buttons */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center mb-1">
              Quick Register with OAuth 2.0
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenSocial('google')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <FaGoogle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="truncate">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenSocial('microsoft')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <FaMicrosoft className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">Microsoft</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenSocial('github')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <FaGithub className="w-4 h-4 text-gray-200 shrink-0" />
                <span className="truncate">GitHub</span>
              </button>
            </div>
          </div>

          {/* Real Google / Microsoft / GitHub Verification Security Modal */}
          <OAuthSecurityModal
            isOpen={securityModalOpen}
            onClose={() => setSecurityModalOpen(false)}
            provider={activeProvider}
            onSuccess={handleOAuthSuccess}
          />

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-navy-800 px-3 text-xs text-gray-400 uppercase font-medium tracking-wider">
              or with email
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  placeholder="Min. 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
              />
              <label htmlFor="terms" className="text-xs text-gray-400 leading-snug">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-400 hover:text-blue-300 underline">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-sm"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-white/5">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← Back to homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
