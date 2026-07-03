import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { DepartmentTabs } from './DepartmentTabs';
import { useUIStore } from '../../store/uiStore';

export const AppLayout = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();
  const isDeptPage = location.pathname.startsWith('/department/');

  return (
    <div className="relative flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#eef2ff_68%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl" />
      </div>
      {/* Desktop sidebar */}
      <div className="relative z-10 hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        {isDeptPage && <DepartmentTabs />}
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
};
