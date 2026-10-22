import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiUserGroup, 
  HiPlus, 
  HiShieldCheck, 
  HiArrowRight,
  HiBriefcase,
  HiIdentification
} from 'react-icons/hi2';
import { getTeams, createTeam, getMembers, getProjects } from '../services/dataService';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamLead, setTeamLead] = useState('Sarah Jenkins');

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      const [tList, mList, pList] = await Promise.all([getTeams(), getMembers(), getProjects()]);
      setTeams(tList);
      setMembers(mList);
      setProjects(pList);
    } catch (e) {
      toast.error('Failed to load teams');
    }
  }

  async function handleCreateTeam(e) {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      const created = await createTeam({
        name: teamName.trim(),
        description: teamDesc.trim(),
        lead: teamLead
      });
      setTeams(prev => [created, ...prev]);
      setIsModalOpen(false);
      setTeamName('');
      setTeamDesc('');
      toast.success('Team created');
    } catch (e) {
      toast.error('Failed to create team');
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HiUserGroup className="w-7 h-7 text-blue-400" /> Team Workspaces
          </h1>
          <p className="text-xs text-gray-400">
            Organize contributors into functional pods with role-based access controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/team-members"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/10 transition-colors"
          >
            Directory & Invites
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <HiPlus className="w-4 h-4" /> Create Team
          </button>
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams.map(t => {
          const teamMembers = members.filter(m => m.team === t.name);
          return (
            <motion.div
              key={t.$id}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 hover:border-blue-500/40 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <HiBriefcase className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{t.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-6">
                  {t.description || 'Dedicated workspace pod for collaborative execution.'}
                </p>

                <div className="p-3 rounded-xl bg-navy-950/60 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Pod Lead</span>
                    <span className="text-white font-semibold">{t.lead}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Active Contributors</span>
                    <span className="text-blue-400 font-semibold">{teamMembers.length || t.memberCount} members</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                <Link
                  to="/team-members"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Manage Members <HiArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Team Pod"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Team Name *</label>
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. Growth & Lifecycle Engineering"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Mission / Scope</label>
            <textarea
              rows={3}
              value={teamDesc}
              onChange={e => setTeamDesc(e.target.value)}
              placeholder="Describe what this team focuses on..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Lead Architect</label>
            <input
              type="text"
              value={teamLead}
              onChange={e => setTeamLead(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
            />
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
              Create Team
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
