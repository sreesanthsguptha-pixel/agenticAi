import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  GitFork,
  PlayCircle,
  KeyRound,
  Settings,
  Wand2,
  Bell,
  LogOut,
  User,
  ShieldAlert,
  Bot,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import NotificationDrawer from '../NotificationDrawer';

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Builder', path: '/workflows/builder', icon: Wand2 },
    { label: 'Workflows', path: '/workflows', icon: GitFork },
    { label: 'Executions', path: '/executions', icon: PlayCircle },
    { label: 'Integrations', path: '/integrations', icon: KeyRound },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const bottomNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Builder', path: '/workflows/builder', icon: Wand2 },
    { label: 'Workflows', path: '/workflows', icon: GitFork },
    { label: 'Executions', path: '/executions', icon: PlayCircle },
    { label: 'Integrations', path: '/integrations', icon: KeyRound },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Sidebar Navigation (Desktop static, Mobile slide-over drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between z-40 transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Agentflow
                </span>
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono font-semibold">
                  AI
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.path || (item.path !== '/dashboard' && router.pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-850/60 border border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30 shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Operator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Header */}
        <header className="h-16 px-4 md:px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 md:hidden flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                System Ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
            </button>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 pb-20 md:pb-8">{children}</main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 z-20 flex items-center justify-around py-2 px-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.path || (item.path !== '/dashboard' && router.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}

