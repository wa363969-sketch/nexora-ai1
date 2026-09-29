import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiMagnifyingGlass, 
  HiHome, 
  HiSparkles, 
  HiFolderOpen, 
  HiClipboardDocumentList, 
  HiUserGroup, 
  HiCalendarDays,
  HiChartBar, 
  HiCog6Tooth, 
  HiPlus, 
  HiSun, 
  HiMoon,
  HiCommandLine,
  HiBell,
  HiCreditCard,
  HiShieldCheck,
  HiArrowRight
} from 'react-icons/hi2';
import useStore from '../store/useStore';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, toggleSidebar } = useStore();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const isAdmin = user?.labels?.includes('admin') || user?.role === 'admin' || user?.email?.includes('admin');

  const commands = useMemo(() => {
    const list = [
      { id: 'dash', label: 'Go to Dashboard', category: 'Navigation', icon: HiHome, action: () => navigate('/dashboard') },
      { id: 'ai', label: 'Launch AI Assistant', category: 'Navigation', icon: HiSparkles, action: () => navigate('/ai-assistant') },
      { id: 'proj', label: 'View All Projects', category: 'Navigation', icon: HiFolderOpen, action: () => navigate('/projects') },
      { id: 'tasks', label: 'View Tasks Matrix', category: 'Navigation', icon: HiClipboardDocumentList, action: () => navigate('/tasks') },
      { id: 'kanban', label: 'Open Kanban Board', category: 'Navigation', icon: HiClipboardDocumentList, action: () => navigate('/kanban') },
      { id: 'cal', label: 'View Sprint Calendar', category: 'Navigation', icon: HiCalendarDays, action: () => navigate('/calendar') },
      { id: 'teams', label: 'Manage Teams', category: 'Navigation', icon: HiUserGroup, action: () => navigate('/teams') },
      { id: 'analytics', label: 'View Analytics', category: 'Navigation', icon: HiChartBar, action: () => navigate('/analytics') },
      { id: 'notifs', label: 'Open Notifications', category: 'Navigation', icon: HiBell, action: () => navigate('/notifications') },
      { id: 'billing', label: 'Manage Subscriptions & Billing', category: 'Navigation', icon: HiCreditCard, action: () => navigate('/subscriptions') },
      { id: 'settings', label: 'Open Settings', category: 'Navigation', icon: HiCog6Tooth, action: () => navigate('/settings') },
      
      // Actions
      { id: 'new-proj', label: 'Create New Project', category: 'Actions', icon: HiPlus, action: () => navigate('/projects?create=true') },
      { id: 'new-task', label: 'Create New Task', category: 'Actions', icon: HiPlus, action: () => navigate('/tasks?create=true') },
      { id: 'theme', label: `Toggle Theme (Current: ${theme})`, category: 'Actions', icon: theme === 'dark' ? HiSun : HiMoon, action: toggleTheme },
      { id: 'sidebar', label: 'Toggle Sidebar Collapse', category: 'Actions', icon: HiCommandLine, action: toggleSidebar },
    ];

    if (isAdmin) {
      list.push({
        id: 'admin',
        label: 'Admin Control Center',
        category: 'Administration',
        icon: HiShieldCheck,
        action: () => navigate('/admin'),
      });
    }

    if (!search.trim()) return list;

    const query = search.toLowerCase();
    return list.filter(cmd => 
      cmd.label.toLowerCase().includes(query) || 
      cmd.category.toLowerCase().includes(query)
    );
  }, [search, navigate, theme, toggleTheme, toggleSidebar, isAdmin]);

  // Global keydown listener for Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Keyboard navigation inside palette
  function handleInputKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (commands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + commands.length) % (commands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = commands[selectedIndex];
      if (selected) {
        selected.action();
        setCommandPaletteOpen(false);
      }
    }
  }

  function handleExecute(cmd) {
    cmd.action();
    setCommandPaletteOpen(false);
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setCommandPaletteOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-navy-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10">
              <HiMagnifyingGlass className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a command or jump to page..."
                className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
              />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-gray-400 shrink-0">
                ESC
              </span>
            </div>

            {/* Commands List */}
            <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
              {commands.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No matching commands found.
                </div>
              ) : (
                commands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleExecute(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white font-medium border border-blue-500/30'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-gray-400'}`}>
                          <cmd.icon className="w-4 h-4" />
                        </div>
                        <span>{cmd.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                          {cmd.category}
                        </span>
                        {isSelected && <HiArrowRight className="w-4 h-4 text-blue-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 bg-navy-950/60 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
              <span className="font-mono text-gray-400">NEXORA CLI</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
