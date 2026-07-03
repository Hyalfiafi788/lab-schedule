import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatMonth } from '../../utils/schedule';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/settings') return 'Settings';
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'department' && parts.length >= 3) {
    const deptName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    const section = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
    return `${deptName} — ${section}`;
  }
  return 'LAB Schedule Pro';
};

export const Header = () => {
  const location = useLocation();
  const { setSidebarOpen, currentMonth, prevMonth, nextMonth, searchQuery, setSearchQuery } = useUIStore();
  const { settings } = useSettingsStore();
  const [showSearch, setShowSearch] = React.useState(false);

  const isSchedulePage =
    location.pathname.includes('/monthly') || location.pathname.includes('/weekly');

  const title = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 shadow-sm shadow-slate-200/40 backdrop-blur-2xl">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        {/* Mobile menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold text-slate-950 truncate">{title}</h1>
            <span className="hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm sm:inline-flex">
              Pro
            </span>
          </div>
          <p className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            {settings.hospitalName}
          </p>
        </div>

        {/* Month navigator (only on schedule pages) */}
        {isSchedulePage && (
          <div className="hidden sm:flex items-center gap-1 rounded-2xl border border-slate-200/70 bg-white/70 p-1 shadow-inner">
            <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-slate-700 px-2 min-w-[130px] text-center">
              {formatMonth(currentMonth)}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Search toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 rounded-xl border border-transparent text-slate-600 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl border border-transparent text-slate-600 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>
      </div>

      {/* Expandable search bar */}
      {showSearch && (
        <div className="px-4 pb-3 md:px-6">
          <Input
            placeholder="Search staff, department, schedule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            autoFocus
            className="bg-white/80 shadow-sm"
          />
        </div>
      )}

      {/* Mobile month navigator */}
      {isSchedulePage && (
        <div className="sm:hidden flex items-center justify-center gap-2 pb-2 px-4">
          <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-slate-700 flex-1 text-center">
            {formatMonth(currentMonth)}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </header>
  );
};
