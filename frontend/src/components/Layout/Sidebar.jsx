import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Brain,
  User,
  TrendingUp,
  BookOpen,
  ClipboardList,
  Shield,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Interview', href: '/interview', icon: Brain },
  { name: 'Quick Practice', href: '/quick-practice', icon: ClipboardList },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Preparation Guide', href: '/preparation-guide', icon: BookOpen },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Admin', href: '/admin', icon: Shield },
  { name: 'Question Bank', href: '/admin/coding-questions', icon: ClipboardList },
  { name: 'Quick Practice Bank', href: '/admin/quick-practice-questions', icon: ClipboardList },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const items = user?.role === 'admin' ? [...navigation, ...adminNavigation] : navigation;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-secondary-200 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2"
            >
              <img
                src="/image.png"
                alt="CareerPrep Ai"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold gradient-text">CareerPrep Ai</span>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {items.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <motion.li
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <NavLink
                          to={item.href}
                          className={`
                            nav-link group
                            ${isActive ? 'nav-link-active' : 'nav-link-inactive'}
                          `}
                        >
                          <item.icon
                            className={`
                              mr-3 h-5 w-5 shrink-0
                              ${isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-600'}
                            `}
                          />
                          {item.name}
                        </NavLink>
                      </motion.li>
                    );
                  })}
                </ul>
              </li>

              {/* User section */}
              <li className="mt-auto">
                <div className="border-t border-secondary-200 pt-4">
                  {/* User info */}
                  <div className="flex items-center px-3 py-2 mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-secondary-500 truncate">
                        {user?.subscription?.plan || 'Free'} Plan
                      </p>
                    </div>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="nav-link nav-link-inactive w-full text-left"
                  >
                    <LogOut className="mr-3 h-5 w-5 shrink-0 text-secondary-400 group-hover:text-secondary-600" />
                    Sign out
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed inset-y-0 z-50 flex w-64 flex-col lg:hidden"
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-secondary-200 px-6 pb-4">
          {/* Header with close button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="/image.png"
                alt="CareerPrep Ai"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold gradient-text">CareerPrep Ai</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation - same as desktop */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {items.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <motion.li
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <NavLink
                          to={item.href}
                          onClick={onClose}
                          className={`
                            nav-link group
                            ${isActive ? 'nav-link-active' : 'nav-link-inactive'}
                          `}
                        >
                          <item.icon
                            className={`
                              mr-3 h-5 w-5 shrink-0
                              ${isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-600'}
                            `}
                          />
                          {item.name}
                        </NavLink>
                      </motion.li>
                    );
                  })}
                </ul>
              </li>

              {/* User section */}
              <li className="mt-auto">
                <div className="border-t border-secondary-200 pt-4">
                  {/* User info */}
                  <div className="flex items-center px-3 py-2 mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-secondary-500 truncate">
                        {user?.subscription?.plan || 'Free'} Plan
                      </p>
                    </div>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="nav-link nav-link-inactive w-full text-left"
                  >
                    <LogOut className="mr-3 h-5 w-5 shrink-0 text-secondary-400 group-hover:text-secondary-600" />
                    Sign out
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
