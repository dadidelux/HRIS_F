import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  UserCircle2,
  HelpCircle,
  LogOut,
  ChevronDown,
  Search,
  ClipboardList,
  Target,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onLogout: () => void;
}

type UserRole = 'candidate' | 'hr' | 'admin';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  roles: UserRole[];
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user } = useAuth();

  // Define all menu items with role access
  const allMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['candidate', 'hr', 'admin'] },
    { id: 'jobs', label: 'Browse Jobs', icon: Search, path: '/jobs', roles: ['candidate'] },
    { id: 'job-postings', label: 'Job Postings', icon: Briefcase, path: '/job-postings', roles: ['hr', 'admin'] },
    { id: 'my-applications', label: 'My Applications', icon: ClipboardList, path: '/my-applications', roles: ['candidate'] },
    { id: 'applications', label: 'Applications', icon: Users, path: '/applications', roles: ['hr', 'admin'] },
    { id: 'my-interviews', label: 'My Interviews', icon: Calendar, path: '/my-interviews', roles: ['candidate'] },
    { id: 'interviews', label: 'Interviews', icon: Calendar, path: '/interviews', roles: ['hr', 'admin'] },
    { id: 'matching', label: 'Candidate Matching', icon: Target, path: '/matching', roles: ['hr', 'admin'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['hr', 'admin'] },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports', roles: ['hr', 'admin'] },
  ];

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    const userRole = (user?.role || 'candidate') as UserRole;
    return allMenuItems.filter(item => item.roles.includes(userRole));
  }, [user?.role]);

  return (
    <div className="w-64 bg-[#0a2647] min-h-screen text-white flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#144272]">
        <h1 className="text-xl font-bold">HRIS</h1>
      </div>

      {/* User Profile Dropdown */}
      {user && (
        <div className="p-4 border-b border-[#144272]">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#144272] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.full_name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <UserCircle2 size={24} />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
            <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUserMenuOpen && (
            <div className="mt-2 bg-[#144272] rounded-lg overflow-hidden">
              <NavLink
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a5490] transition-colors"
              >
                <UserCircle2 size={18} />
                <span className="text-sm">Profile</span>
              </NavLink>
              <NavLink
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a5490] transition-colors"
              >
                <Settings size={18} />
                <span className="text-sm">Settings</span>
              </NavLink>
              <NavLink
                to="/help"
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a5490] transition-colors"
              >
                <HelpCircle size={18} />
                <span className="text-sm">Help Center</span>
              </NavLink>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a5490] transition-colors text-left text-red-400"
              >
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-[#144272] hover:text-white'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
