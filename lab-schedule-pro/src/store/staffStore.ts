import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { electronStorage } from './electron-storage';
import type { Staff, DepartmentId } from '../types';
import { INITIAL_STAFF } from '../data/staff';

interface StaffState {
  staff: Staff[];
  addStaff: (member: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  removeStaff: (id: string) => void;
  getStaffByDepartment: (departmentId: DepartmentId) => Staff[];
  getStaffById: (id: string) => Staff | undefined;
  adjustVacationBalance: (staffId: string, days: number) => void;
}

export const useStaffStore = create<StaffState>()(
  persist(
    (set, get) => ({
      staff: INITIAL_STAFF,

      addStaff: (member) => {
        const id = `${member.departmentId}-${Date.now()}`;
        set({ staff: [...get().staff, { ...member, id }] });
      },

      updateStaff: (id, updates) => {
        set({
          staff: get().staff.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        });
      },

      removeStaff: (id) => {
        set({ staff: get().staff.filter((s) => s.id !== id) });
      },

      getStaffByDepartment: (departmentId) => {
        return get().staff.filter((s) => s.departmentId === departmentId && s.isActive);
      },

      getStaffById: (id) => {
        return get().staff.find((s) => s.id === id);
      },

      adjustVacationBalance: (staffId, days) => {
        set({
          staff: get().staff.map((s) =>
            s.id === staffId ? { ...s, vacationBalance: Math.max(0, s.vacationBalance + days) } : s
          ),
        });
      },
    }),
    {
      name: 'lab-staff-data',
      storage: electronStorage,
    }
  )
);
