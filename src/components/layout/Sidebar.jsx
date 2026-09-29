import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HiHome, 
  HiSparkles, 
  HiFolderOpen, 
  HiClipboardDocumentList, 
  HiViewColumns,
  HiUserGroup, 
  HiCalendarDays, 
  HiChartBar, 
  HiBell, 
  HiCog6Tooth, 
  HiShieldCheck, 
  HiArrowLeftOnRectangle, 
  HiChevronDoubleLeft, 
  HiChevronDoubleRight,
  HiCreditCard,
  HiUserCircle,
  HiQuestionMarkCircle,
  HiTv
} from 'react-icons/hi2';
import { useAuth } from '../../contexts/AuthContext';
import useStore from '../../store/useStore';
import Avatar from '../ui/Avatar';
import { getSubscription } from '../../services/dataService';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed, unreadCount } = useStore();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);

  useEffect(() => {
    getSubscription().then(setSub).catch(() => {});
    const onChange = (e) => { if (e.detail) setSub(e.detail); };
    window.addEventListener('nexora-subscription-changed', onChange);
    return () => window.removeEventListener('nexora-subscription-changed', onChange);
  }, []);

  const isAdmin = user?.labels?.includes('admin') || user?.role === 'admin' || user?.email?.includes('admin') || user?.email === 'wa363969@gmail.com';

  const navSections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: HiHome, path: '/dashboard' },
        { label: 'AI Assistant', icon: HiSparkles, path: '/ai-assistant', badge: 'AI' },
        { label: 'Video Guide', icon: HiTv, path: '/video-guide', badge: 'PRO' },
        { label: 'Projects', icon: HiFolderOpen, path: '/projects' },
        { label: 'Tasks', icon: HiClipboardDocumentList, path: '/tasks' },
        { label: 'Kanban Board', icon: HiViewColumns, path: '/kanban' },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { label: 'Calendar', icon: HiCalendarDays, path: '/calendar' },
        { label: 'Teams', icon: HiUserGroup, path: '/teams' },
        { label: 'Team Members', icon: HiUserGroup, path: '/team-members' },
        { label: 'Analytics', icon: HiChartBar, path: '/analytics' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Notifications', icon: HiBell, path: '/notifications', count: unreadCount },
        { label: 'User Profile', icon: HiUserCircle, path: '/profile' },
        { label: 'Subscriptions', icon: HiCreditCard, path: '/subscriptions', badge: sub?.planName?.split(' ')[0] },
        { label: 'Settings', icon: HiCog6Tooth, path: '/settings' },
        { label: 'Help Center', icon: HiQuestionMarkCircle, path: '/help' },
      ],
    },
  ];

  if (isAdmin) {
    navSections.push({
      title: 'Administration',
      items: [
        { label: 'Admin Console', icon: HiShieldCheck, path: '/admin', badge: 'Admin' },
      ],
    });
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-navy-900 border-r border-white/10 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      } ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-blue-500/20">
            N
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white via-blue-200 to-violet-300 bg-clip-text text-transparent">
                NEXORA
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                AI Workspace
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <HiChevronDoubleRight className="w-4 h-4" />
          ) : (
            <HiChevronDoubleLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!sidebarCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {sec.title}
              </div>
            )}
            {sec.items.map((item, i) => (
              <NavLink
                key={i}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white border-l-2 border-blue-400 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-blue-400 transition-colors" />
                {!sidebarCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {item.badge}
                  </span>
                )}
                {!sidebarCollapsed && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                    {item.count}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-white/10 bg-navy-950/60">
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : 'p-2'}`}>
          <NavLink to="/profile" className="shrink-0">
            <Avatar name={user?.name || 'User'} size={sidebarCollapsed ? 'sm' : 'md'} />
          </NavLink>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <NavLink to="/profile" className="block text-sm font-semibold text-white hover:text-blue-300 truncate">
                {user?.name || 'Workspace User'}
              </NavLink>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'user@nexora.io'}</p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <HiArrowLeftOnRectangle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
