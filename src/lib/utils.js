import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date) {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date) {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(deadline) {
  if (!deadline) return false;
  return isBefore(new Date(deadline), new Date());
}

export function isDueSoon(deadline, days = 3) {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  return isAfter(deadlineDate, now) && isBefore(deadlineDate, addDays(now, days));
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function truncate(str, length = 100) {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
}

export function getStatusColor(status) {
  const colors = {
    'todo': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'in-review': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'done': 'bg-green-500/20 text-green-400 border-green-500/30',
    'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
    'backlog': 'bg-gray-500/20 text-gray-500 border-gray-500/30',
    'active': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
    'archived': 'bg-gray-500/20 text-gray-500 border-gray-500/30',
    'on-hold': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };
  return colors[status?.toLowerCase()] || colors.todo;
}

export function getPriorityColor(priority) {
  const colors = {
    'urgent': 'bg-red-500/20 text-red-400 border-red-500/30',
    'high': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'low': 'bg-green-500/20 text-green-400 border-green-500/30',
    'none': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return colors[priority?.toLowerCase()] || colors.none;
}

export function getPriorityIcon(priority) {
  const icons = { urgent: '🔴', high: '🟠', medium: '🟡', low: '🟢', none: '⚪' };
  return icons[priority?.toLowerCase()] || '⚪';
}

export function calculateProgress(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const TASK_STATUSES = ['backlog', 'todo', 'in-progress', 'in-review', 'done', 'cancelled'];
export const PROJECT_STATUSES = ['active', 'on-hold', 'completed', 'archived'];
export const PRIORITIES = ['urgent', 'high', 'medium', 'low', 'none'];
export const PROJECT_CATEGORIES = ['Development', 'Design', 'Marketing', 'Sales', 'Operations', 'Research', 'Support', 'Other'];
