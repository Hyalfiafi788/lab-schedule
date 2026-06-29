export type DepartmentId = 'hematology' | 'biochemistry' | 'microbiology' | 'reception';

export type ShiftType =
  | 'morning'
  | 'evening'
  | 'night'
  | 'off'
  | 'vacation'
  | 'sick'
  | 'training'
  | 'meeting'
  | 'oncall';

export type HandoverShiftCode = 'A' | 'B' | 'C';

export type WeekDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface ShiftDefinition {
  id: ShiftType;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  textColor: string;
  startTime?: string;
  endTime?: string;
  hours?: number;
  isWorking: boolean;
}

export interface Staff {
  id: string;
  name: string;
  nameAr?: string;
  departmentId: DepartmentId;
  role: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
  joinDate?: string;
  vacationBalance: number;
  avatar?: string;
  isActive: boolean;
}

export interface ScheduleEntry {
  id: string;
  staffId: string;
  departmentId: DepartmentId;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HandoverRecord {
  id: string;
  departmentId: DepartmentId;
  date: string;
  shiftCode: HandoverShiftCode;
  outgoingStaff: string;
  incomingStaff: string;
  supervisor: string;
  instrumentsStatus: string;
  qcStatus: string;
  criticalResults: string;
  pendingSamples: string;
  pendingTests: string;
  incidents: string;
  suppliesStatus: string;
  notes: string;
  checklist: {
    patientSafety: boolean;
    criticalResultsCommunicated: boolean;
    qcReviewed: boolean;
    pendingWorkListed: boolean;
    equipmentIssuesEscalated: boolean;
    documentationComplete: boolean;
  };
  outgoingSignature: string;
  incomingSignature: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: DepartmentId;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  description: string;
}

export interface MonthlyStats {
  staffId: string;
  month: string; // YYYY-MM
  morningCount: number;
  eveningCount: number;
  nightCount: number;
  offCount: number;
  vacationCount: number;
  sickCount: number;
  trainingCount: number;
  meetingCount: number;
  onCallCount: number;
  totalWorkingDays: number;
  totalWorkingHours: number;
  weekendCount: number;
}

export interface DepartmentStats {
  departmentId: DepartmentId;
  month: string;
  totalStaff: number;
  totalShifts: number;
  morningCoverage: number;
  eveningCoverage: number;
  nightCoverage: number;
  avgWorkingHours: number;
}

export interface AppSettings {
  hospitalName: string;
  weekStartDay: WeekDay;
  shiftDefinitions: ShiftDefinition[];
  defaultVacationDays: number;
  maxWeeklyHours: number;
  minRestHours: number;
  timezone: string;
}

export interface SearchResult {
  type: 'staff' | 'department' | 'schedule';
  id: string;
  label: string;
  subtitle: string;
  departmentId?: DepartmentId;
}

export interface ConflictError {
  type: 'double_booking' | 'insufficient_rest' | 'max_hours' | 'vacation_exceeded';
  message: string;
  staffId: string;
  date: string;
}

export interface ExportOptions {
  departmentId: DepartmentId;
  month: string;
  format: 'pdf' | 'excel';
  scope: 'department' | 'individual' | 'weekly';
  staffId?: string;
  weekStart?: string;
}
