import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiClipboardDocumentList, 
  HiPlus, 
  HiMagnifyingGlass, 
  HiViewColumns, 
  HiCalendarDays, 
  HiTrash, 
  HiCheckCircle, 
  HiChevronDown, 
  HiChevronUp,
  HiClock,
  HiFunnel,
  HiPencilSquare
} from 'react-icons/hi2';
import { getTasks, getProjects, createTask, updateTask, deleteTask } from '../services/dataService';
import { formatDate, getPriorityColor, getStatusColor, isOverdue } from '../lib/utils';
import Modal from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Tasks() {
  const { user } = useAuth();
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Expanded tasks for subtask inspection
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    projectName: '',
    priority: 'medium',
    status: 'todo',
    assigneeName: user?.name || 'You',
    deadline: '',
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
      const [tList, pList] = await Promise.all([getTasks(), getProjects()]);
      setTasks(tList);
      setProjects(pList);
    } catch (e) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      projectId: projects[0]?.$id || 'proj-1',
      projectName: projects[0]?.name || 'NEXORA Mobile App v2',
      priority: 'medium',
      status: 'todo',
      assigneeName: user?.name || 'You',
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  }

  function openEditModal(task, e) {
    e.stopPropagation();
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      projectName: task.projectName || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assigneeName: task.assigneeName || 'You',
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    const proj = projects.find(p => p.$id === formData.projectId);
    const dataToSend = {
      ...formData,
      projectName: proj?.name || formData.projectName || 'General Workspace'
    };

    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.$id, dataToSend);
        setTasks(prev => prev.map(t => t.$id === editingTask.$id ? updated : t));
        toast.success('Task updated');
      } else {
        const created = await createTask(dataToSend);
        setTasks(prev => [created, ...prev]);
        toast.success('Task created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Operation failed');
    }
  }

  async function handleToggleStatus(task, e) {
    e?.stopPropagation();
    const newStatus = task.status === 'done' ? 'in-progress' : 'done';
    try {
      const updated = await updateTask(task.$id, { status: newStatus });
      setTasks(prev => prev.map(t => t.$id === task.$id ? updated : t));
      toast.success(newStatus === 'done' ? 'Task marked complete' : 'Task reopened');
    } catch (err) {
      toast.error('Failed to update task');
    }
  }

  async function handleDelete(taskId, e) {
    e.stopPropagation();
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.$id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  }

  async function handleToggleSubtask(task, subtaskId) {
    const updatedSubtasks = (task.subtasks || []).map(st => 
      st.id === subtaskId ? { ...st, done: !st.done } : st
    );
    const allDone = updatedSubtasks.every(st => st.done);
    const newStatus = allDone && updatedSubtasks.length > 0 ? 'done' : task.status;

    try {
      const updated = await updateTask(task.$id, { subtasks: updatedSubtasks, status: newStatus });
      setTasks(prev => prev.map(t => t.$id === task.$id ? updated : t));
    } catch (err) {
      toast.error('Failed to update subtask');
    }
  }

  async function handleAddSubtask(task, e) {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: 'st-' + Date.now(),
      title: newSubtaskTitle.trim(),
      done: false
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    try {
      const updated = await updateTask(task.$id, { subtasks: updatedSubtasks });
      setTasks(prev => prev.map(t => t.$id === task.$id ? updated : t));
      setNewSubtaskTitle('');
      toast.success('Subtask added');
    } catch (err) {
      toast.error('Failed to add subtask');
    }
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesProject = filterProject === 'All' || t.projectId === filterProject;
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesProject && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HiClipboardDocumentList className="w-7 h-7 text-violet-400" /> Tasks Matrix
          </h1>
          <p className="text-xs text-gray-400">
            Unified list view of all sprint items, subtask checklists, and assignees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/kanban"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-2 border border-white/10 transition-colors"
          >
            <HiViewColumns className="w-4 h-4" /> Board View
          </Link>
          <Link
            to="/calendar"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-2 border border-white/10 transition-colors"
          >
            <HiCalendarDays className="w-4 h-4" /> Calendar
          </Link>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <HiPlus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-navy-900/80 border border-white/10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks or specs..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="px-3 py-2 rounded-lg bg-navy-800 border border-white/10 text-xs text-gray-200 focus:outline-none"
        >
          <option value="All">All Projects</option>
          {projects.map(p => (
            <option key={p.$id} value={p.$id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="px-3 py-2 rounded-lg bg-navy-800 border border-white/10 text-xs text-gray-200 focus:outline-none"
        >
          <option value="All">All Priorities</option>
          <option value="urgent">Urgent (P0)</option>
          <option value="high">High (P1)</option>
          <option value="medium">Medium (P2)</option>
          <option value="low">Low (P3)</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-navy-800 border border-white/10 text-xs text-gray-200 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Tasks Table / Expandable Cards */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-navy-900/40 border border-white/5">
          <HiClipboardDocumentList className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Tasks Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
            Try adjusting your search criteria or create a new sprint task.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const isDone = task.status === 'done';
            const isExpanded = expandedTaskId === task.$id;
            const subtasks = task.subtasks || [];
            const completedSubtasks = subtasks.filter(st => st.done).length;

            return (
              <div
                key={task.$id}
                className={`rounded-2xl border transition-all ${
                  isDone 
                    ? 'bg-navy-950/40 border-white/5 opacity-70' 
                    : 'bg-navy-900/80 border-white/10 hover:border-white/20'
                }`}
              >
                <div 
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.$id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={e => handleToggleStatus(task, e)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-white/30 hover:border-blue-400'
                      }`}
                    >
                      {isDone && <HiCheckCircle className="w-4 h-4 fill-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold truncate ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                          {task.title}
                        </span>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-gray-400 shrink-0">
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="text-gray-400 font-medium truncate">{task.projectName}</span>
                        <span>Assignee: {task.assigneeName}</span>
                        <span className={isOverdue(task.deadline) && !isDone ? 'text-rose-400 font-semibold' : ''}>
                          Due {formatDate(task.deadline)}
                        </span>
                        {subtasks.length > 0 && (
                          <span className="text-blue-400">
                            {completedSubtasks}/{subtasks.length} subtasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => openEditModal(task, e)}
                      className="p-1.5 text-gray-400 hover:text-white rounded"
                      title="Edit"
                    >
                      <HiPencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => handleDelete(task.$id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded"
                      title="Delete"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                    <div className="text-gray-400">
                      {isExpanded ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Subtask Drawer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5 pt-2 border-t border-white/5 bg-navy-950/40 space-y-3"
                    >
                      {task.description && (
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">
                          {task.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Subtasks Checklist ({completedSubtasks}/{subtasks.length})
                        </h5>

                        {subtasks.map(st => (
                          <div
                            key={st.id}
                            onClick={() => handleToggleSubtask(task, st.id)}
                            className="flex items-center gap-2.5 text-xs text-gray-300 hover:text-white cursor-pointer py-1"
                          >
                            <input
                              type="checkbox"
                              checked={st.done}
                              onChange={() => {}}
                              className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-0"
                            />
                            <span className={st.done ? 'line-through text-gray-500' : ''}>
                              {st.title}
                            </span>
                          </div>
                        ))}

                        {/* Add subtask inline input */}
                        <form onSubmit={e => handleAddSubtask(task, e)} className="flex gap-2 pt-2">
                          <input
                            type="text"
                            value={newSubtaskTitle}
                            onChange={e => setNewSubtaskTitle(e.target.value)}
                            placeholder="Add actionable subtask..."
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                          >
                            Add
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task Specifications' : 'Create New Sprint Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement OAuth SSO Flow"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Description & Acceptance Criteria</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Details, URLs, or implementation constraints..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Assign to Project</label>
              <select
                value={formData.projectId}
                onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-sm focus:outline-none"
              >
                {projects.map(p => (
                  <option key={p.$id} value={p.$id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="urgent">Urgent (P0)</option>
                <option value="high">High (P1)</option>
                <option value="medium">Medium (P2)</option>
                <option value="low">Low (P3)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Assignee</label>
              <input
                type="text"
                value={formData.assigneeName}
                onChange={e => setFormData({ ...formData, assigneeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
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
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
