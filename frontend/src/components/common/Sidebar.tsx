import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Route,
  Bus,
  MapPin,
  DollarSign,
  GitBranch,
  Link,
  Users,
  UserPlus,
  X,
} from 'lucide-react';
import { NAV_ITEMS, APP_NAME } from '../../utils/constants';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Route,
  Bus,
  MapPin,
  DollarSign,
  GitBranch,
  Link,
  Users,
  UserPlus,
};
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-72 
          bg-navy-900/95 backdrop-blur-xl border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="bg-linear-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl shadow-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Transport</span>
              <p className="text-xs text-navy-400">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-navy-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <p className="px-4 mb-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Navigation</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-linear-to-r from-primary-500/20 to-primary-600/10 text-primary-400 border-l-2 border-primary-400 shadow-inner-glow'
                          : 'text-navy-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`p-1.5 rounded-lg mr-3 transition-colors ${
                          isActive 
                            ? 'bg-primary-500/20 text-primary-400' 
                            : 'bg-white/5 text-navy-400 group-hover:text-white group-hover:bg-white/10'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        {item.name}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-navy-500">
              {APP_NAME}
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 font-medium">
              v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
