import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiCreditCard, 
  HiSparkles, 
  HiCheck, 
  HiShieldCheck, 
  HiLockClosed,
  HiCheckCircle,
  HiArrowPath,
  HiDocumentText,
  HiPrinter,
  HiXMark,
  HiExclamationTriangle,
  HiClock,
  HiClipboardDocumentCheck,
  HiBuildingLibrary,
  HiDevicePhoneMobile,
  HiPaperAirplane,
  HiArrowUturnLeft,
  HiBolt,
  HiCurrencyDollar
} from 'react-icons/hi2';
import { FaWhatsapp, FaStripe, FaPaypal } from 'react-icons/fa';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import { 
  getSubscription, 
  getSubscriptionPlans, 
  cancelSubscription, 
  getProjects, 
  getTasks,
  getAdminBillingConfig,
  submitSubscriptionPaymentRequest
} from '../services/dataService';
import {
  getGatewayConfig,
  executeGatewayPayment,
  getPlatformTransactions,
  requestRefund
} from '../services/paymentGatewayService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Subscriptions() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [adminBilling, setAdminBilling] = useState(null);

  // Resource Counts
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  // Real Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real payment proof fields
  const [paymentChannel, setPaymentChannel] = useState('Bank Transfer (Raast / IBFT)');
  const [senderName, setSenderName] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Receipt modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Cancel modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Gateway and Platform Transactions state
  const [gatewayConfig, setGatewayConfig] = useState(getGatewayConfig());
  const [platformTransactions, setPlatformTransactions] = useState([]);
  const [activeGateway, setActiveGateway] = useState('stripe');

  // Card details for Stripe
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Jane Doe');

  // Mobile wallet for JazzCash / EasyPaisa / Safepay
  const [walletPhone, setWalletPhone] = useState('03001234567');
  const [walletMpin, setWalletMpin] = useState('1234');

  // Refund modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedTxnForRefund, setSelectedTxnForRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('Plan upgrade adjustment requested');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const sub = await getSubscription();
      const allPlans = getSubscriptionPlans();
      const projs = await getProjects();
      const tsks = await getTasks();
      const billingConfig = getAdminBillingConfig();
      const txns = getPlatformTransactions(user?.email);
      const gwConfig = getGatewayConfig();

      setSubscription(sub);
      setPlans(allPlans);
      setProjectCount(projs.length);
      setTaskCount(tsks.length);
      setAdminBilling(billingConfig);
      setPlatformTransactions(txns);
      setGatewayConfig(gwConfig);

      if (sub?.billingCycle === 'monthly') {
        setAnnualBilling(false);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const handleSubChange = (e) => {
      if (e.detail) setSubscription(e.detail);
    };
    window.addEventListener('nexora-subscription-changed', handleSubChange);
    return () => window.removeEventListener('nexora-subscription-changed', handleSubChange);
  }, []);

  // Handle URL query parameters e.g. /subscriptions?plan=pro
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && plans.length > 0) {
      const target = plans.find(p => p.id === planParam.toLowerCase());
      if (target && target.id !== subscription?.planId) {
        initiateUpgrade(target);
      }
    }
  }, [searchParams, plans, subscription]);

  function initiateUpgrade(plan) {
    setSelectedPlanForCheckout(plan);
    setTrxId('');
    setSenderName(user?.name || '');
    setSenderAccount('');
    setPaymentNotes('');
    setIsCheckoutOpen(true);
  }

  function handleCopy(text, label) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  }

  function handleFillTestCard() {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setCardHolder(user?.name || 'Jane Doe');
    toast.success('Stripe Sandbox test card loaded!');
  }

  async function handleSubmitPayment(e) {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    setIsSubmitting(true);
    try {
      if (activeGateway === 'raast') {
        // Manual Bank Transfer / Raast workflow with Admin verification
        if (!senderName.trim()) {
          toast.error('Please enter the sender account name');
          setIsSubmitting(false);
          return;
        }
        if (!trxId.trim()) {
          toast.error('Please enter the Transaction ID (TRX) from your receipt');
          setIsSubmitting(false);
          return;
        }

        const updated = await submitSubscriptionPaymentRequest({
          planId: selectedPlanForCheckout.id,
          billingCycle: annualBilling ? 'annual' : 'monthly',
          paymentMethod: paymentChannel,
          trxId,
          senderName,
          senderAccount,
          notes: paymentNotes
        });

        setSubscription(updated);
        setIsCheckoutOpen(false);
        toast.success('Payment submitted! Awaiting Admin verification.');
      } else {
        // Direct Gateway Payment Engine (Stripe, PayPal, Safepay, JazzCash, Easypaisa)
        const res = await executeGatewayPayment({
          gateway: activeGateway,
          planId: selectedPlanForCheckout.id,
          planName: selectedPlanForCheckout.name,
          billingCycle: annualBilling ? 'yearly' : 'monthly',
          amount: priceToPay,
          currency: (activeGateway === 'stripe' || activeGateway === 'paypal') ? 'USD' : 'PKR',
          customerEmail: user?.email,
          customerName: user?.name,
          paymentDetails: {
            cardNumber,
            cardExpiry,
            cardCvc,
            cardHolder,
            account: activeGateway === 'stripe' ? cardNumber : walletPhone,
            phone: walletPhone,
            mpin: walletMpin
          }
        });

        if (res.success) {
          toast.success(`Payment verified via ${activeGateway.toUpperCase()}! Upgraded to ${selectedPlanForCheckout.name}.`);
          setIsCheckoutOpen(false);
          await loadData();
        } else {
          toast.error(res.error || 'Payment gateway failed to process transaction');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Payment submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRefundSubmit(e) {
    e.preventDefault();
    if (!selectedTxnForRefund) return;
    setIsSubmittingRefund(true);
    try {
      const ok = requestRefund(selectedTxnForRefund.id, refundReason, user?.email);
      if (ok) {
        toast.success('Refund request submitted to Admin! Processing takes 24-48 hours.');
        setIsRefundModalOpen(false);
        await loadData();
      } else {
        toast.error('Could not submit refund request');
      }
    } catch (err) {
      toast.error('Refund processing error');
    } finally {
      setIsSubmittingRefund(false);
    }
  }

  async function handleConfirmCancel() {
    try {
      const updated = await cancelSubscription();
      setSubscription(updated);
      setIsCancelModalOpen(false);
      toast.success('Subscription reverted to Free Starter tier.');
    } catch (err) {
      toast.error('Error modifying subscription');
    }
  }

  const currentPlanObj = plans.find(p => p.id === subscription?.planId) || plans[0] || {
    id: 'starter',
    name: 'Starter',
    maxProjects: 5,
    maxTasks: 50,
    maxAiQueries: 100
  };

  const isPendingApproval = subscription?.status === 'pending_approval';
  const isRejected = subscription?.status === 'rejected';

  // Quota percentages
  const maxProj = currentPlanObj.maxProjects === Infinity ? 9999 : currentPlanObj.maxProjects;
  const projectPct = Math.min(100, Math.round((projectCount / (currentPlanObj.maxProjects === Infinity ? 50 : maxProj)) * 100));
  
  const maxTsk = currentPlanObj.maxTasks === Infinity ? 99999 : currentPlanObj.maxTasks;
  const taskPct = Math.min(100, Math.round((taskCount / (currentPlanObj.maxTasks === Infinity ? 100 : maxTsk)) * 100));

  const aiMax = subscription?.maxAiQueries || currentPlanObj.maxAiQueries || 100;
  const aiUsed = subscription?.aiQueriesUsed || 0;
  const aiPct = Math.min(100, Math.round((aiUsed / aiMax) * 100));

  // Compute checkout price
  const baseMonthlyPrice = selectedPlanForCheckout?.priceMonthly || 0;
  const baseAnnualMonthlyPrice = selectedPlanForCheckout?.priceAnnual || 0;
  const priceToPay = annualBilling ? baseAnnualMonthlyPrice * 12 : baseMonthlyPrice;

  const whatsappMessage = encodeURIComponent(
    `Hello Admin! I have submitted payment for NEXORA ${selectedPlanForCheckout?.name || ''} plan.\n` +
    `Email: ${user?.email || ''}\n` +
    `Amount: $${priceToPay.toFixed(2)}\n` +
    `Method: ${paymentChannel}\n` +
    `TRX ID: ${trxId || '[Insert TRX]'}\n` +
    `Please approve my workspace.`
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <HiShieldCheck className="w-4 h-4" /> Official Enterprise Billing
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Plans & Workspace Quota
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Real-time telemetry on resource utilization, billing accounts, and multi-tenant plan upgrades.
          </p>
        </div>

        {/* Annual / Monthly Toggle */}
        <div className="flex items-center gap-3 p-1.5 bg-navy-900 border border-white/10 rounded-2xl w-fit">
          <button
            onClick={() => setAnnualBilling(false)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              !annualBilling 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnualBilling(true)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              annualBilling 
                ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-violet-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Annual</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* PENDING APPROVAL WARNING BANNER */}
      {isPendingApproval && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-navy-900 to-amber-500/10 border-2 border-amber-500/40 shadow-xl space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <HiClock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Payment Verification in Progress (Awaiting Admin Approval)</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PENDING APPROVAL
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Your payment for <strong className="text-white">{subscription?.planName || 'Selected Plan'}</strong> (TRX: <span className="font-mono text-amber-300">{subscription?.pendingRequest?.trxId || 'Submitted'}</span>) was sent to Admin (<strong>wa363969@gmail.com</strong>).
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  ⚠️ Your workspace will operate on Starter Free limits until approved by Admin.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/923404942126?text=${encodeURIComponent(
                `Hello Admin, I have submitted payment for ${subscription?.planName || 'my plan'}. Please verify and approve. Email: ${user?.email || ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-lg shadow-[#25D366]/20 transition-all hover:scale-105 shrink-0"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Verify on WhatsApp</span>
            </a>
          </div>
        </motion.div>
      )}

      {/* REJECTED ALERT BANNER */}
      {isRejected && (
        <div className="p-5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HiExclamationTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Payment Submission Not Verified</p>
              <p className="text-gray-300 text-[11px]">Reason: {subscription?.rejectReason || 'Invalid transaction ID or payment not received.'}</p>
            </div>
          </div>
          <button
            onClick={() => initiateUpgrade(plans[1] || plans[0])}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0"
          >
            Resubmit Payment
          </button>
        </div>
      )}

      {/* Real-time Utilization Meters */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HiSparkles className="w-5 h-5 text-yellow-400" /> Current Workspace Utilization
            </h2>
            <p className="text-xs text-gray-400">
              Active Tier: <span className="text-white font-semibold">{currentPlanObj.name}</span> • Status: <span className="text-emerald-400 font-semibold capitalize">{subscription?.status || 'Active'}</span>
            </p>
          </div>
          {currentPlanObj.id !== 'starter' && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="text-xs text-rose-400 hover:text-rose-300 transition"
            >
              Downgrade to Starter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Projects Meter */}
          <div className="p-4 rounded-xl bg-navy-950 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Active Projects</span>
              <span className="font-bold text-white">
                {projectCount} / {currentPlanObj.maxProjects === Infinity ? 'Unlimited' : currentPlanObj.maxProjects}
              </span>
            </div>
            <ProgressBar value={projectPct} size="md" />
            <p className="text-[11px] text-gray-500">
              {currentPlanObj.maxProjects === Infinity ? 'Unlimited project allocation' : `${Math.max(0, currentPlanObj.maxProjects - projectCount)} projects remaining`}
            </p>
          </div>

          {/* Tasks Meter */}
          <div className="p-4 rounded-xl bg-navy-950 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Total Backlog & Tasks</span>
              <span className="font-bold text-white">
                {taskCount} / {currentPlanObj.maxTasks === Infinity ? 'Unlimited' : currentPlanObj.maxTasks}
              </span>
            </div>
            <ProgressBar value={taskPct} size="md" />
            <p className="text-[11px] text-gray-500">
              {currentPlanObj.maxTasks === Infinity ? 'Unlimited cards & checklists' : `${Math.max(0, currentPlanObj.maxTasks - taskCount)} tasks remaining`}
            </p>
          </div>

          {/* AI Queries Meter */}
          <div className="p-4 rounded-xl bg-navy-950 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">AI Co-Pilot Generations</span>
              <span className="font-bold text-violet-400">
                {aiUsed} / {aiMax.toLocaleString()}
              </span>
            </div>
            <ProgressBar value={aiPct} size="md" />
            <p className="text-[11px] text-gray-500">
              {Math.max(0, aiMax - aiUsed).toLocaleString()} token generations left this cycle
            </p>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-black text-white">Choose Your Workspace Scale</h2>
          <p className="text-xs text-gray-400">All paid plans are verified directly through Admin's official accounts with zero middleman fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {plans.map((p) => {
            const isCurrent = subscription?.planId === p.id && !isPendingApproval;
            const price = annualBilling ? p.priceAnnual : p.priceMonthly;

            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  p.popular 
                    ? 'bg-gradient-to-b from-blue-900/30 to-navy-900 border-2 border-blue-500/50 shadow-2xl shadow-blue-500/10' 
                    : 'bg-navy-900/80 border border-white/10 hover:border-white/20'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">{p.name}</h3>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{p.badge}</span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">${price}</span>
                    <span className="text-xs text-gray-400 font-medium">/ member / month</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {annualBilling ? `Billed annually ($${price * 12}/year).` : 'Billed monthly, cancel anytime.'}
                  </p>

                  <div className="pt-4 border-t border-white/10 space-y-2.5">
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                        <HiCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5">
                  <button
                    onClick={() => {
                      if (isCurrent) return;
                      if (p.id === 'starter') {
                        setIsCancelModalOpen(true);
                      } else {
                        initiateUpgrade(p);
                      }
                    }}
                    disabled={isCurrent}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg ${
                      isCurrent
                        ? 'bg-white/10 text-gray-400 cursor-default border border-white/10'
                        : p.popular
                        ? 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white shadow-blue-500/25 hover:scale-[1.02]'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    {isCurrent ? 'Current Active Plan' : (p.id === 'starter' ? 'Downgrade to Starter' : `Upgrade to ${p.name}`)}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Real Invoices & Platform Billing History Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HiDocumentText className="w-5 h-5 text-blue-400" /> Billing History & Official Tax Receipts
            </h2>
            <p className="text-xs text-gray-400">Download official receipts, inspect gateway transaction IDs, or request refunds.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Mode: <strong className="uppercase">{gatewayConfig.environment}</strong>
            </span>
          </div>
        </div>

        {(() => {
          // Combine subscription invoices and platformTransactions
          const combined = [
            ...platformTransactions.map(t => ({
              id: t.id,
              date: new Date(t.date).toLocaleDateString(),
              plan: t.planName || t.planId,
              amount: `${t.currency === 'PKR' ? 'PKR ' : '$'}${t.amount}`,
              status: t.status,
              trxId: t.trxId,
              gateway: t.gateway,
              isRefundable: t.isRefundable,
              raw: t
            })),
            ...(subscription?.invoices || []).map(inv => ({
              ...inv,
              gateway: inv.gateway || 'raast',
              isRefundable: false
            }))
          ];

          // Deduplicate by ID
          const seen = new Set();
          const list = combined.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });

          if (list.length === 0) {
            return (
              <p className="text-xs text-gray-500 italic py-4">No billing records found yet. Invoices appear here once payments are approved or processed through gateways.</p>
            );
          }

          return (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Invoice / TRX</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Plan / Tier</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {list.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{inv.id}</div>
                        {inv.trxId && <div className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">{inv.trxId}</div>}
                      </td>
                      <td className="py-3 px-4 text-gray-400">{inv.date}</td>
                      <td className="py-3 px-4 text-white font-medium">{inv.plan}</td>
                      <td className="py-3 px-4 font-bold text-white">{inv.amount}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-gray-300 border border-white/10">
                          {inv.gateway || 'Raast'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'paid' || inv.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : inv.status === 'refunded'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {inv.status === 'paid' || inv.status === 'Paid' ? '✓ Paid' : inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsReceiptOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[11px] font-semibold transition"
                          >
                            <HiDocumentText className="w-3.5 h-3.5 text-blue-400" />
                            <span>Receipt</span>
                          </button>
                          {inv.isRefundable && inv.status !== 'refunded' && (
                            <button
                              onClick={() => {
                                setSelectedTxnForRefund(inv);
                                setIsRefundModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-semibold transition"
                            >
                              <HiArrowUturnLeft className="w-3 h-3" />
                              <span>Refund</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* ENTERPRISE MULTI-GATEWAY BILLING CHECKOUT MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={`Upgrade to ${selectedPlanForCheckout?.name || 'Workspace Tier'}`}
      >
        <form onSubmit={handleSubmitPayment} className="space-y-5">
          {/* Amount Due Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 via-navy-900 to-violet-900/40 border border-blue-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Amount Due</p>
              <h3 className="text-2xl font-black text-white">${priceToPay.toFixed(2)}</h3>
              <p className="text-[11px] text-gray-400">
                {selectedPlanForCheckout?.name} Tier • {annualBilling ? 'Annual Billing (20% Off)' : 'Monthly Plan'}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${
                gatewayConfig.environment === 'sandbox'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {gatewayConfig.environment} Gateway
              </span>
            </div>
          </div>

          {/* Gateway Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'stripe', label: 'Stripe', icon: FaStripe, color: 'text-indigo-400' },
                { id: 'paypal', label: 'PayPal', icon: FaPaypal, color: 'text-sky-400' },
                { id: 'safepay', label: 'Safepay', icon: HiBolt, color: 'text-teal-400' },
                { id: 'jazzcash', label: 'JazzCash', icon: HiDevicePhoneMobile, color: 'text-red-400' },
                { id: 'easypaisa', label: 'Easypaisa', icon: HiDevicePhoneMobile, color: 'text-emerald-400' },
                { id: 'raast', label: 'Raast / Bank', icon: HiBuildingLibrary, color: 'text-purple-400' }
              ].map(gw => {
                const Icon = gw.icon;
                const isSelected = activeGateway === gw.id;
                return (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setActiveGateway(gw.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/15'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${gw.color}`} />
                    <span className="text-[11px] font-bold leading-tight">{gw.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GATEWAY 1: STRIPE */}
          {activeGateway === 'stripe' && (
            <div className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FaStripe className="w-5 h-5 text-indigo-400" /> Credit & Debit Card (Powered by Stripe)
                </span>
                <button
                  type="button"
                  onClick={handleFillTestCard}
                  className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[10px] font-bold border border-indigo-500/30"
                >
                  ⚡ Fill Sandbox Test Card
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value)}
                  className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">CVC / CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* GATEWAY 2: PAYPAL */}
          {activeGateway === 'paypal' && (
            <div className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FaPaypal className="w-5 h-5 text-sky-400" /> PayPal Express Checkout
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Instant Authorization
                </span>
              </div>
              <p className="text-xs text-gray-300">
                You will be charged <strong className="text-white">${priceToPay.toFixed(2)} USD</strong> directly to your linked PayPal wallet or debit balance.
              </p>
              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 flex items-center gap-2">
                <HiShieldCheck className="w-4 h-4 shrink-0" />
                <span>Buyer Protection active. Recurring subscription can be canceled anytime from NEXORA.</span>
              </div>
            </div>
          )}

          {/* GATEWAY 3: SAFEPAY */}
          {activeGateway === 'safepay' && (
            <div className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HiBolt className="w-4 h-4 text-teal-400" /> Safepay Checkout (PKR)
                </span>
                <span className="text-xs font-mono font-bold text-teal-300">
                  ≈ PKR {(priceToPay * 278).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Supports Pakistani Visa, MasterCard, and PayPak digital checkouts with 3D Secure OTP verification.
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Mobile Phone / Account Number</label>
                <input
                  type="text"
                  value={walletPhone}
                  onChange={e => setWalletPhone(e.target.value)}
                  className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>
          )}

          {/* GATEWAY 4: JAZZCASH */}
          {activeGateway === 'jazzcash' && (
            <div className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HiDevicePhoneMobile className="w-4 h-4 text-red-400" /> JazzCash Mobile Wallet
                </span>
                <span className="text-xs font-mono font-bold text-red-300">
                  ≈ PKR {(priceToPay * 278).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">JazzCash Mobile Number</label>
                  <input
                    type="text"
                    value={walletPhone}
                    onChange={e => setWalletPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Account MPIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={walletMpin}
                    onChange={e => setWalletMpin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400">
                You will receive a USSD push confirmation on your Jazz mobile handset.
              </p>
            </div>
          )}

          {/* GATEWAY 5: EASYPAISA */}
          {activeGateway === 'easypaisa' && (
            <div className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HiDevicePhoneMobile className="w-4 h-4 text-emerald-400" /> Easypaisa Direct Checkout
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  ≈ PKR {(priceToPay * 278).toLocaleString()}
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Easypaisa Mobile Number</label>
                <input
                  type="text"
                  value={walletPhone}
                  onChange={e => setWalletPhone(e.target.value)}
                  placeholder="03401234567"
                  className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                📲 An in-app push notification or OTP will be dispatched to approve this transaction.
              </div>
            </div>
          )}

          {/* GATEWAY 6: RAAST / IBFT (MANUAL ADMIN CONFIRMATION) */}
          {activeGateway === 'raast' && (
            <div className="space-y-4">
              {/* Admin Official Payment Receiving Accounts */}
              <div className="p-4 rounded-xl bg-navy-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HiBuildingLibrary className="w-4 h-4 text-blue-400" /> Admin Receiving Accounts
                  </span>
                  <span className="text-[10px] text-gray-500">Verified by WA Admin</span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Bank / Raast */}
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Bank Transfer / Raast (IBFT)</p>
                      <p className="text-gray-400 text-[11px] font-mono">Raast / Account No: <strong className="text-blue-300">{adminBilling?.accountNumber || '03404942126'}</strong></p>
                      <p className="text-gray-500 text-[10px]">Title: {adminBilling?.accountTitle || 'WA Admin / NEXORA Official'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(adminBilling?.accountNumber || '03404942126', 'Raast/Account Number')}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-blue-400 font-semibold"
                    >
                      Copy
                    </button>
                  </div>

                  {/* EasyPaisa / JazzCash */}
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">EasyPaisa & JazzCash</p>
                      <p className="text-gray-400 text-[11px] font-mono">Mobile Wallet: <strong className="text-emerald-300">{adminBilling?.easypaisa || '03404942126'}</strong></p>
                      <p className="text-gray-500 text-[10px]">Title: {adminBilling?.accountTitle || 'WA Admin'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(adminBilling?.easypaisa || '03404942126', 'EasyPaisa/JazzCash Number')}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-emerald-400 font-semibold"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  Transfer the exact amount (${priceToPay.toFixed(2)}) using any of the above methods, then enter your transaction details below.
                </p>
              </div>

              {/* Payment Proof Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Sender Account Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ali Khan"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                      required={activeGateway === 'raast'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Sender Account / Mobile #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0300-1234567"
                      value={senderAccount}
                      onChange={e => setSenderAccount(e.target.value)}
                      className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Transaction ID / Reference Number (TRX ID) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRX-982410294 or Bank Ref #"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-gray-500 outline-none focus:border-blue-500"
                    required={activeGateway === 'raast'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Optional Notes for Admin
                  </label>
                  <input
                    type="text"
                    placeholder="Any special billing instructions or date of transfer"
                    value={paymentNotes}
                    onChange={e => setPaymentNotes(e.target.value)}
                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <HiArrowPath className="w-4 h-4 animate-spin" />
                  <span>Processing Payment via {activeGateway.toUpperCase()}...</span>
                </>
              ) : activeGateway === 'raast' ? (
                <>
                  <HiPaperAirplane className="w-4 h-4" />
                  <span>Submit Payment for Admin Approval</span>
                </>
              ) : (
                <>
                  <HiShieldCheck className="w-4 h-4" />
                  <span>Pay ${priceToPay.toFixed(2)} with {activeGateway.toUpperCase()}</span>
                </>
              )}
            </button>

            {activeGateway === 'raast' && (
              <a
                href={`https://wa.me/923404942126?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 shrink-0"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Send Slip on WhatsApp</span>
              </a>
            )}
          </div>

          <p className="text-[10px] text-gray-500 text-center">
            🔒 256-bit SSL encrypted. Transactions comply with global PCI-DSS Level 1 standards.
          </p>
        </form>
      </Modal>

      {/* Refund Request Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Request Subscription Refund"
      >
        <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs text-gray-300">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
            <HiExclamationTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <p>
              Eligible payments can be refunded within 14 days of billing. Approved refunds will revert your workspace back to the Free Starter tier.
            </p>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Transaction to Refund</label>
            <div className="p-3 rounded-xl bg-navy-950 border border-white/10 font-mono text-white flex justify-between">
              <span>{selectedTxnForRefund?.id}</span>
              <span className="text-emerald-400 font-bold">{selectedTxnForRefund?.amount}</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Reason for Refund</label>
            <select
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
              className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="Plan upgrade adjustment requested">Plan upgrade adjustment requested</option>
              <option value="Purchased wrong subscription tier">Purchased wrong subscription tier</option>
              <option value="Features do not fit my current requirements">Features do not fit my current requirements</option>
              <option value="Accidental double billing">Accidental double billing</option>
              <option value="Other billing query">Other billing query</option>
            </select>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRefundModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingRefund}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/25 flex items-center gap-1.5"
            >
              <HiArrowUturnLeft className="w-4 h-4" />
              <span>{isSubmittingRefund ? 'Submitting...' : 'Submit Refund Request'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Receipt Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Official Tax Receipt"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs text-gray-300">
            <div className="flex justify-between items-start pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-extrabold text-white">NEXORA Technologies Inc.</h3>
                <p className="text-gray-400">Enterprise AI Productivity & Cloud Solutions</p>
                <p className="text-gray-500 text-[11px]">Admin Contact: wa363969@gmail.com • WhatsApp: 03404942126</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-white font-bold">{selectedInvoice.id}</span>
                <p className="text-gray-400">{selectedInvoice.date}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  APPROVED & PAID
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold">Billed To:</p>
              <p className="font-bold text-white mt-0.5">{user?.name || 'Workspace Account'}</p>
              <p className="text-gray-400">{user?.email || 'user@nexora.io'}</p>
            </div>

            <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-2">
              <div className="flex justify-between font-semibold text-white">
                <span>{selectedInvoice.plan}</span>
                <span>{selectedInvoice.amount}</span>
              </div>
              {selectedInvoice.trxId && (
                <div className="flex justify-between text-gray-400 text-[11px] font-mono">
                  <span>Transaction ID (TRX):</span>
                  <span className="text-blue-300">{selectedInvoice.trxId}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex justify-between font-extrabold text-white text-sm">
                <span>Total Paid</span>
                <span className="text-emerald-400">{selectedInvoice.amount}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-1.5"
              >
                <HiPrinter className="w-4 h-4 text-blue-400" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Downgrade / Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Downgrade to Free Starter"
      >
        <div className="space-y-4 text-xs text-gray-300">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
            <HiExclamationTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <p>
              Downgrading will revert your workspace to the <strong>Starter Free Tier</strong> (5 projects limit, 50 tasks limit, 100 AI queries/month).
            </p>
          </div>
          <p>
            Your existing data will remain completely safe, but you won't be able to add new projects beyond the 5-project quota until you upgrade again.
          </p>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15"
            >
              Keep My Active Plan
            </button>
            <button
              onClick={handleConfirmCancel}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-600/25"
            >
              Confirm Downgrade
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
