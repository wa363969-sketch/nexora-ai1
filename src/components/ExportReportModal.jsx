import { useState } from 'react';
import { 
  HiArrowDownTray, 
  HiPrinter, 
  HiTableCells, 
  HiDocumentText,
  HiCheckCircle
} from 'react-icons/hi2';
import Modal from './ui/Modal';
import { calculateProgress, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

export default function ExportReportModal({ isOpen, onClose, tasks = [], projects = [] }) {
  const [reportType, setReportType] = useState('executive');

  function exportCSV() {
    if (tasks.length === 0) {
      toast.error('No tasks available to export');
      return;
    }

    const headers = ['ID', 'Title', 'Project', 'Priority', 'Status', 'Assignee', 'Deadline'];
    const rows = tasks.map(t => [
      `"${t.$id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.projectName || '').replace(/"/g, '""')}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.assigneeName || ''}"`,
      `"${t.deadline ? new Date(t.deadline).toLocaleDateString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexora_sprint_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded successfully!');
  }

  function handlePrint() {
    window.print();
  }

  const completed = tasks.filter(t => t.status === 'done').length;
  const progress = calculateProgress(tasks);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Executive Sprint Report"
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={exportCSV}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.06] transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <HiTableCells className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-400">Export Raw CSV</h4>
            <p className="text-xs text-gray-400">Download formatted tabular task data for Excel or Google Sheets.</p>
          </div>

          <div
            onClick={handlePrint}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.06] transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <HiPrinter className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-violet-400">Print / Save as PDF</h4>
            <p className="text-xs text-gray-400">Generate a branded executive document layout for stakeholder reviews.</p>
          </div>
        </div>

        {/* Printable Preview Container */}
        <div className="p-5 rounded-xl bg-navy-950 border border-white/10 space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-black text-white">NEXORA Executive Sprint Audit</h3>
              <p className="text-gray-400 text-[11px]">Sprint Status Overview • Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {progress}% Delivered
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-white/5">
              <div className="text-lg font-bold text-white">{projects.length}</div>
              <div className="text-[10px] text-gray-400">Active Projects</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5">
              <div className="text-lg font-bold text-white">{tasks.length}</div>
              <div className="text-[10px] text-gray-400">Total Work Items</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5">
              <div className="text-lg font-bold text-emerald-400">{completed}</div>
              <div className="text-[10px] text-gray-400">Completed Items</div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
