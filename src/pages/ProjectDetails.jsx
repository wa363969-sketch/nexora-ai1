import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiArrowLeft, 
  HiFolderOpen, 
  HiCalendarDays, 
  HiUserGroup, 
  HiPlus, 
  HiCheckCircle, 
  HiTrash, 
  HiPencilSquare,
  HiClock,
  HiViewColumns,
  HiTag
} from 'react-icons/hi2';
import { getProjects, getTasks, createTask, updateTask, deleteTask } from '../services/dataService';
import { formatDate, calculateProgress, getPriorityColor, getStatusColor, isOverdue } from '../lib/utils';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // New task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assigneeName: 'You',
    deadline: ''
  });

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  async function loadProjectDetails() {
    try {
      const [allProjects, allTasks] = await Promise.all([getProjects(), getTasks(id)]);
      const found = allProjects.find(p => p.$id === id);
      if (!found) {
        toast.error('Project not found');
        navigate('/projects');
        return;
      }
      setProject(found);
      setTasks(allTasks);
    } catch (e) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTask(task) {
    const newStatus = task.status === 'done' ? 'in-progress' : 'done';
    try {
      const updated = await updateTask(task.$id, { status: newStatus });
      setTasks(prev => prev.map(t => t.$id === task.$id ? updated : t));
      toast.success(newStatus === 'done' ? 'Task resolved' : 'Task reopened');
    } catch (e) {
      toast.error('Failed to update task');
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      const created = await createTask({
        ...taskForm,
        projectId: project.$id,
        projectName: project.name
      });
      setTasks(prev => [created, ...prev]);
      setIsTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assigneeName: 'You',
        deadline: ''
      });
      toast.success('Task added to project');
    } catch (e) {
      toast.error('Failed to create task');
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.$id !== taskId));
      toast.success('Task deleted');
    } catch (e) {
      toast.error('Failed to delete task');
    }
  }

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const progress = calculateProgress(tasks);
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" /> Back to Projects Portfolio
        </button>
      </div>

      {/* Project Master Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-navy-900 border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: project.color || '#3b82f6' }} />
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-300">
                {project.category}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {project.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">{project.name}</h1>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              {project.description || 'No detailed scope written for this project.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/kanban"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/10 transition-colors"
            >
              <HiViewColumns className="w-4 h-4" /> Board View
            </Link>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <HiPlus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

        {/* Progress & Metadata banner */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-gray-400 mb-1">Calculated Progress</div>
            <ProgressBar value={progress} showLabel size="md" />
            <div className="text-[11px] text-gray-500 mt-1">
              {doneCount} of {tasks.length} tasks completed
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Team Lead</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <HiUserGroup className="w-4 h-4 text-blue-400" />
              {project.teamLead || 'Unassigned'}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Responsible for milestone delivery</div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Target Deadline</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <HiCalendarDays className="w-4 h-4 text-violet-400" />
              {formatDate(project.deadline)}
            </div>
            <div className={`text-[11px] mt-1 ${isOverdue(project.deadline) ? 'text-rose-400 font-semibold' : 'text-gray-500'}`}>
              {isOverdue(project.deadline) ? 'Overdue milestone' : 'On schedule'}
            </div>
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Project Work Items ({tasks.length})</h2>
            <p className="text-xs text-gray-400">All tasks linked directly to this project's database ID</p>
          </div>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <HiPlus className="w-3.5 h-3.5" /> Quick Add Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-navy-900/40 border border-white/5">
            <p className="text-sm text-gray-400 mb-4">No tasks linked to this project yet.</p>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map(t => {
              const isDone = t.status === 'done';
              return (
                <div
                  key={t.$id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                    isDone
                      ? 'bg-navy-950/40 border-white/5 opacity-70'
                      : 'bg-navy-900/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTask(t)}
                      className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-white/30 hover:border-blue-400'
                      }`}
                    >
                      {isDone && <HiCheckCircle className="w-4 h-4 fill-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold truncate ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                          {t.title}
                        </h4>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${getPriorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                          {t.status}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{t.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-gray-500 mt-2">
                        <span>Assignee: {t.assigneeName}</span>
                        <span>Due: {formatDate(t.deadline)}</span>
                        {t.subtasks?.length > 0 && (
                          <span>{t.subtasks.filter(st => st.done).length}/{t.subtasks.length} subtasks</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(t.$id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-colors"
                    title="Delete Task"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={`Add Task to ${project.name}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Task Title *</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Integrate Apple Pay Tokenizer"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Technical specs, acceptance criteria, or context..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="urgent">Urgent (P0)</option>
                <option value="high">High (P1)</option>
                <option value="medium">Medium (P2)</option>
                <option value="low">Low (P3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
              <select
                value={taskForm.status}
                onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Assignee</label>
              <input
                type="text"
                value={taskForm.assigneeName}
                onChange={e => setTaskForm({ ...taskForm, assigneeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Deadline</label>
              <input
                type="date"
                value={taskForm.deadline}
                onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/25"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
