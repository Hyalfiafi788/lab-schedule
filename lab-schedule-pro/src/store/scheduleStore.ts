import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { electronStorage } from './electron-storage';
import dayjs from 'dayjs';
import type { ScheduleEntry, DepartmentId, ShiftType, ConflictError } from '../types';
import { getShiftDefinition } from '../data/shifts';

interface ScheduleState {
  entries: ScheduleEntry[];
  setShift: (staffId: string, departmentId: DepartmentId, date: string, shift: ShiftType) => ConflictError | null;
  removeShift: (staffId: string, date: string) => void;
  bulkSetShifts: (entries: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  getShift: (staffId: string, date: string) => ScheduleEntry | undefined;
  getStaffMonthEntries: (staffId: string, month: string) => ScheduleEntry[];
  getDepartmentMonthEntries: (departmentId: DepartmentId, month: string) => ScheduleEntry[];
  getWeekEntries: (departmentId: DepartmentId, weekStart: string) => ScheduleEntry[];
  clearDepartmentMonth: (departmentId: DepartmentId, month: string) => void;
  validateShift: (staffId: string, date: string, shift: ShiftType, allEntries: ScheduleEntry[]) => ConflictError | null;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      entries: [],

      validateShift: (staffId, date, shift, allEntries) => {
        const existing = allEntries.find((e) => e.staffId === staffId && e.date === date);
        if (existing && existing.shift === shift) return null;

        const shiftDef = getShiftDefinition(shift);
        if (!shiftDef.isWorking) return null;

        const targetDay = dayjs(date);
        const weekStart = targetDay.startOf('week');
        const weekEntries = allEntries.filter(
          (e) =>
            e.staffId === staffId &&
            dayjs(e.date).isSameOrAfter(weekStart) &&
            dayjs(e.date).isBefore(weekStart.add(7, 'day'))
        );

        const weeklyHours = weekEntries.reduce((sum, e) => {
          const def = getShiftDefinition(e.shift);
          return sum + (def.hours ?? 0);
        }, shiftDef.hours ?? 0);

        if (weeklyHours > 60) {
          return {
            type: 'max_hours',
            message: `Maximum weekly hours (60h) would be exceeded. Current: ${weeklyHours - (shiftDef.hours ?? 0)}h`,
            staffId,
            date,
          };
        }

        return null;
      },

      setShift: (staffId, departmentId, date, shift) => {
        const { entries, validateShift } = get();
        const conflict = validateShift(staffId, date, shift, entries);
        if (conflict) return conflict;

        const now = new Date().toISOString();
        const existing = entries.find((e) => e.staffId === staffId && e.date === date);

        if (existing) {
          set({
            entries: entries.map((e) =>
              e.staffId === staffId && e.date === date
                ? { ...e, shift, departmentId, updatedAt: now }
                : e
            ),
          });
        } else {
          const newEntry: ScheduleEntry = {
            id: `${staffId}-${date}`,
            staffId,
            departmentId,
            date,
            shift,
            createdAt: now,
            updatedAt: now,
          };
          set({ entries: [...entries, newEntry] });
        }
        return null;
      },

      removeShift: (staffId, date) => {
        set({ entries: get().entries.filter((e) => !(e.staffId === staffId && e.date === date)) });
      },

      bulkSetShifts: (newEntries) => {
        const now = new Date().toISOString();
        const { entries } = get();
        const updatedMap = new Map(entries.map((e) => [`${e.staffId}-${e.date}`, e]));
        newEntries.forEach((ne) => {
          const key = `${ne.staffId}-${ne.date}`;
          updatedMap.set(key, {
            ...ne,
            id: key,
            createdAt: updatedMap.get(key)?.createdAt ?? now,
            updatedAt: now,
          });
        });
        set({ entries: Array.from(updatedMap.values()) });
      },

      getShift: (staffId, date) => {
        return get().entries.find((e) => e.staffId === staffId && e.date === date);
      },

      getStaffMonthEntries: (staffId, month) => {
        return get().entries.filter(
          (e) => e.staffId === staffId && e.date.startsWith(month)
        );
      },

      getDepartmentMonthEntries: (departmentId, month) => {
        return get().entries.filter(
          (e) => e.departmentId === departmentId && e.date.startsWith(month)
        );
      },

      getWeekEntries: (departmentId, weekStart) => {
        const start = dayjs(weekStart);
        const end = start.add(7, 'day');
        return get().entries.filter(
          (e) =>
            e.departmentId === departmentId &&
            dayjs(e.date).isSameOrAfter(start) &&
            dayjs(e.date).isBefore(end)
        );
      },

      clearDepartmentMonth: (departmentId, month) => {
        set({
          entries: get().entries.filter(
            (e) => !(e.departmentId === departmentId && e.date.startsWith(month))
          ),
        });
      },
    }),
    {
      name: 'lab-schedule-entries',
      storage: electronStorage,
    }
  )
);
