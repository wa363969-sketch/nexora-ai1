import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiFolderOpen, 
  HiPlus, 
  HiMagnifyingGlass, 
  HiFunnel, 
  HiSquares2X2, 
  HiListBullet, 
  HiTrash, 
  HiPencilSquare,
  HiClock,
  HiUserGroup,
  HiCalendarDays,
  HiEllipsisVertical
} from 'react-icons/hi2';
import { getProjects, createProject, updateProject, deleteProject, getTasks } from '../services/dataService';
import { formatDate, calculateProgress, getPriorityColor, PROJECT_CATEGORIES, PRIORITIES } from '../lib/utils';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Projects() {
  const location = useLocation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Development',
    priority: 'medium',
    status: 'active',
    deadline: '',
    teamLead: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(location.search);
    if (params.get('create') === 'true') {
      openCreateModal();
    }
  }, [location.search]);

  async function loadData() {
    try {
      const [pList, tList] = await Promise.all([getProjects(), getTasks()]);
      setProjects(pList);
      setTasks(tList);
    } catch (e) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      category: 'Development',
      priority: 'medium',
      status: 'active',
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      teamLead: 'Sarah Jenkins',
      color: '#3b82f6'
    });
    setIsModalOpen(true);
  }

  function openEditModal(project, e) {
    e.stopPropagation();
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      category: project.category || 'Development',
      priority: project.priority || 'medium',
      status: project.status || 'active',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      teamLead: project.teamLead || 'Lead',
      color: project.color || '#3b82f6'
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Project title is required');
      return;
    }

    try {
      if (editingProject) {
        const updated = await updateProject(editingProject.$id, formData);
        setProjects(prev => prev.map(p => p.$id === editingProject.$id ? updated : p));
        toast.success('Project updated successfully');
      } else {
        const created = await createProject(formData);
        setProjects(prev => [created, ...prev]);
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project and its tasks?')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.$id !== id));
      toast.success('Project removed');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HiFolderOpen className="w-7 h-7 text-blue-400" /> Projects Portfolio
          </h1>
          <p className="text-xs text-gray-400">
            Manage deadlines, team assignments, and delivery milestones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <HiPlus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-navy-900/80 border border-white/10">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-navy-800 border border-white/10 text-xs text-gray-200 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {PROJECT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-navy-800 border border-white/10 text-xs text-gray-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 self-end md:self-auto">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Grid View"
          >
            <HiSquares2X2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            title="List View"
          >
            <HiListBullet className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-navy-900/40 border border-white/5">
          <HiFolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Projects Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
            No projects matched your active filters or search terms.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Create Your First Project
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(p => {
            const projTasks = tasks.filter(t => t.projectId === p.$id);
            const progress = calculateProgress(projTasks);
            return (
              <motion.div
                key={p.$id}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/projects/${p.$id}`)}
                className="p-6 rounded-2xl bg-navy-900/80 border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color || '#3b82f6' }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {p.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => openEditModal(p, e)}
                        className="p-1 text-gray-400 hover:text-white rounded"
                        title="Edit Project"
                      >
                        <HiPencilSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => handleDelete(p.$id, e)}
                        className="p-1 text-gray-400 hover:text-red-400 rounded"
                        title="Delete Project"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-6">
                    {p.description || 'No detailed brief provided.'}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    <ProgressBar value={progress} showLabel size="sm" />
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>{projTasks.filter(t => t.status === 'done').length} of {projTasks.length} tasks complete</span>
                      <span className={`px-1.5 py-0.2 rounded font-semibold ${getPriorityColor(p.priority)}`}>
                        {p.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/5">
                  <span className="flex items-center gap-1.5">
                    <HiUserGroup className="w-4 h-4 text-gray-500" /> {p.teamLead}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiClock className="w-4 h-4 text-gray-500" /> {formatDate(p.deadline)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-white/10 bg-navy-900/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/60 border-b border-white/10 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Team Lead</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredProjects.map(p => {
                  const projTasks = tasks.filter(t => t.projectId === p.$id);
                  const progress = calculateProgress(projTasks);
                  return (
                    <tr
                      key={p.$id}
                      onClick={() => navigate(`/projects/${p.$id}`)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#3b82f6' }} />
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">{p.category}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[11px]">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getPriorityColor(p.priority)}`}>
                          {p.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{p.teamLead}</td>
                      <td className="py-3.5 px-4 text-gray-400">{formatDate(p.deadline)}</td>
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={e => openEditModal(p, e)}
                            className="p-1 hover:text-white"
                          >
                            <HiPencilSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => handleDelete(p.$id, e)}
                            className="p-1 hover:text-red-400"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project Specifications' : 'Initialize New Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., NEXORA Mobile App v2"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Description & Scope</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline high-level goals, deliverables, and team responsibilities..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-sm focus:outline-none"
              >
                {PROJECT_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-sm focus:outline-none"
              >
                {PRIORITIES.map(pr => (
                  <option key={pr} value={pr}>{pr.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Project Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Deadline Date</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Team Lead</label>
              <input
                type="text"
                value={formData.teamLead}
                onChange={e => setFormData({ ...formData, teamLead: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              />
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
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
