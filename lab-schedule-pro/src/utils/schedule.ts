import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import type { ScheduleEntry, Staff, MonthlyStats, ShiftType } from '../types';
import { getShiftDefinition } from '../data/shifts';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

export const getDaysInMonth = (month: string): string[] => {
  const start = dayjs(month + '-01');
  const daysCount = start.daysInMonth();
  return Array.from({ length: daysCount }, (_, i) =>
    start.date(i + 1).format('YYYY-MM-DD')
  );
};

export const getWeekDays = (weekStart: string): string[] => {
  return Array.from({ length: 7 }, (_, i) =>
    dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD')
  );
};

export const getMonthWeeks = (month: string, _weekStartDay = 0): string[][] => {
  const start = dayjs(month + '-01');
  const end = start.endOf('month');
  const weeks: string[][] = [];
  let current = start;

  while (current.isSameOrBefore(end, 'day')) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      const day = current.add(i, 'day');
      if (day.month() === start.month()) {
        week.push(day.format('YYYY-MM-DD'));
      }
    }
    weeks.push(week);
    current = current.add(7, 'day');
  }

  return weeks;
};

export const computeMonthlyStats = (
  staff: Staff,
  entries: ScheduleEntry[],
  month: string
): MonthlyStats => {
  const staffEntries = entries.filter(
    (e) => e.staffId === staff.id && e.date.startsWith(month)
  );

  const counts: Record<ShiftType, number> = {
    morning: 0,
    evening: 0,
    night: 0,
    off: 0,
    vacation: 0,
    sick: 0,
    training: 0,
    meeting: 0,
    oncall: 0,
  };

  let totalWorkingHours = 0;
  let weekendCount = 0;

  staffEntries.forEach((e) => {
    counts[e.shift] = (counts[e.shift] ?? 0) + 1;
    const def = getShiftDefinition(e.shift);
    totalWorkingHours += def.hours ?? 0;

    const day = dayjs(e.date).day();
    if (day === 5 || day === 6) weekendCount++;
  });

  const totalWorkingDays = counts.morning + counts.evening + counts.night + counts.oncall;

  return {
    staffId: staff.id,
    month,
    morningCount: counts.morning,
    eveningCount: counts.evening,
    nightCount: counts.night,
    offCount: counts.off,
    vacationCount: counts.vacation,
    sickCount: counts.sick,
    trainingCount: counts.training,
    meetingCount: counts.meeting,
    onCallCount: counts.oncall,
    totalWorkingDays,
    totalWorkingHours,
    weekendCount,
  };
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatMonth = (month: string): string =>
  dayjs(month + '-01').format('MMMM YYYY');

export const isWeekend = (date: string): boolean => {
  const day = dayjs(date).day();
  return day === 5 || day === 6; // Friday & Saturday for Saudi Arabia
};

export const isToday = (date: string): boolean =>
  dayjs(date).isSame(dayjs(), 'day');

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
