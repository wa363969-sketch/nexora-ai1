import { useState } from 'react';
import { 
  HiSparkles, 
  HiClipboard, 
  HiCheck, 
  HiPaperAirplane, 
  HiExclamationTriangle,
  HiClock
} from 'react-icons/hi2';
import Modal from './ui/Modal';
import { isOverdue } from '../lib/utils';
import toast from 'react-hot-toast';

export default function StandupModal({ isOpen, onClose, tasks = [], user = null }) {
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sending, setSending] = useState(false);

  const completed = tasks.filter(t => t.status === 'done');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const todo = tasks.filter(t => t.status === 'todo');
  const overdue = tasks.filter(t => t.status !== 'done' && isOverdue(t.deadline));

  const userName = user?.name || 'Engineer';
  const standupText = `📋 **Daily Standup Report — ${userName}**\n*Date: ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}*\n\n✅ **Completed / Resolved:**\n${completed.length > 0 ? completed.slice(0, 3).map(t => `- ${t.title} (${t.projectName})`).join('\n') : '- Finalized architectural specs & review'}\n\n🎯 **Today's Focus / In Progress:**\n${inProgress.length > 0 ? inProgress.slice(0, 3).map(t => `- ${t.title} [${t.priority.toUpperCase()}]`).join('\n') : (todo.length > 0 ? todo.slice(0, 2).map(t => `- Pick up: ${t.title}`).join('\n') : '- Sprint backlog grooming')}\n\n⚠️ **Blockers & Overdue Warnings:**\n${overdue.length > 0 ? overdue.slice(0, 2).map(t => `- Overdue: ${t.title} (due ${new Date(t.deadline).toLocaleDateString()})`).join('\n') : '- No critical blockers currently identified.'}`;

  function handleCopy() {
    navigator.clipboard.writeText(standupText);
    setCopied(true);
    toast.success('Standup summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendWebhook(e) {
    e.preventDefault();
    if (!webhookUrl.trim() || !webhookUrl.startsWith('http')) {
      toast.error('Please enter a valid Slack or Discord webhook URL');
      return;
    }
    setSending(true);
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: standupText, text: standupText }),
        mode: 'no-cors'
      });
      toast.success('Dispatched to team channel webhook!');
      onClose();
    } catch (e) {
      toast.error('Failed to trigger webhook');
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="NEXORA AI Daily Standup Generator"
      size="lg"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-2">
          <HiSparkles className="w-4 h-4 shrink-0 text-violet-400" />
          <span>Automatically synthesized from your live database sprint cards and deadlines.</span>
        </div>

        {/* Standup Preview Box */}
        <div className="p-4 rounded-xl bg-navy-950 border border-white/10 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
          {standupText}
        </div>

        {/* Webhook Dispatch Option */}
        <form onSubmit={handleSendWebhook} className="pt-2 flex gap-2">
          <input
            type="url"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="Paste Slack or Discord Webhook URL (optional)..."
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !webhookUrl.trim()}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
          >
            <HiPaperAirplane className="w-3.5 h-3.5" /> Dispatch
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/25"
          >
            {copied ? <HiCheck className="w-4 h-4 text-emerald-300" /> : <HiClipboard className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Standup'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
