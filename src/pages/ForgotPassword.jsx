import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEnvelope, HiArrowLeft, HiCheckCircle } from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localResetUrl, setLocalResetUrl] = useState('');
  const { forgotPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res?.localRecovery && res?.resetUrl) {
        setLocalResetUrl(res.resetUrl);
      } else {
        setLocalResetUrl('');
      }
      setSubmitted(true);
      toast.success('Recovery instructions sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
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
          <p className="text-gray-400 mt-2">Reset your password</p>
        </div>

        {/* Form Card */}
        <div className="bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-4"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <HiCheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm mb-6">
                We've sent a password recovery link to{' '}
                <span className="text-white font-medium">{email}</span>.
                Please check your inbox and follow the instructions.
              </p>
              {localResetUrl && (
                <div className="mb-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left space-y-2">
                  <p className="text-xs text-blue-300">
                    Cloud email service is currently offline. Use this secure direct recovery session:
                  </p>
                  <Link
                    to={localResetUrl}
                    className="inline-block w-full text-center py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Set New Password Now →
                  </Link>
                </div>
              )}
              <p className="text-gray-500 text-xs mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  try again
                </button>
                .
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <HiArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </motion.div>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-6">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-300">Email address</label>
                  <div className="relative">
                    <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {loading ? 'Sending...' : 'Send Recovery Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 text-sm transition-colors"
                >
                  <HiArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
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
