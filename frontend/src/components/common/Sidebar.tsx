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
import { NAV_ITEMS } from '../../utils/constants';
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
          fixed top-0 left-0 z-30 h-full w-72 flex flex-col
          bg-navy-900/95 backdrop-blur-xl border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-white/5">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="flex-shrink-0 bg-linear-to-br from-primary-500 to-primary-600 p-2 rounded-lg">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-base font-bold text-white tracking-tight block truncate">Transport</span>
              <span className="text-xs text-navy-400 block truncate">Management System</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden flex-shrink-0 p-2 text-navy-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - scrollable, footer never overlaps */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 px-2">
          <p className="px-3 mb-2 text-xs font-semibold text-navy-500 uppercase tracking-wider">Navigation</p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-primary-500/20 text-primary-400 border-l-2 border-primary-400'
                          : 'text-navy-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`flex-shrink-0 p-1.5 rounded-md mr-2.5 transition-colors ${
                          isActive 
                            ? 'bg-primary-500/20 text-primary-400' 
                            : 'bg-white/5 text-navy-400 group-hover:text-white group-hover:bg-white/10'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="truncate">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

      </aside>
    </>
  );
};
export default Sidebar;
