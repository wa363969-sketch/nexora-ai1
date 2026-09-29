import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  HiBars3, 
  HiMagnifyingGlass, 
  HiSun, 
  HiMoon, 
  HiBell, 
  HiUser, 
  HiCog6Tooth, 
  HiArrowLeftOnRectangle,
  HiPlus,
  HiCommandLine,
  HiCreditCard,
  HiShieldCheck,
  HiSparkles
} from 'react-icons/hi2';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import useStore from '../../store/useStore';
import Avatar from '../ui/Avatar';
import Dropdown, { DropdownItem } from '../ui/Dropdown';
import { getSubscription } from '../../services/dataService';

const PAGE_TITLES = {
  '/dashboard': 'Executive Dashboard',
  '/ai-assistant': 'NEXORA AI Co-Pilot',
  '/projects': 'Projects Portfolio',
  '/tasks': 'Task Matrix',
  '/kanban': 'Interactive Kanban',
  '/calendar': 'Sprint Calendar',
  '/teams': 'Team Workspaces',
  '/team-members': 'Directory & Members',
  '/analytics': 'Performance Analytics',
  '/notifications': 'Notification Center',
  '/profile': 'User Profile',
  '/settings': 'Account & Workspace Settings',
  '/subscriptions': 'Subscription & Quotas',
  '/admin': 'Admin Control Panel',
  '/help': 'Help Center & Guides',
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, setCommandPaletteOpen, unreadCount } = useStore();
  const [sub, setSub] = useState(null);

  useEffect(() => {
    getSubscription().then(setSub).catch(() => {});
    const onChange = (e) => { if (e.detail) setSub(e.detail); };
    window.addEventListener('nexora-subscription-changed', onChange);
    return () => window.removeEventListener('nexora-subscription-changed', onChange);
  }, []);

  const title = PAGE_TITLES[location.pathname] || 'Workspace';
  const isAdmin = user?.labels?.includes('admin') || user?.role === 'admin' || user?.email?.includes('admin');

  return (
    <header className="h-16 bg-navy-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <HiBars3 className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle search pill / Command palette trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-300 text-xs sm:text-sm transition-all"
        >
          <span className="flex items-center gap-2">
            <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            Search projects, tasks, commands...
          </span>
          <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-mono text-gray-400">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Action items */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Plan Pill Badge */}
        {sub && (
          <Link
            to="/subscriptions"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all shadow-sm ${
              sub.planId === 'enterprise'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : sub.planId === 'pro'
                ? 'bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20'
                : 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
            }`}
            title="Manage Workspace Plan & Quotas"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{sub.planName || 'Plan'}</span>
            {sub.status === 'trialing' && (
              <span className="text-[9px] px-1 rounded bg-amber-400/20 text-amber-300">Trial</span>
            )}
          </Link>
        )}

        {/* Quick Command Button for mobile */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg md:hidden"
          title="Command Palette"
        >
          <HiCommandLine className="w-5 h-5" />
        </button>

        {/* Theme switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg relative transition-colors"
          title="Notifications"
        >
          <HiBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-navy-900" />
          )}
        </Link>

        {/* User Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/40 transition-all">
              <Avatar name={user?.name || 'User'} size="sm" />
            </button>
          }
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Workspace User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || 'user@nexora.io'}</p>
            {isAdmin && (
              <span className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Administrator
              </span>
            )}
          </div>

          <DropdownItem icon={HiUser} onClick={() => navigate('/profile')}>
            Profile Overview
          </DropdownItem>
          <DropdownItem icon={HiCreditCard} onClick={() => navigate('/subscriptions')}>
            Billing & Plans
          </DropdownItem>
          <DropdownItem icon={HiCog6Tooth} onClick={() => navigate('/settings')}>
            Account Settings
          </DropdownItem>
          {isAdmin && (
            <DropdownItem icon={HiShieldCheck} onClick={() => navigate('/admin')}>
              Admin Console
            </DropdownItem>
          )}

          <div className="border-t border-white/10 my-1" />

          <DropdownItem
            icon={HiArrowLeftOnRectangle}
            danger
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
