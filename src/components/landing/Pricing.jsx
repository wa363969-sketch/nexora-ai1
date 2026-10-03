import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCheck, HiSparkles } from 'react-icons/hi2';
import { useAuth } from '../../contexts/AuthContext';
import { getSubscription } from '../../services/dataService';

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const { user } = useAuth();
  const [currentPlanId, setCurrentPlanId] = useState(null);

  useEffect(() => {
    if (user) {
      getSubscription().then(sub => {
        if (sub?.planId) setCurrentPlanId(sub.planId);
      }).catch(() => {});
    }
  }, [user]);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$0',
      period: 'Forever free',
      desc: 'Ideal for independent developers and solopreneurs exploring AI project workflows.',
      features: [
        'Up to 5 active projects',
        '50 tasks with Kanban & List view',
        '1 team workspace (up to 3 members)',
        'Basic AI Assistant (100 msgs/mo)',
        'Community Discord support',
        '7-day activity history'
      ],
      popular: false,
      cta: user ? (currentPlanId === 'starter' ? 'Current Plan' : 'Select Starter') : 'Get Started Free',
      href: user ? '/subscriptions' : '/register?plan=starter'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: annual ? '$12' : '$15',
      period: annual ? 'per member / month, billed annually' : 'per member / month, billed monthly',
      desc: 'For high-velocity product teams who need complete AI automation and unlimited scale.',
      features: [
        'Unlimited active projects & tasks',
        'Unlimited team members & guest roles',
        'Advanced AI Co-Pilot (Gemini 3.5 & GPT-4o)',
        '5,000 AI generations / month',
        'Interactive Drag & Drop Kanban & Calendar',
        'Priority email & ticket support',
        'Full activity audit trails & reports',
        'Custom workflow triggers'
      ],
      popular: true,
      cta: user ? (currentPlanId === 'pro' ? 'Current Plan' : 'Upgrade to Pro') : 'Start 14-Day Free Trial',
      href: user
        ? `/subscriptions?plan=pro&billing=${annual ? 'annual' : 'monthly'}`
        : `/register?plan=pro&billing=${annual ? 'annual' : 'monthly'}`
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: annual ? '$39' : '$49',
      period: 'per member / month, custom SLA',
      desc: 'For organizations demanding custom security, dedicated AI capacity, and private deployments.',
      features: [
        'Everything in Pro plan',
        'Bring Your Own Key (BYOK) AI models',
        'Dedicated Appwrite cluster option',
        'SSO (SAML, Okta, Azure AD) integration',
        'Dedicated customer success architect',
        'Custom 99.99% uptime SLA',
        'Custom contract & invoicing terms',
        'Advanced admin audit logs'
      ],
      popular: false,
      cta: user ? (currentPlanId === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise') : 'Contact Enterprise Sales',
      href: user
        ? `/subscriptions?plan=enterprise&billing=${annual ? 'annual' : 'monthly'}`
        : `/register?plan=enterprise&billing=${annual ? 'annual' : 'monthly'}`
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-navy-950 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            Simple, Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Invest in Velocity. <span className="gradient-text">Cancel Anytime.</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Choose the plan that suits your team. Upgrade or downgrade anytime with zero hidden fees.
          </p>

          {/* Billing switcher */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-xl bg-white/[0.05] border border-white/10">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                annual ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-400 text-navy-950 font-bold">SAVE 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-2xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
                p.popular
                  ? 'bg-navy-900/90 border-2 border-violet-500/60 shadow-2xl shadow-violet-500/20 scale-105 z-10'
                  : 'bg-white/[0.03] border border-white/10 hover:border-white/20'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-bold tracking-wider uppercase flex items-center gap-1 shadow-lg shadow-violet-500/30">
                  <HiSparkles className="w-3.5 h-3.5" /> Most Popular
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{p.name}</h3>
                <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{p.desc}</p>
                
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl sm:text-5xl font-black text-white">{p.price}</span>
                  <span className="text-gray-400 text-sm font-medium">/mo</span>
                </div>
                <div className="text-xs text-gray-400 mb-8">{p.period}</div>

                <div className="space-y-3 pt-6 border-t border-white/10">
                  {p.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-start gap-3 text-sm text-gray-300">
                      <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                        <HiCheck className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-white/5">
                <Link
                  to={p.href}
                  className={`w-full py-3 rounded-xl font-semibold text-center text-sm transition-all block ${
                    p.popular
                      ? 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white shadow-lg shadow-violet-500/30 hover:scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
