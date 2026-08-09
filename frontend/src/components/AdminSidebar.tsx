import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Shield, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: any;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: Users,
  },
  {
    label: 'Analytics',
    path: '/admin/analytics',
    icon: BarChart3,
    children: [
      { label: 'Overview', path: '/admin/analytics', icon: BarChart3 },
      { label: 'Feature Usage', path: '/admin/analytics/feature-usage', icon: BarChart3 },
      { label: 'AI Assistant', path: '/admin/analytics/ai', icon: MessageSquare },
      { label: 'Government Schemes', path: '/admin/analytics/government-schemes', icon: FileText },
      { label: 'Retention', path: '/admin/analytics/retention', icon: TrendingUp },
    ],
  },
  {
    label: 'Audit Log',
    path: '/admin/audit-log',
    icon: Shield,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Analytics']));

  const toggleSection = (label: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.label);
    const active = isActive(item.path);

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleSection(item.label)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
              active ? 'bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown className={`h-4 w-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </button>
          {isExpanded && !isCollapsed && item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <NavItemComponent key={child.path} item={child} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
          active ? 'bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
        }`}
        onClick={() => setIsMobileOpen(false)}
      >
        <item.icon className="h-5 w-5" />
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-800"
      >
        <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-slate-200 transition-all duration-300 dark:bg-slate-950 dark:border-slate-800 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-slate-950 dark:text-white">Bharat Sathi</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            {!isCollapsed && (
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-950 dark:text-white">
                  {user?.displayName || user?.email}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </div>
              </div>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition"
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
