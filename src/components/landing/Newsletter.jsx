import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiEnvelope, HiPaperAirplane } from 'react-icons/hi2';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      toast.success('Thank you! You are on the priority product insider list.');
    }, 700);
  }

  return (
    <section className="py-20 relative bg-navy-900/60 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-violet-500 mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-violet-500/25">
          <HiEnvelope className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Stay Ahead of the <span className="gradient-text">Productivity Curve</span>
        </h2>
        <p className="text-gray-400 text-base max-w-xl mx-auto mb-8">
          Join over 10,000 engineering leaders and product innovators receiving our bi-weekly breakdown on AI-augmented agile workflows.
        </p>

        {subscribed ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 max-w-md mx-auto text-sm">
            🎉 You have successfully subscribed to the NEXORA Dispatch!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email address"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : (
                <>
                  Subscribe <HiPaperAirplane className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
        <p className="text-xs text-gray-500 mt-4">
          No spam ever. Unsubscribe anytime with a single click.
        </p>
      </div>
    </section>
  );
}
