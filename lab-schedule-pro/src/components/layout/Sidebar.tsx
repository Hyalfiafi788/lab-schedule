import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  BarChart3,
  FileText,
  Settings,
  X,
  Droplets,
  FlaskConical,
  Microscope,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../store/uiStore';
import { DEPARTMENTS } from '../../data/departments';
import type { DepartmentId } from '../../types';

const DEPT_ICONS: Record<DepartmentId, React.ReactNode> = {
  hematology: <Droplets className="h-4 w-4" />,
  biochemistry: <FlaskConical className="h-4 w-4" />,
  microbiology: <Microscope className="h-4 w-4" />,
  reception: <ClipboardList className="h-4 w-4" />,
};

const deptNavItems = [
  { path: 'monthly', label: 'Monthly', icon: <Calendar className="h-4 w-4" /> },
  { path: 'weekly', label: 'Weekly', icon: <CalendarDays className="h-4 w-4" /> },
  { path: 'staff', label: 'Staff', icon: <Users className="h-4 w-4" /> },
  { path: 'statistics', label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
  { path: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
];

interface SidebarProps {
  mobile?: boolean;
}

export const Sidebar = ({ mobile = false }: SidebarProps) => {
  const location = useLocation();
  const { activeDepartment, setActiveDepartment, setSidebarOpen } = useUIStore();
  const [expandedDept, setExpandedDept] = React.useState<DepartmentId | null>(activeDepartment);

  const handleClose = () => setSidebarOpen(false);

  const handleDeptClick = (deptId: DepartmentId) => {
    setActiveDepartment(deptId);
    setExpandedDept(expandedDept === deptId ? null : deptId);
  };

  return (
    <aside className="flex h-full w-72 flex-col overflow-y-auto bg-[linear-gradient(180deg,#071629_0%,#0d2137_45%,#111827_100%)] text-white shadow-2xl shadow-slate-950/30 scrollbar-thin">
      {/* Logo */}
      <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-700 shadow-lg shadow-blue-950/40 ring-1 ring-white/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <div>
            <div className="text-base font-black leading-none tracking-tight">Lab Schedule</div>
            <div className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
              Pro Suite
            </div>
          </div>
        </div>
        {mobile && (
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
        </div>
      </div>

      {/* Main nav */}
      <nav className="px-3 pt-4 pb-2">
        <NavLink
          to="/"
          end
          onClick={mobile ? handleClose : undefined}
          className={({ isActive }) =>
            cn(
              'mb-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-950/30'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            )
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </NavLink>
      </nav>

      {/* Departments */}
      <div className="px-3 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 px-3 mb-2">
          Departments
        </p>
        <div className="space-y-0.5">
          {DEPARTMENTS.map((dept) => {
            const isExpanded = expandedDept === dept.id;
            return (
              <div key={dept.id}>
                <button
                  onClick={() => handleDeptClick(dept.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                    isExpanded
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10"
                    style={{ backgroundColor: `${dept.color}30`, color: dept.color }}
                  >
                    {DEPT_ICONS[dept.id]}
                  </span>
                  <span className="flex-1 text-left">{dept.name}</span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 text-white/40 transition-transform duration-200',
                      isExpanded && 'rotate-90'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pr-1 py-1 space-y-0.5">
                        {deptNavItems.map((item) => {
                          const fullPath = `/department/${dept.id}/${item.path}`;
                          const isActive = location.pathname === fullPath;
                          return (
                            <NavLink
                              key={item.path}
                              to={fullPath}
                              onClick={mobile ? handleClose : undefined}
                              className={cn(
                                'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-200',
                                isActive
                                  ? 'bg-blue-500 text-white shadow-sm shadow-blue-950/20'
                                  : 'text-white/60 hover:bg-white/10 hover:text-white'
                              )}
                            >
                              {item.icon}
                              {item.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-white/10">
        <NavLink
          to="/settings"
          onClick={mobile ? handleClose : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            )
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
};
