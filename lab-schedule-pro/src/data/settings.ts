import type { AppSettings } from '../types';
import { SHIFT_DEFINITIONS } from './shifts';

export const DEFAULT_SETTINGS: AppSettings = {
  hospitalName: 'Al Yamamah Hospital',
  weekStartDay: 'sunday',
  shiftDefinitions: SHIFT_DEFINITIONS,
  defaultVacationDays: 21,
  maxWeeklyHours: 48,
  minRestHours: 11,
  timezone: 'Asia/Riyadh',
};
