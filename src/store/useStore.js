import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: false,
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Command palette
  commandPaletteOpen: false,
  toggleCommandPalette: () => set(state => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Notifications
  notifications: [],
  unreadCount: 0,
  notificationPanelOpen: false,
  setNotifications: (notifications) => set({ notifications, unreadCount: notifications.filter(n => !n.read).length }),
  addNotification: (notification) => set(state => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),
  markAsRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.$id === id ? { ...n, read: true } : n),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  markAllAsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  toggleNotificationPanel: () => set(state => ({ notificationPanelOpen: !state.notificationPanelOpen })),

  // Global search
  searchQuery: '',
  searchResults: [],
  searchOpen: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchOpen: (open) => set({ searchOpen: open }),

  // Active project/team context
  activeProject: null,
  activeTeam: null,
  setActiveProject: (project) => set({ activeProject: project }),
  setActiveTeam: (team) => set({ activeTeam: team }),

  // View preferences
  taskView: 'board',
  setTaskView: (view) => set({ taskView: view }),
  projectView: 'grid',
  setProjectView: (view) => set({ projectView: view }),
}));

export default useStore;
