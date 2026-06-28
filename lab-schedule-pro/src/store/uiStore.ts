import { create } from 'zustand';
import type { DepartmentId } from '../types';
import dayjs from 'dayjs';

interface UIState {
  activeDepartment: DepartmentId;
  currentMonth: string; // YYYY-MM
  sidebarOpen: boolean;
  searchQuery: string;
  setActiveDepartment: (id: DepartmentId) => void;
  setCurrentMonth: (month: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  activeDepartment: 'hematology',
  currentMonth: dayjs().format('YYYY-MM'),
  sidebarOpen: false,
  searchQuery: '',

  setActiveDepartment: (id) => set({ activeDepartment: id }),
  setCurrentMonth: (month) => set({ currentMonth: month }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  prevMonth: () => {
    const prev = dayjs(get().currentMonth + '-01').subtract(1, 'month').format('YYYY-MM');
    set({ currentMonth: prev });
  },

  nextMonth: () => {
    const next = dayjs(get().currentMonth + '-01').add(1, 'month').format('YYYY-MM');
    set({ currentMonth: next });
  },
}));
