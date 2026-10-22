import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiUserGroup, 
  HiUserPlus, 
  HiEnvelope, 
  HiTrash, 
  HiShieldCheck, 
  HiCheckBadge,
  HiClock
} from 'react-icons/hi2';
import { getMembers, inviteMember, getTeams } from '../services/dataService';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteTeam, setInviteTeam] = useState('Core Engineering Guild');

  useEffect(() => {
    loadMembersData();
  }, []);

  async function loadMembersData() {
    try {
      const [mList, tList] = await Promise.all([getMembers(), getTeams()]);
      setMembers(mList);
      setTeams(tList);
      if (tList.length > 0) setInviteTeam(tList[0].name);
    } catch (e) {
      toast.error('Failed to load members directory');
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Valid email address required');
      return;
    }

    try {
      const newMember = await inviteMember({
        email: inviteEmail.trim(),
        name: inviteName.trim(),
        role: inviteRole,
        team: inviteTeam
      });
      setMembers(prev => [newMember, ...prev]);
      setIsModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      toast.success(`Invitation dispatched to ${inviteEmail}`);
    } catch (err) {
      toast.error('Failed to send invite');
    }
  }

  function handleRemoveMember(id) {
    if (!window.confirm('Remove this member from the organization?')) return;
    setMembers(prev => prev.filter(m => m.$id !== id));
    toast.success('Member removed');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HiUserGroup className="w-7 h-7 text-violet-400" /> Team Directory & Roles
          </h1>
          <p className="text-xs text-gray-400">
            Invite colleagues, designate administrative privileges, and assign workspace pods.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
        >
          <HiUserPlus className="w-4 h-4" /> Invite Contributor
        </button>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl border border-white/10 bg-navy-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/60 border-b border-white/10 text-gray-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Member Name & Email</th>
                <th className="py-3 px-4">Role & Permissions</th>
                <th className="py-3 px-4">Assigned Team Pod</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Member Since</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {members.map(m => (
                <tr key={m.$id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div>
                        <div className="font-bold text-white text-sm">{m.name}</div>
                        <div className="text-gray-400 text-xs">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-300 font-medium">
                    {m.team}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {m.joined}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRemoveMember(m.$id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-colors"
                      title="Remove member"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite New Contributor"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="e.g. dev@company.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Role Permission</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-xs focus:outline-none"
              >
                <option value="Admin">Admin (Full Control)</option>
                <option value="Lead Architect">Lead Architect</option>
                <option value="Member">Member (Standard)</option>
                <option value="Guest">Guest (Read Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Assign Team Pod</label>
              <select
                value={inviteTeam}
                onChange={e => setInviteTeam(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-xs focus:outline-none"
              >
                {teams.map(t => (
                  <option key={t.$id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/25"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
