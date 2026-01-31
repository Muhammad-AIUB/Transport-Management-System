import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-navy-800/50 backdrop-blur-xl border-b border-white/5 h-20 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl text-navy-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="ml-2 lg:ml-0">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Transport Management
          </h1>
          <p className="text-xs text-navy-400 hidden sm:block">Manage your fleet efficiently</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {/* Notification bell */}
        <button className="relative p-2.5 text-navy-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-navy-800"></span>
        </button>

        {/* User profile dropdown */}
        <div className="relative flex items-center pl-3 border-l border-white/10">
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-navy-400">Transport Manager</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-lg">
              <User className="w-5 h-5" />
            </div>
            <ChevronDown className={`w-4 h-4 text-navy-400 transition-transform duration-200 hidden sm:block ${showLogout ? 'rotate-180' : ''}`} />
          </button>

          {showLogout && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLogout(false)} />
              <div className="absolute right-0 top-full mt-2 py-2 w-48 bg-navy-800/95 backdrop-blur-xl rounded-xl shadow-glass-lg border border-white/10 z-20 animate-fade-in">
                <div className="px-4 py-2 border-b border-white/5 sm:hidden">
                  <p className="text-sm font-semibold text-white">Admin User</p>
                  <p className="text-xs text-navy-400">Transport Manager</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
