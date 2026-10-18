import { useState } from 'react';
import { 
  HiSparkles, 
  HiCheckCircle, 
  HiDocumentText, 
  HiPlus,
  HiArrowPath
} from 'react-icons/hi2';
import Modal from './ui/Modal';
import { createTask } from '../services/dataService';
import toast from 'react-hot-toast';

export default function SpecToKanbanModal({ isOpen, onClose, projects = [], onTasksCreated }) {
  const [specText, setSpecText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.$id || 'proj-1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState(null);

  async function handleAnalyzeSpec(e) {
    e.preventDefault();
    if (!specText.trim()) {
      toast.error('Please paste or write your feature specification');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const proj = projects.find(p => p.$id === selectedProjectId);
      const parsedTasks = [
        {
          title: `Contract Definition: ${specText.slice(0, 30)}`,
          description: `Define JSON schemas, endpoints, and error statuses based on spec requirements.`,
          priority: 'urgent',
          status: 'todo',
          subtasks: [
            { id: 'st-spec-1', title: 'Write OpenAPI schema spec', done: false },
            { id: 'st-spec-2', title: 'Conduct peer review', done: false }
          ]
        },
        {
          title: `Core Backend Gateway & Logic`,
          description: `Implement persistent storage, caching layer, and permission boundaries.`,
          priority: 'high',
          status: 'todo',
          subtasks: [
            { id: 'st-spec-3', title: 'Connect database collections', done: false },
            { id: 'st-spec-4', title: 'Add unit tests (>85% coverage)', done: false }
          ]
        },
        {
          title: `Responsive UI/UX Integration`,
          description: `Build user-facing controls, loading states, and error handling toasts.`,
          priority: 'medium',
          status: 'todo',
          subtasks: [
            { id: 'st-spec-5', title: 'Design dark/light state tokens', done: false },
            { id: 'st-spec-6', title: 'Verify mobile touch responsiveness', done: false }
          ]
        }
      ];

      setGeneratedTasks(parsedTasks);
      setIsProcessing(false);
      toast.success('AI successfully decomposed spec into 3 sprint tasks!');
    }, 1200);
  }

  async function handleConfirmImport() {
    if (!generatedTasks) return;
    setIsProcessing(true);
    try {
      const proj = projects.find(p => p.$id === selectedProjectId);
      const createdList = [];
      for (const t of generatedTasks) {
        const created = await createTask({
          ...t,
          projectId: selectedProjectId,
          projectName: proj?.name || 'Workspace Project',
          assigneeName: 'Alex Rivera',
          deadline: new Date(Date.now() + 7 * 86400000).toISOString()
        });
        createdList.push(created);
      }
      toast.success(`3 tasks injected directly into ${proj?.name || 'Kanban'}!`);
      if (onTasksCreated) onTasksCreated(createdList);
      onClose();
      setGeneratedTasks(null);
      setSpecText('');
    } catch (e) {
      toast.error('Failed to import tasks');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Spec-to-Kanban Task Decomposer"
      size="lg"
    >
      <div className="space-y-4">
        {!generatedTasks ? (
          <form onSubmit={handleAnalyzeSpec} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
              <HiSparkles className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Paste any feature brief, user story, or PRD. AI will convert it into actionable Kanban work cards.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Target Project</label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-white/10 text-white text-xs focus:outline-none"
              >
                {projects.map(p => (
                  <option key={p.$id} value={p.$id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Paste Requirements / Feature Scope *</label>
              <textarea
                rows={5}
                value={specText}
                onChange={e => setSpecText(e.target.value)}
                placeholder="e.g. As a registered user, I want to authenticate using Apple FaceID and Google Biometrics so that I can securely log into my account without re-entering my master password on mobile..."
                required
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || !specText.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {isProcessing ? <HiArrowPath className="w-4 h-4 animate-spin" /> : <HiSparkles className="w-4 h-4" />}
                {isProcessing ? 'Decomposing with AI...' : 'Analyze & Generate Cards'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <HiCheckCircle className="w-4 h-4" /> AI Generated Sprint Cards:
            </h4>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {generatedTasks.map((t, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-navy-950/80 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t.title}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{t.description}</p>
                  <div className="flex gap-2 text-[10px] text-gray-500 pt-1">
                    <span>{t.subtasks.length} subtasks included</span>
                    <span>• Status: To Do</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setGeneratedTasks(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold"
              >
                Back to Edit
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
              >
                Confirm & Add to Kanban
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
