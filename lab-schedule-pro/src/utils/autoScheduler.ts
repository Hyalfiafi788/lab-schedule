import dayjs from 'dayjs';
import type { DepartmentId, ScheduleEntry, ShiftType, Staff } from '../types';
import { getDaysInMonth, isWeekend } from './schedule';
import { getShiftDefinition } from '../data/shifts';

interface AutoScheduleOptions {
  departmentId: DepartmentId;
  month: string;
  staff: Staff[];
  existingEntries: ScheduleEntry[];
}

interface StaffLoad {
  staff: Staff;
  hours: number;
  nights: number;
  weekends: number;
  lastShift?: ShiftType;
}

const workingHours = (shift: ShiftType) => getShiftDefinition(shift).hours ?? 0;

const buildInitialLoads = (staff: Staff[], existingEntries: ScheduleEntry[], month: string): StaffLoad[] => {
  return staff.map((member) => {
    const memberEntries = existingEntries.filter((entry) => entry.staffId === member.id && entry.date.startsWith(month));
    return {
      staff: member,
      hours: memberEntries.reduce((total, entry) => total + workingHours(entry.shift), 0),
      nights: memberEntries.filter((entry) => entry.shift === 'night').length,
      weekends: memberEntries.filter((entry) => isWeekend(entry.date) && getShiftDefinition(entry.shift).isWorking).length,
      lastShift: memberEntries.at(-1)?.shift,
    };
  });
};

const chooseStaff = (loads: StaffLoad[], date: string, shift: ShiftType, selectedIds: Set<string>) => {
  const weekend = isWeekend(date);
  return [...loads]
    .filter((load) => !selectedIds.has(load.staff.id))
    .sort((a, b) => {
      const aPenalty = (shift === 'night' && a.lastShift === 'night' ? 24 : 0) + (weekend ? a.weekends * 4 : 0);
      const bPenalty = (shift === 'night' && b.lastShift === 'night' ? 24 : 0) + (weekend ? b.weekends * 4 : 0);
      return (a.hours + a.nights * 6 + aPenalty) - (b.hours + b.nights * 6 + bPenalty);
    })[0];
};

export const generateEliteSchedule = ({
  departmentId,
  month,
  staff,
  existingEntries,
}: AutoScheduleOptions): Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>[] => {
  const activeStaff = staff.filter((member) => member.isActive);
  if (activeStaff.length === 0) return [];

  const days = getDaysInMonth(month);
  const loads = buildInitialLoads(activeStaff, existingEntries, month);
  const generated: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  days.forEach((date) => {
    const selectedIds = new Set<string>();
    const weekday = dayjs(date).day();
    const weekend = isWeekend(date);
    const requiredShifts: ShiftType[] = weekend
      ? ['morning', activeStaff.length >= 5 ? 'oncall' : 'off']
      : ['morning', 'evening', ...(activeStaff.length >= 4 ? ['night' as ShiftType] : [])];

    requiredShifts.forEach((shift) => {
      if (shift === 'off') return;
      const load = chooseStaff(loads, date, shift, selectedIds);
      if (!load) return;

      generated.push({
        staffId: load.staff.id,
        departmentId,
        date,
        shift,
      });
      selectedIds.add(load.staff.id);
      load.hours += workingHours(shift);
      if (shift === 'night') load.nights += 1;
      if (weekend) load.weekends += 1;
      load.lastShift = shift;
    });

    loads.forEach((load, index) => {
      if (selectedIds.has(load.staff.id)) return;
      const shouldTraining = !weekend && weekday === 2 && index % 5 === 0;
      generated.push({
        staffId: load.staff.id,
        departmentId,
        date,
        shift: shouldTraining ? 'training' : 'off',
      });
      load.lastShift = shouldTraining ? 'training' : 'off';
    });
  });

  return generated;
};
