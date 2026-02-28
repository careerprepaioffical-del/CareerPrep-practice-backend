import React, { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

const ChatBot = lazy(() => import('../UI/ChatBot'));

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="lg:pl-64 pt-0 sm:pt-0">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="py-4 sm:py-6 bg-white">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* ChatBot */}
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
};

export default Layout;
