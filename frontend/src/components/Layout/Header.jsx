import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-2 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-500 hover:text-primary-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-5 w-5" />
      </button>

      {/* Separator */}
      <div className="h-5 w-px bg-slate-200 lg:hidden" />

      <div className="hidden md:flex flex-col">
        <span className="text-xs sm:text-sm font-semibold text-slate-900">CareerPrep Dashboard</span>
        <span className="text-xs text-slate-500">Focused coding interview preparation</span>
      </div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
        <div className="flex items-center gap-x-3 lg:gap-x-4">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 text-slate-400 hover:text-primary-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-4 w-4" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-5 lg:w-px lg:bg-slate-200" />

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 rounded-xl hover:bg-slate-50 transition-colors duration-200"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-indigo flex-shrink-0">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="hidden lg:flex lg:items-center ml-3">
                <span className="text-sm font-semibold text-slate-700">
                  {user?.name}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
