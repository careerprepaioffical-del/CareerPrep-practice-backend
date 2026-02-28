import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Swords,
  User,
  BarChart2,
  BookOpen,
  ListChecks,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  GraduationCap,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Interview', href: '/interview', icon: Swords },
  { name: 'Quick Practice', href: '/quick-practice', icon: ListChecks },
  { name: 'Progress', href: '/progress', icon: BarChart2 },
  { name: 'Preparation Sheet', href: '/preparation-guide', icon: BookOpen },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: ShieldCheck },
  { name: 'Question Bank', href: '/admin/coding-questions', icon: Database },
  { name: 'Quick Practice Bank', href: '/admin/quick-practice-questions', icon: ListChecks },
  { name: 'Preparation Sheet Bank', href: '/admin/preparation-sheet', icon: BookOpen },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  const NavItems = ({ onItemClick }) => (
    <nav className="flex flex-1 flex-col px-2 sm:px-4">
      <ul className="flex flex-1 flex-col gap-y-1 sm:gap-y-0.5">
        <li>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-1">Menu</p>
          <ul className="space-y-0.5">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              return (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                >
                  <NavLink
                    to={item.href}
                    onClick={onItemClick}
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-primary-600 text-white shadow-glow-indigo'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <item.icon
                      className={`mr-3 h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'
                      }`}
                    />
                    {item.name}
                  </NavLink>
                </motion.li>
              );
            })}
          </ul>
        </li>
        <li>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-1">Quick Links</p>
          <ul className="space-y-0.5">
            {[
              { name: 'Contest Board', href: 'https://contest.careerprep.tech', icon: Swords },
              { name: 'Resume Builder', href: 'https://resumegenie.careerprep.tech', icon: BookOpen },
              { name: 'Resume Optimizer', href: 'https://resumegenieai.careerprep.tech', icon: ShieldCheck },
              { name: 'Code Analyser', href: 'https://codeanalyser.careerprep.tech', icon: BarChart2 },
              { name: 'Patterns (Similar Qs)', href: 'https://patterns.careerprep.tech', icon: ListChecks },
              { name: 'Company Sheets', href: 'https://interview.careerprep.tech', icon: Database },
              { name: 'University Notes', href: 'https://notes.careerprep.tech', icon: GraduationCap }
            ].map((item, index) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <item.icon className="mr-3 h-4 w-4 shrink-0 transition-colors text-slate-500 group-hover:text-slate-200" />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </li>

        {user?.role === 'admin' && (
          <li className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Admin</p>
            <ul className="space-y-0.5">
              {adminNavigation.map((item, index) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.2 }}
                  >
                    <NavLink
                      to={item.href}
                      onClick={onItemClick}
                      className={`
                        group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                        ${isActive
                          ? 'bg-primary-600 text-white shadow-glow-indigo'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <item.icon
                        className={`mr-3 h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'
                        }`}
                      />
                      {item.name}
                    </NavLink>
                  </motion.li>
                );
              })}
            </ul>
          </li>
        )}

        {/* User section */}
        <li className="mt-auto pt-4 border-t border-white/10">
          <div className="space-y-1">
            <div className="flex items-center px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="ml-2.5 flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">Premium Plan</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="mr-3 h-4 w-4 shrink-0 group-hover:text-red-300 transition-colors" />
              Sign out
            </button>
          </div>
        </li>
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-4 overflow-y-auto bg-sidebar-950 border-r border-white/10 px-4 pb-4 shadow-xl">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2.5"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow-indigo">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold text-white tracking-tight">CareerPrep</span>
                <span className="text-xs font-semibold text-slate-400 tracking-wide">Practice Platform</span>
              </div>
            </motion.div>
          </div>

          <NavItems onItemClick={undefined} />
        </div>
      </div>

      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className="fixed inset-y-0 z-50 flex w-64 flex-col lg:hidden"
      >
        <div className="flex grow flex-col gap-y-4 overflow-y-auto bg-sidebar-950 border-r border-white/10 px-4 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow-indigo">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold text-white tracking-tight">CareerPrep</span>
                <span className="text-xs font-semibold text-slate-400 tracking-wide">Practice Platform</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <NavItems onItemClick={onClose} />
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
