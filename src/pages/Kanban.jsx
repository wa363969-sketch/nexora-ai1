import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiViewColumns, 
  HiPlus, 
  HiMagnifyingGlass, 
  HiClock, 
  HiCheckCircle,
  HiChevronRight,
  HiChevronLeft,
  HiTrash,
  HiSparkles,
  HiDocumentText
} from 'react-icons/hi2';
import { getTasks, getProjects, updateTask, createTask, deleteTask } from '../services/dataService';
import { formatDate, getPriorityColor, isOverdue } from '../lib/utils';
import Modal from '../components/ui/Modal';
import SpecToKanbanModal from '../components/SpecToKanbanModal';
import VoiceTaskInput from '../components/VoiceTaskInput';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { id: 'in-progress', title: 'In Progress', color: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10' },
  { id: 'in-review', title: 'In Review', color: 'border-violet-500/40 text-violet-400 bg-violet-500/10' },
  { id: 'done', title: 'Done', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
];

export default function Kanban() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Quick Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState('todo');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newProjectId, setNewProjectId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [tList, pList] = await Promise.all([getTasks(), getProjects()]);
      setTasks(tList);
      setProjects(pList);
      if (pList.length > 0) setNewProjectId(pList[0].$id);
    } catch (e) {
      toast.error('Failed to load board tasks');
    } finally {
      setLoading(false);
    }
  }

  // HTML5 Drag and drop handlers
  function handleDragStart(e, taskId) {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  }

  async function handleDrop(e, columnId) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    try {
      const updated = await updateTask(taskId, { status: columnId });
      setTasks(prev => prev.map(t => t.$id === taskId ? updated : t));
      toast.success(`Task moved to ${COLUMNS.find(c => c.id === columnId)?.title}`);
    } catch (err) {
      toast.error('Failed to move task');
    } finally {
      setDraggedTaskId(null);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  // Quick step transitions
  async function moveTaskStep(task, direction) {
    const colOrder = ['todo', 'in-progress', 'in-review', 'done'];
    const currentIdx = colOrder.indexOf(task.status);
    const newIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (newIdx < 0 || newIdx >= colOrder.length) return;

    const newStatus = colOrder[newIdx];
    try {
      const updated = await updateTask(task.$id, { status: newStatus });
      setTasks(prev => prev.map(t => t.$id === task.$id ? updated : t));
    } catch (err) {
      toast.error('Failed to move task');
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.$id !== taskId));
      toast.success('Task removed');
    } catch (e) {
      toast.error('Failed to delete task');
    }
  }

  async function handleQuickCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const proj = projects.find(p => p.$id === newProjectId);
    try {
      const created = await createTask({
        title: newTitle.trim(),
        projectId: newProjectId,
        projectName: proj?.name || 'Workspace',
        priority: newPriority,
        status: targetColumn,
        assigneeName: user?.name || 'You',
        assigneeAvatar: (user?.name || 'U').slice(0, 2).toUpperCase(),
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
      setTasks(prev => [created, ...prev]);
      setIsModalOpen(false);
      setNewTitle('');
      toast.success('Task created in column');
    } catch (e) {
      toast.error('Failed to add task');
    }
  }

  async function handleVoiceTask(taskData) {
    const proj = projects.find(p => p.$id === newProjectId) || projects[0];
    try {
      const created = await createTask({
        ...taskData,
        projectId: proj?.$id || 'proj-1',
        projectName: proj?.name || 'Workspace'
      });
      setTasks(prev => [created, ...prev]);
    } catch (e) {
      toast.error('Failed to add voice task');
    }
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesProj = selectedProject === 'All' || t.projectId === selectedProject;
    return matchesSearch && matchesProj;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HiViewColumns className="w-7 h-7 text-blue-400" /> Interactive Kanban Board
          </h1>
          <p className="text-xs text-gray-400">
            Drag cards between columns or use directional arrows to advance sprint states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSpecModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 font-semibold text-xs border border-violet-500/30 flex items-center gap-1.5 transition-all shadow-md"
          >
            <HiDocumentText className="w-4 h-4 text-violet-400" /> Spec to Kanban
          </button>
          <VoiceTaskInput onTaskRecorded={handleVoiceTask} />
          <Link
            to="/tasks"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/10 transition-colors"
          >
            Matrix View
          </Link>
          <button
            onClick={() => {
              setTargetColumn('todo');
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <HiPlus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-3.5 rounded-xl bg-navy-900/80 border border-white/10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter Kanban cards..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-navy-800 border border-white/10 text-xs text-gray-200 focus:outline-none"
        >
          <option value="All">All Projects</option>
          {projects.map(p => (
            <option key={p.$id} value={p.$id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              className="bg-navy-900/60 rounded-2xl border border-white/10 p-4 space-y-4 min-h-[580px] flex flex-col justify-between"
            >
              <div>
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${col.color}`}>
                      {col.title}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-gray-300">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTargetColumn(col.id);
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/5"
                    title="Add task in this column"
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards in column */}
                <div className="space-y-3">
                  {colTasks.map(task => (
                    <motion.div
                      key={task.$id}
                      draggable
                      onDragStart={e => handleDragStart(e, task.$id)}
                      layout
                      whileHover={{ scale: 1.01 }}
                      className="p-4 rounded-xl bg-navy-950/80 border border-white/10 hover:border-blue-500/40 shadow-lg cursor-grab active:cursor-grabbing space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-gray-400 truncate max-w-[140px]">
                          {task.projectName}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => handleDelete(task.$id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
                            title="Delete"
                          >
                            <HiTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-semibold text-white leading-snug">
                        {task.title}
                      </h4>

                      {task.subtasks?.length > 0 && (
                        <div className="text-[11px] text-gray-500">
                          {task.subtasks.filter(st => st.done).length} / {task.subtasks.length} subtasks done
                        </div>
                      )}

                      {/* Card footer */}
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-[9px] font-bold text-white">
                            {(task.assigneeName || 'AR').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[80px]">{task.assigneeName}</span>
                        </div>

                        {/* Step Advance Arrows */}
                        <div className="flex items-center gap-1">
                          {col.id !== 'todo' && (
                            <button
                              onClick={() => moveTaskStep(task, 'prev')}
                              className="p-1 rounded bg-white/5 hover:bg-white/15 text-gray-300"
                              title="Move backward"
                            >
                              <HiChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button
                              onClick={() => moveTaskStep(task, 'next')}
                              className="p-1 rounded bg-white/5 hover:bg-white/15 text-gray-300"
                              title="Advance forward"
                            >
                              <HiChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-white/10 rounded-xl">
                      Drop cards here
                    </div>
                  )}
                </div>
              </div>

              {/* Add card button at bottom */}
              <button
                onClick={() => {
                  setTargetColumn(col.id);
                  setIsModalOpen(true);
                }}
                className="w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/5 transition-all"
              >
                <HiPlus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Card to ${COLUMNS.find(c => c.id === targetColumn)?.title}`}
      >
        <form onSubmit={handleQuickCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Task Title *</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Audit API Error Handling"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Project</label>
              <select
                value={newProjectId}
                onChange={e => setNewProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-xs focus:outline-none"
              >
                {projects.map(p => (
                  <option key={p.$id} value={p.$id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-xs focus:outline-none"
              >
                <option value="urgent">Urgent (P0)</option>
                <option value="high">High (P1)</option>
                <option value="medium">Medium (P2)</option>
                <option value="low">Low (P3)</option>
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
              Add Card
            </button>
          </div>
        </form>
      </Modal>

      {/* Spec To Kanban Modal */}
      <SpecToKanbanModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        projects={projects}
        onTasksCreated={(newOnes) => setTasks(prev => [...newOnes, ...prev])}
      />
    </div>
  );
}
