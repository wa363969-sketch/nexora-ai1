import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiShieldCheck, 
  HiUsers, 
  HiCreditCard, 
  HiCpuChip, 
  HiServerStack, 
  HiTrash, 
  HiCheckBadge,
  HiExclamationCircle,
  HiWrenchScrewdriver,
  HiEye,
  HiFolder,
  HiCheckCircle,
  HiXMark,
  HiMagnifyingGlass,
  HiArrowPath,
  HiArrowTrendingUp,
  HiArrowTopRightOnSquare,
  HiSparkles,
  HiClock,
  HiBuildingLibrary,
  HiDevicePhoneMobile,
  HiCheck,
  HiXCircle,
  HiArrowRightOnRectangle,
  HiTv,
  HiAcademicCap,
  HiKey,
  HiArrowUturnLeft,
  HiBolt
} from 'react-icons/hi2';
import { FaWhatsapp, FaStripe, FaPaypal, FaGoogle, FaMicrosoft, FaGithub } from 'react-icons/fa';
import { 
  getMembers, 
  getProjects, 
  getTasks, 
  getAllClientWorkspaces, 
  getClientWorkspaceDetails,
  updateClientPlanByAdmin,
  getPendingSubscriptions,
  approveSubscriptionPayment,
  rejectSubscriptionPayment,
  getAdminBillingConfig,
  saveAdminBillingConfig,
  impersonateClient
} from '../services/dataService';
import {
  getGatewayConfig,
  saveGatewayConfig,
  getPlatformTransactions,
  getRefundRequests,
  processRefund
} from '../services/paymentGatewayService';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Pending Approvals', 'Client Workspaces', 'User Governance', 'Billing & Controls'];

const PLAN_BADGES = {
  starter: { label: 'Starter Free', bg: 'bg-gray-500/15 text-gray-300 border-gray-500/30' },
  pro: { label: 'Pro Tier', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  enterprise: { label: 'Enterprise SLA', bg: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  pending_approval: { label: 'Awaiting Approval', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [videoOrders, setVideoOrders] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetail, setClientDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Billing Config state
  const [billingConfig, setBillingConfig] = useState(getAdminBillingConfig());

  // Multi-Gateway, OAuth and Refund states
  const [gatewayConfig, setGatewayConfig] = useState(getGatewayConfig());
  const [refundRequests, setRefundRequests] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  // System settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [aiRateLimit, setAiRateLimit] = useState('60');

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [mList, pList, tList] = await Promise.all([getMembers(), getProjects(), getTasks()]);
      setUsers(mList);
      setProjects(pList);
      setTasks(tList);
      
      const clientWorkspaces = getAllClientWorkspaces();
      setClients(clientWorkspaces);

      const pending = getPendingSubscriptions();
      setPendingRequests(pending);

      const pVideoOrders = JSON.parse(localStorage.getItem('nexora_pending_video_orders') || '[]');
      setVideoOrders(pVideoOrders);

      setBillingConfig(getAdminBillingConfig());
      setGatewayConfig(getGatewayConfig());
      setRefundRequests(getRefundRequests());
      setAllTransactions(getPlatformTransactions());
    } catch (e) {
      toast.error('Failed to load admin telemetry');
    } finally {
      setLoading(false);
    }
  }

  function handleSaveGatewaySettings() {
    const success = saveGatewayConfig(gatewayConfig);
    if (success) {
      toast.success('Payment Gateway and OAuth 2.0 settings saved successfully!');
    } else {
      toast.error('Failed to save gateway configuration');
    }
  }

  function handleApproveRefund(refundId) {
    const success = processRefund(refundId, true);
    if (success) {
      toast.success('Refund approved! Workspace reverted to Starter tier and transaction updated.');
      loadAdminData();
    } else {
      toast.error('Failed to process refund');
    }
  }

  function handleRejectRefund(refundId) {
    const success = processRefund(refundId, false);
    if (success) {
      toast.success('Refund request rejected.');
      loadAdminData();
    } else {
      toast.error('Failed to reject refund request');
    }
  }

  function handleApprove(requestId) {
    const success = approveSubscriptionPayment(requestId);
    if (success) {
      toast.success('Subscription approved and activated! Client quota unlocked.');
      loadAdminData();
    } else {
      toast.error('Failed to approve subscription');
    }
  }

  function handleReject(requestId) {
    const reason = prompt('Please enter rejection reason (e.g., Transaction ID not received):', 'Transaction not found in bank records');
    if (!reason) return;
    const success = rejectSubscriptionPayment(requestId, reason);
    if (success) {
      toast.success('Subscription request rejected.');
      loadAdminData();
    } else {
      toast.error('Failed to reject subscription');
    }
  }

  function handleApproveVideoOrder(orderId) {
    try {
      const orders = JSON.parse(localStorage.getItem('nexora_pending_video_orders') || '[]');
      const updated = orders.map(o => o.orderId === orderId ? { ...o, status: 'approved' } : o);
      localStorage.setItem('nexora_pending_video_orders', JSON.stringify(updated));
      const targetOrder = orders.find(o => o.orderId === orderId);
      if (targetOrder) {
        localStorage.setItem('nexora_video_guide_access', JSON.stringify({ ...targetOrder, status: 'approved' }));
      }
      setVideoOrders(updated);
      toast.success(`Video Guide access approved for ${targetOrder?.name || targetOrder?.email || 'user'}!`);
    } catch {
      toast.error('Failed to approve video order');
    }
  }

  function handleRejectVideoOrder(orderId) {
    try {
      const orders = JSON.parse(localStorage.getItem('nexora_pending_video_orders') || '[]');
      const updated = orders.map(o => o.orderId === orderId ? { ...o, status: 'rejected' } : o);
      localStorage.setItem('nexora_pending_video_orders', JSON.stringify(updated));
      setVideoOrders(updated);
      toast.success('Video order marked rejected.');
    } catch {
      toast.error('Failed to reject order');
    }
  }

  function handleInspect(client) {
    setSelectedClient(client);
    const detail = getClientWorkspaceDetails(client.scope || client.email);
    setClientDetail(detail);
  }

  function handleAdminUpgrade(email, planId) {
    const success = updateClientPlanByAdmin(email, planId);
    if (success) {
      toast.success(`Client plan manually upgraded to ${planId.toUpperCase()}!`);
      loadAdminData();
      if (selectedClient && selectedClient.email === email) {
        setSelectedClient(prev => ({ ...prev, planId, planName: planId === 'enterprise' ? 'Enterprise SLA' : 'Pro Tier' }));
      }
    } else {
      toast.error('Failed to update plan');
    }
  }

  function handleImpersonate(email) {
    if (confirm(`Switch into client workspace for ${email}? You can switch back to Admin anytime.`)) {
      impersonateClient(email);
    }
  }

  function handleSaveBilling() {
    const success = saveAdminBillingConfig(billingConfig);
    if (success) {
      toast.success('Admin billing accounts updated successfully!');
    } else {
      toast.error('Failed to save billing accounts');
    }
  }

  function handleRoleToggle(userId) {
    setUsers(prev => prev.map(u => {
      if (u.$id === userId) {
        const nextRole = u.role.includes('Admin') ? 'Member' : 'Admin';
        toast.success(`User role adjusted to ${nextRole}`);
        return { ...u, role: nextRole };
      }
      return u;
    }));
  }

  function handleSuspend(userId) {
    setUsers(prev => prev.map(u => {
      if (u.$id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        toast.success(`User status set to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  }

  function formatDate(iso) {
    if (!iso) return 'Recent';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  }

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlan = planFilter === 'all' || c.planId === planFilter || (planFilter === 'pending' && c.status === 'pending_approval');
    return matchesSearch && matchesPlan;
  });

  const totalClientsCount = clients.filter(c => !c.isAdmin).length;
  const totalAiQueriesAll = clients.reduce((acc, c) => acc + (c.aiQueriesUsed || 0), 0);
  const totalAllProjects = clients.reduce((acc, c) => acc + (c.totalProjects || 0), 0);
  const totalAllTasks = clients.reduce((acc, c) => acc + (c.totalTasks || 0), 0);
  const pendingCount = pendingRequests.filter(r => r.status === 'pending_approval').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-2">
            <HiShieldCheck className="w-4 h-4" /> Root Owner Active: wa363969@gmail.com
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Executive Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Approval-based billing governance, client workspace inspection, and multi-tenant telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <HiArrowPath className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1.5 p-1.5 bg-navy-900/90 rounded-2xl border border-white/10 w-fit overflow-x-auto">
        {TABS.map(tab => {
          const isPendingTab = tab === 'Pending Approvals';
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== 'Client Workspaces') setSelectedClient(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab}</span>
              {isPendingTab && pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-navy-950 animate-pulse">
                  {pendingCount} NEW
                </span>
              )}
              {tab === 'Client Workspaces' && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold">
                  {clients.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === 'Overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Pending Approval Callout Banner if any */}
          {pendingCount > 0 && (
            <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <HiClock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {pendingCount} Client Subscription Payment{pendingCount > 1 ? 's' : ''} Awaiting Your Approval!
                  </h4>
                  <p className="text-xs text-gray-300">
                    Clients cannot use upgraded plans until you verify their TRX ID and click approve.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('Pending Approvals')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-black text-xs transition-colors shrink-0"
              >
                Review & Approve Now →
              </button>
            </div>
          )}

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="uppercase font-bold tracking-wider">Total Clients</span>
                <HiUsers className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{totalClientsCount}</div>
              <p className="text-[11px] text-emerald-400 font-medium">Multi-tenant isolated</p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="uppercase font-bold tracking-wider">Active Projects</span>
                <HiServerStack className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{totalAllProjects}</div>
              <p className="text-[11px] text-gray-400">{totalAllTasks} total client tasks</p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="uppercase font-bold tracking-wider">AI Queries Consumed</span>
                <HiCpuChip className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{totalAiQueriesAll.toLocaleString()}</div>
              <p className="text-[11px] text-gray-400">Tokens across all workspaces</p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="uppercase font-bold tracking-wider">Pending Approvals</span>
                <HiClock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 mb-1">{pendingCount}</div>
              <p className="text-[11px] text-gray-400">Require manual admin verification</p>
            </div>
          </div>

          {/* Quick Client Workspaces Overview */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HiUsers className="w-4 h-4 text-blue-400" /> Live Client Workspaces Overview
                </h3>
                <p className="text-xs text-gray-400">Recent client activity, plan status, and quick inspection</p>
              </div>
              <button
                onClick={() => setActiveTab('Client Workspaces')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                View Full Directory →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.slice(0, 4).map(client => (
                <div
                  key={client.email}
                  onClick={() => {
                    setActiveTab('Client Workspaces');
                    handleInspect(client);
                  }}
                  className="p-4 rounded-xl bg-navy-950/70 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        client.isAdmin ? 'bg-violet-500/20 text-violet-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {(client.name || client.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                          {client.name || client.email}
                        </p>
                        <p className="text-[11px] text-gray-500">{client.email}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      PLAN_BADGES[client.planId]?.bg || PLAN_BADGES.starter.bg
                    }`}>
                      {client.planName}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                    <div>
                      <span className="text-gray-500">Projects:</span>{' '}
                      <strong className="text-white">{client.totalProjects}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Tasks:</span>{' '}
                      <strong className="text-emerald-400">{client.doneTasks}/{client.totalTasks}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">AI Tokens:</span>{' '}
                      <strong className="text-violet-400">{client.aiQueriesUsed}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PENDING SUBSCRIPTION APPROVALS */}
      {/* ========================================================= */}
      {activeTab === 'Pending Approvals' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HiClock className="w-5 h-5 text-amber-400" />
                  Subscription Payment Verification Queue ({pendingRequests.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Verify the client's Transaction ID (TRX) in your bank account, EasyPaisa, or JazzCash before unlocking their plan.
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                <HiCheckBadge className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-300">All payment requests are cleared!</p>
                <p className="text-gray-500 mt-1">When clients submit payment proof on the billing page, they will appear here for verification.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-950/60 border-b border-white/10 text-gray-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Plan & Amount</th>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Sender Info & TRX ID</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {pendingRequests.map(r => {
                      const isApproved = r.status === 'approved';
                      const isRejected = r.status === 'rejected';

                      return (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{r.clientName}</div>
                            <div className="text-gray-400 font-mono text-[11px]">{r.clientEmail}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{r.planName}</div>
                            <div className="text-emerald-400 font-mono font-bold">{r.amount} ({r.billingCycle})</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-gray-300">
                              {r.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono text-blue-300 font-bold">{r.trxId}</div>
                            <div className="text-[11px] text-gray-400">By: {r.senderName} ({r.senderAccount})</div>
                            {r.notes && <div className="text-[10px] text-gray-500 italic">"{r.notes}"</div>}
                          </td>

                          <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                            {formatDate(r.submittedAt)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {isApproved ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                                ✓ Approved
                              </span>
                            ) : isRejected ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                                ✗ Rejected
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`https://wa.me/923404942126?text=${encodeURIComponent(
                                    `Hello, verifying your Nexora payment: TRX ${r.trxId} for ${r.planName}.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
                                  title="WhatsApp"
                                >
                                  <FaWhatsapp className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleReject(r.id)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold transition-colors"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApprove(r.id)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-colors"
                                >
                                  Approve & Activate
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Video Masterclass Approvals Card */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HiTv className="w-5 h-5 text-violet-400" />
                  Video Masterclass Orders ({videoOrders.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Customers who submitted PKR 1,499 for lifetime access to the NEXORA Video Guide.
                </p>
              </div>
            </div>

            {videoOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                <HiAcademicCap className="w-8 h-8 text-violet-400/50 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-300">No pending video guide orders</p>
                <p className="text-gray-500 mt-1">Orders placed on the /video-guide page will appear here for verification.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-medium">
                      <th className="pb-3">Order ID & Date</th>
                      <th className="pb-3">User & Name</th>
                      <th className="pb-3">TRX ID</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {videoOrders.map((o) => (
                      <tr key={o.orderId} className="hover:bg-white/[0.02]">
                        <td className="py-3">
                          <div className="font-mono text-white text-xs">{o.orderId}</div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(o.submittedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-white font-bold">{o.name || 'Anonymous'}</div>
                          <div className="text-gray-400 text-[11px]">{o.email}</div>
                        </td>
                        <td className="py-3 font-mono text-amber-300 font-bold tracking-wide">
                          {o.trxId}
                        </td>
                        <td className="py-3 uppercase text-gray-300 font-semibold">
                          {o.paymentMethod}
                        </td>
                        <td className="py-3 font-bold text-white">
                          PKR {o.amount}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.status === 'approved' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : o.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {o.status === 'approved' ? 'Active ✓' : o.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {o.status === 'approved' ? (
                            <span className="text-emerald-400 text-[11px] font-semibold">Unlocked ✓</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRejectVideoOrder(o.orderId)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleApproveVideoOrder(o.orderId)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-colors cursor-pointer"
                              >
                                Approve Access
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CLIENT WORKSPACES VISUALIZATION */}
      {/* ========================================================= */}
      {activeTab === 'Client Workspaces' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Inspection Drawer / View Modal */}
          <AnimatePresence>
            {selectedClient && clientDetail && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-2xl bg-gradient-to-b from-navy-900 to-navy-950 border-2 border-blue-500/30 shadow-2xl space-y-6"
              >
                {/* Drawer Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                      {(selectedClient.name || selectedClient.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-white">{selectedClient.name || selectedClient.email}</h2>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                          PLAN_BADGES[selectedClient.planId]?.bg || PLAN_BADGES.starter.bg
                        }`}>
                          {selectedClient.planName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{selectedClient.email} • Company: {selectedClient.company || 'Private Workspace'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleImpersonate(selectedClient.email)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors flex items-center gap-1.5"
                    >
                      <HiArrowRightOnRectangle className="w-4 h-4" />
                      Login as Client
                    </button>
                    <button
                      onClick={() => handleAdminUpgrade(selectedClient.email, 'pro')}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold border border-blue-500/30 transition-colors"
                    >
                      Grant Pro
                    </button>
                    <button
                      onClick={() => handleAdminUpgrade(selectedClient.email, 'enterprise')}
                      className="px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs font-bold border border-violet-500/30 transition-colors"
                    >
                      Grant Enterprise
                    </button>
                    <button
                      onClick={() => { setSelectedClient(null); setClientDetail(null); }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Close"
                    >
                      <HiXMark className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Inspected Client Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-navy-950 border border-white/5">
                    <div className="text-xs text-gray-400 mb-1">Projects</div>
                    <div className="text-xl font-black text-white">{clientDetail.projects.length}</div>
                    <p className="text-[10px] text-blue-400 font-medium">In client workspace</p>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-950 border border-white/5">
                    <div className="text-xs text-gray-400 mb-1">Total Tasks</div>
                    <div className="text-xl font-black text-white">{clientDetail.tasks.length}</div>
                    <p className="text-[10px] text-emerald-400 font-medium">
                      {clientDetail.tasks.filter(t => t.status === 'done').length} Completed
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-950 border border-white/5">
                    <div className="text-xs text-gray-400 mb-1">AI Tokens Used</div>
                    <div className="text-xl font-black text-violet-400">{selectedClient.aiQueriesUsed}</div>
                    <p className="text-[10px] text-gray-400">Limit: {selectedClient.maxAiQueries || 100}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-950 border border-white/5">
                    <div className="text-xs text-gray-400 mb-1">Workspace Status</div>
                    <div className="text-xl font-black text-emerald-400 capitalize">{selectedClient.status}</div>
                    <p className="text-[10px] text-gray-400">Active session</p>
                  </div>
                </div>

                {/* Projects & Tasks Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Client Projects */}
                  <div className="p-4 rounded-xl bg-navy-950 border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <HiFolder className="w-4 h-4 text-blue-400" />
                      Client Projects ({clientDetail.projects.length})
                    </h4>
                    {clientDetail.projects.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">No projects in this workspace yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {clientDetail.projects.map(p => (
                          <div key={p.$id || p.name} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#3b82f6' }} />
                              <div>
                                <p className="text-xs font-bold text-white">{p.name}</p>
                                <p className="text-[10px] text-gray-500">{p.category || 'General'}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Client Tasks */}
                  <div className="p-4 rounded-xl bg-navy-950 border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-emerald-400" />
                      Client Tasks ({clientDetail.tasks.length})
                    </h4>
                    {clientDetail.tasks.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">No tasks recorded yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {clientDetail.tasks.map(t => (
                          <div key={t.$id || t.title} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                            <div className="truncate max-w-[65%]">
                              <p className={`text-xs font-medium ${t.status === 'done' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                {t.title}
                              </p>
                              <p className="text-[10px] text-gray-500">{t.projectName || 'Project Task'}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                t.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                                t.priority === 'high' ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-500/10 text-gray-400'
                              }`}>
                                {t.priority}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                t.status === 'done' ? 'bg-emerald-500/15 text-emerald-400' :
                                t.status === 'in-progress' ? 'bg-blue-500/15 text-blue-400' : 'bg-gray-500/10 text-gray-400'
                              }`}>
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search clients by name, email, or company..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900/90 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {['all', 'enterprise', 'pro', 'starter', 'pending'].map(pf => (
                <button
                  key={pf}
                  onClick={() => setPlanFilter(pf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    planFilter === pf
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {pf === 'all' ? 'All Clients' : pf === 'pending' ? '⏳ Pending Approval' : pf}
                </button>
              ))}
            </div>
          </div>

          {/* All Clients Master Visualization Table */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/60 border-b border-white/10 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Client / Tenant</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Projects</th>
                  <th className="py-3 px-4">Tasks Progress</th>
                  <th className="py-3 px-4">AI Usage</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredClients.map(c => (
                  <tr key={c.email} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          c.isAdmin ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {(c.name || c.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {c.name || c.email}
                            {c.isAdmin && <span className="text-[10px] text-violet-400 font-normal">(Admin Owner)</span>}
                          </div>
                          <div className="text-gray-500 text-[11px] font-mono">{c.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                        c.status === 'pending_approval'
                          ? PLAN_BADGES.pending_approval.bg
                          : (PLAN_BADGES[c.planId]?.bg || PLAN_BADGES.starter.bg)
                      }`}>
                        {c.status === 'pending_approval' ? '⏳ Pending Approval' : c.planName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{c.totalProjects}</div>
                      <div className="text-[10px] text-gray-500">{c.activeProjects || 0} active</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${c.totalTasks > 0 ? (c.doneTasks / c.totalTasks) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-300 font-mono">
                          {c.doneTasks}/{c.totalTasks}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-violet-300 font-bold font-mono">{c.aiQueriesUsed}</div>
                      <div className="text-[10px] text-gray-500">queries used</div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {formatDate(c.lastActivity)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleInspect(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/20 transition-all hover:scale-105"
                          title="Inspect Workspace"
                        >
                          <HiEye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                        {!c.isAdmin && (
                          <button
                            onClick={() => handleImpersonate(c.email)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all hover:scale-105"
                            title="Test as this client"
                          >
                            <HiArrowRightOnRectangle className="w-3.5 h-3.5" />
                            Login
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: USER GOVERNANCE */}
      {/* ========================================================= */}
      {activeTab === 'User Governance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Platform Member Roles & Permissions</h3>
              <p className="text-xs text-gray-400">Promote team members to administrative scope or suspend access.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-950/60 border-b border-white/10 text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {users.map(u => (
                    <tr key={u.$id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-gray-500 text-[11px]">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role.includes('Admin') 
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                            : 'bg-white/5 text-gray-300 border border-white/10'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRoleToggle(u.$id)}
                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 text-xs text-blue-400 font-semibold"
                          >
                            {u.role.includes('Admin') ? 'Demote to Member' : 'Promote to Admin'}
                          </button>
                          <button
                            onClick={() => handleSuspend(u.$id)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold ${
                              u.status === 'active'
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: BILLING & PLATFORM CONTROLS */}
      {/* ========================================================= */}
      {activeTab === 'Billing & Controls' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* 1. Payment Gateways API Configuration */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HiCreditCard className="w-5 h-5 text-blue-400" /> Payment Gateways & API Credentials
                </h3>
                <p className="text-xs text-gray-400">
                  Configure real merchant API keys, webhooks, and sandbox/live environments for global & Pakistani gateways.
                </p>
              </div>

              {/* Environment Toggle */}
              <div className="flex items-center gap-2 p-1 bg-navy-950 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGatewayConfig({ ...gatewayConfig, environment: 'sandbox' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    gatewayConfig.environment === 'sandbox'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sandbox Mode
                </button>
                <button
                  type="button"
                  onClick={() => setGatewayConfig({ ...gatewayConfig, environment: 'live' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    gatewayConfig.environment === 'live'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Live Production
                </button>
              </div>
            </div>

            {/* Gateway API Keys Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Stripe */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <FaStripe className="w-6 h-6 text-indigo-400" /> Stripe Payments
                  </span>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.activeGateways?.stripe ?? true}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      activeGateways: { ...gatewayConfig.activeGateways, stripe: e.target.checked }
                    })}
                    className="rounded bg-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Publishable Key</label>
                  <input
                    type="text"
                    value={gatewayConfig.stripe?.publishableKey || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      stripe: { ...gatewayConfig.stripe, publishableKey: e.target.value }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    placeholder="pk_test_..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Secret Key</label>
                  <input
                    type="password"
                    value={gatewayConfig.stripe?.secretKey || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      stripe: { ...gatewayConfig.stripe, secretKey: e.target.value }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    placeholder="sk_test_..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Webhook Secret</label>
                  <input
                    type="password"
                    value={gatewayConfig.stripe?.webhookSecret || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      stripe: { ...gatewayConfig.stripe, webhookSecret: e.target.value }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    placeholder="whsec_..."
                  />
                </div>
              </div>

              {/* PayPal */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <FaPaypal className="w-5 h-5 text-sky-400" /> PayPal Commerce
                  </span>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.activeGateways?.paypal ?? true}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      activeGateways: { ...gatewayConfig.activeGateways, paypal: e.target.checked }
                    })}
                    className="rounded bg-white/10 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Client ID</label>
                  <input
                    type="text"
                    value={gatewayConfig.paypal?.clientId || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      paypal: { ...gatewayConfig.paypal, clientId: e.target.value }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Client Secret</label>
                  <input
                    type="password"
                    value={gatewayConfig.paypal?.clientSecret || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      paypal: { ...gatewayConfig.paypal, clientSecret: e.target.value }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Safepay */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <HiBolt className="w-5 h-5 text-teal-400" /> Safepay PK (Cards & PayPak)
                  </span>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.activeGateways?.safepay ?? true}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      activeGateways: { ...gatewayConfig.activeGateways, safepay: e.target.checked }
                    })}
                    className="rounded bg-white/10 text-teal-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">API Key</label>
                  <input
                    type="text"
                    value={gatewayConfig.safepay?.apiKey || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      safepay: { ...gatewayConfig.safepay, apiKey: e.target.value }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">v1 Secret</label>
                  <input
                    type="password"
                    value={gatewayConfig.safepay?.v1Secret || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      safepay: { ...gatewayConfig.safepay, v1Secret: e.target.value }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* JazzCash & Easypaisa */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <HiDevicePhoneMobile className="w-5 h-5 text-emerald-400" /> JazzCash & Easypaisa API
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">JC Merchant ID</label>
                    <input
                      type="text"
                      value={gatewayConfig.jazzcash?.merchantId || ''}
                      onChange={e => setGatewayConfig({
                        ...gatewayConfig,
                        jazzcash: { ...gatewayConfig.jazzcash, merchantId: e.target.value }
                      })}
                      className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">EP Store ID</label>
                    <input
                      type="text"
                      value={gatewayConfig.easypaisa?.storeId || ''}
                      onChange={e => setGatewayConfig({
                        ...gatewayConfig,
                        easypaisa: { ...gatewayConfig.easypaisa, storeId: e.target.value }
                      })}
                      className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Webhook Endpoint Info Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-white block">Official Payment Webhooks Listener</span>
                <span className="text-gray-400 font-mono text-[11px]">https://nexora-work.vercel.app/api/webhooks/payments</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://nexora-work.vercel.app/api/webhooks/payments');
                  toast.success('Webhook URL copied!');
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 font-semibold"
              >
                Copy Webhook URL
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveGatewaySettings}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
              >
                Save Payment Gateway Credentials
              </button>
            </div>
          </div>

          {/* 2. Third-Party OAuth 2.0 Identity Providers */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HiKey className="w-5 h-5 text-blue-400" /> Third-Party OAuth 2.0 Single Sign-On (SSO)
              </h3>
              <p className="text-xs text-gray-400">
                Manage OAuth client credentials for Sign in with Google, Microsoft, and GitHub.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Google */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <FaGoogle className="w-4 h-4 text-rose-400" /> Google Sign-In
                  </span>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.oauth?.google?.enabled ?? true}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      oauth: { ...gatewayConfig.oauth, google: { ...gatewayConfig.oauth?.google, enabled: e.target.checked } }
                    })}
                    className="rounded bg-white/10 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Client ID</label>
                  <input
                    type="text"
                    value={gatewayConfig.oauth?.google?.clientId || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      oauth: { ...gatewayConfig.oauth, google: { ...gatewayConfig.oauth?.google, clientId: e.target.value } }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Microsoft */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <FaMicrosoft className="w-4 h-4 text-blue-400" /> Microsoft Entra / Azure
                  </span>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.oauth?.microsoft?.enabled ?? true}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      oauth: { ...gatewayConfig.oauth, microsoft: { ...gatewayConfig.oauth?.microsoft, enabled: e.target.checked } }
                    })}
                    className="rounded bg-white/10 text-blue-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Application Client ID</label>
                  <input
                    type="text"
                    value={gatewayConfig.oauth?.microsoft?.clientId || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      oauth: { ...gatewayConfig.oauth, microsoft: { ...gatewayConfig.oauth?.microsoft, clientId: e.target.value } }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* GitHub */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <FaGithub className="w-4 h-4 text-purple-400" /> GitHub OAuth
                  </span>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.oauth?.github?.enabled ?? true}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      oauth: { ...gatewayConfig.oauth, github: { ...gatewayConfig.oauth?.github, enabled: e.target.checked } }
                    })}
                    className="rounded bg-white/10 text-purple-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">OAuth Client ID</label>
                  <input
                    type="text"
                    value={gatewayConfig.oauth?.github?.clientId || ''}
                    onChange={e => setGatewayConfig({
                      ...gatewayConfig,
                      oauth: { ...gatewayConfig.oauth, github: { ...gatewayConfig.oauth?.github, clientId: e.target.value } }
                    })}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* OAuth Callback URI */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-white block">Authorized Redirect / Callback URI</span>
                <span className="text-gray-400 font-mono text-[11px]">https://nexora-work.vercel.app/auth/callback</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://nexora-work.vercel.app/auth/callback');
                  toast.success('OAuth Callback URI copied!');
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold"
              >
                Copy Callback URI
              </button>
            </div>
          </div>

          {/* 3. Platform Refund Requests Approval Queue */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HiArrowUturnLeft className="w-5 h-5 text-rose-400" /> Platform Refund Requests Queue
                </h3>
                <p className="text-xs text-gray-400">
                  Review and process customer refund requests. Approving a refund reverts client workspace to the Starter tier.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {refundRequests.filter(r => r.status === 'pending').length} Pending
              </span>
            </div>

            {refundRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-950/60 border-b border-white/10 text-gray-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4">Client Email</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {refundRequests.map(r => (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono font-bold text-white">{r.id}</td>
                        <td className="py-3 px-4 font-mono text-gray-400">{r.transactionId}</td>
                        <td className="py-3 px-4 text-white font-medium">{r.customerEmail}</td>
                        <td className="py-3 px-4 text-gray-300 max-w-[200px] truncate">{r.reason}</td>
                        <td className="py-3 px-4 text-gray-400">{new Date(r.requestedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : r.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApproveRefund(r.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                              >
                                Approve Refund
                              </button>
                              <button
                                onClick={() => handleRejectRefund(r.id)}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 font-semibold text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-3">No pending refund requests at this time.</p>
            )}
          </div>

          {/* 4. All Platform Transactions Ledger */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HiServerStack className="w-5 h-5 text-blue-400" /> Platform Payment Transactions Ledger
              </h3>
              <p className="text-xs text-gray-400">
                Real-time log of charges, renewals, and refunds across Stripe, PayPal, Safepay, JazzCash, Easypaisa, and Raast.
              </p>
            </div>

            {allTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-950/60 border-b border-white/10 text-gray-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">TXN ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Gateway</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {allTransactions.slice(0, 10).map(t => (
                      <tr key={t.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono font-bold text-white">{t.id}</td>
                        <td className="py-3 px-4 text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="text-white font-medium">{t.customerName}</div>
                          <div className="text-gray-500 text-[11px]">{t.customerEmail}</div>
                        </td>
                        <td className="py-3 px-4 text-white">{t.planName || t.planId}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-gray-300 border border-white/10">
                            {t.gateway}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {t.currency === 'PKR' ? 'PKR ' : '$'}{t.amount}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : t.status === 'refunded'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-3">No platform transactions recorded yet.</p>
            )}
          </div>

          {/* 5. Admin Manual Receiving Accounts Configuration */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HiBuildingLibrary className="w-5 h-5 text-blue-400" /> Admin Receiving Accounts (Raast / IBFT & Mobile Wallets)
              </h3>
              <p className="text-xs text-gray-400">
                These receiving details are shown to clients when they choose manual bank transfer or mobile slip verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Bank Name / Provider</label>
                <input
                  type="text"
                  value={billingConfig.bankName}
                  onChange={e => setBillingConfig({ ...billingConfig, bankName: e.target.value })}
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Account Title (Beneficiary Name)</label>
                <input
                  type="text"
                  value={billingConfig.accountTitle}
                  onChange={e => setBillingConfig({ ...billingConfig, accountTitle: e.target.value })}
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Bank Account / Raast Number</label>
                <input
                  type="text"
                  value={billingConfig.accountNumber}
                  onChange={e => setBillingConfig({ ...billingConfig, accountNumber: e.target.value })}
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">EasyPaisa Account Number</label>
                <input
                  type="text"
                  value={billingConfig.easypaisa}
                  onChange={e => setBillingConfig({ ...billingConfig, easypaisa: e.target.value })}
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">JazzCash Account Number</label>
                <input
                  type="text"
                  value={billingConfig.jazzcash}
                  onChange={e => setBillingConfig({ ...billingConfig, jazzcash: e.target.value })}
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">WhatsApp for Payment Slips</label>
                <input
                  type="text"
                  value={billingConfig.whatsapp}
                  onChange={e => setBillingConfig({ ...billingConfig, whatsapp: e.target.value })}
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveBilling}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
              >
                Save Billing Account Settings
              </button>
            </div>
          </div>

          {/* 6. Platform Controls & Toggles */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 shadow-xl space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HiWrenchScrewdriver className="w-4 h-4 text-blue-400" /> Platform Security & Rate Limits
              </h3>
              <p className="text-xs text-gray-400">Global feature toggles, security gates, and AI token rate limit controls</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Maintenance Mode</span>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={e => {
                      setMaintenanceMode(e.target.checked);
                      toast(e.target.checked ? 'Maintenance mode enabled' : 'Platform online', { icon: '⚙️' });
                    }}
                    className="rounded bg-white/10 text-blue-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Temporarily restrict access for scheduled database migrations.</p>
              </div>

              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Allow Public Registration</span>
                  <input
                    type="checkbox"
                    checked={allowRegistrations}
                    onChange={e => {
                      setAllowRegistrations(e.target.checked);
                      toast.success('Registration policy updated');
                    }}
                    className="rounded bg-white/10 text-blue-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Allow new clients to self-register without an invite token.</p>
              </div>

              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">AI Rate Limit (req/min)</span>
                  <input
                    type="number"
                    value={aiRateLimit}
                    onChange={e => setAiRateLimit(e.target.value)}
                    className="w-16 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Protect API tokens from runaway loops or automated scrapers.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
