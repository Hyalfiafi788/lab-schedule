import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, ClipboardCheck, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../store/uiStore';

export const BottomNav = () => {
  const location = useLocation();
  const { activeDepartment } = useUIStore();

  const navItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/',
      exact: true,
    },
    {
      label: 'Schedule',
      icon: <Calendar className="h-5 w-5" />,
      path: `/department/${activeDepartment}/monthly`,
    },
    {
      label: 'Staff',
      icon: <Users className="h-5 w-5" />,
      path: `/department/${activeDepartment}/staff`,
    },
    {
      label: 'Handover',
      icon: <ClipboardCheck className="h-5 w-5" />,
      path: `/department/${activeDepartment}/handover`,
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-bottom">
      <div className="flex items-stretch h-16">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-slate-400'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all duration-200',
                  active && 'bg-primary/10'
                )}
              >
                {item.icon}
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
