// src/components/common/Sidebar.tsx

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
  X,
} from 'lucide-react';
import { NAV_ITEMS, APP_NAME } from '../../utils/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Route,
  Bus,
  MapPin,
  DollarSign,
  GitBranch,
  Link,
  Users,
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Bus className="w-8 h-8 text-blue-500" />
            <span className="text-lg font-bold">Transport</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            {APP_NAME} v1.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
