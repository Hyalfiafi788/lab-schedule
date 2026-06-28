export type LabStatus = "available" | "occupied" | "maintenance" | "reserved";

export interface Lab {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  location: string;
  color: string;
}

export interface Booking {
  id: string;
  labId: string;
  title: string;
  instructor: string;
  course: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  dayOfWeek: number; // 0=Mon, 6=Sun
  recurrence: "weekly" | "once";
  date?: string;     // ISO date for "once" bookings
  notes?: string;
  color?: string;
}

export const LABS: Lab[] = [
  {
    id: "lab-a",
    name: "Biology Lab A",
    capacity: 24,
    equipment: ["Microscopes", "Centrifuges", "PCR Machine", "Autoclave"],
    location: "Building 1, Room 101",
    color: "#3b82f6",
  },
  {
    id: "lab-b",
    name: "Chemistry Lab B",
    capacity: 20,
    equipment: ["Fume Hoods", "Spectrophotometer", "Rotary Evaporator", "pH Meters"],
    location: "Building 1, Room 203",
    color: "#8b5cf6",
  },
  {
    id: "lab-c",
    name: "Physics Lab C",
    capacity: 30,
    equipment: ["Oscilloscopes", "Signal Generators", "Laser Equipment", "Vacuum Pump"],
    location: "Building 2, Room 105",
    color: "#ec4899",
  },
  {
    id: "lab-d",
    name: "Computer Lab D",
    capacity: 32,
    equipment: ["Workstations", "Servers", "3D Printers", "Networking Equipment"],
    location: "Building 3, Room 301",
    color: "#f59e0b",
  },
  {
    id: "lab-e",
    name: "Research Lab E",
    capacity: 12,
    equipment: ["Electron Microscope", "Mass Spectrometer", "HPLC", "NMR Spectrometer"],
    location: "Building 4, Room 410",
    color: "#10b981",
  },
];

export const BOOKINGS: Booking[] = [
  {
    id: "b1",
    labId: "lab-a",
    title: "Cell Biology Lab",
    instructor: "Dr. Sarah Chen",
    course: "BIO 301",
    startTime: "08:00",
    endTime: "10:00",
    dayOfWeek: 0,
    recurrence: "weekly",
    color: "#3b82f6",
  },
  {
    id: "b2",
    labId: "lab-b",
    title: "Organic Chemistry Lab",
    instructor: "Prof. James Mitchell",
    course: "CHEM 201",
    startTime: "09:00",
    endTime: "12:00",
    dayOfWeek: 1,
    recurrence: "weekly",
    color: "#8b5cf6",
  },
  {
    id: "b3",
    labId: "lab-c",
    title: "Optics Experiment",
    instructor: "Dr. Anna Kowalski",
    course: "PHYS 401",
    startTime: "13:00",
    endTime: "16:00",
    dayOfWeek: 1,
    recurrence: "weekly",
    color: "#ec4899",
  },
  {
    id: "b4",
    labId: "lab-d",
    title: "Machine Learning Workshop",
    instructor: "Prof. David Park",
    course: "CS 450",
    startTime: "10:00",
    endTime: "13:00",
    dayOfWeek: 2,
    recurrence: "weekly",
    color: "#f59e0b",
  },
  {
    id: "b5",
    labId: "lab-e",
    title: "Graduate Research Session",
    instructor: "Dr. Emily Torres",
    course: "GRAD 601",
    startTime: "09:00",
    endTime: "17:00",
    dayOfWeek: 2,
    recurrence: "weekly",
    color: "#10b981",
  },
  {
    id: "b6",
    labId: "lab-a",
    title: "Genetics Lab",
    instructor: "Dr. Sarah Chen",
    course: "BIO 402",
    startTime: "13:00",
    endTime: "15:00",
    dayOfWeek: 3,
    recurrence: "weekly",
    color: "#3b82f6",
  },
  {
    id: "b7",
    labId: "lab-b",
    title: "Analytical Chemistry",
    instructor: "Prof. James Mitchell",
    course: "CHEM 305",
    startTime: "14:00",
    endTime: "17:00",
    dayOfWeek: 3,
    recurrence: "weekly",
    color: "#8b5cf6",
  },
  {
    id: "b8",
    labId: "lab-d",
    title: "Web Development Lab",
    instructor: "Prof. Lisa Wong",
    course: "CS 210",
    startTime: "08:00",
    endTime: "11:00",
    dayOfWeek: 4,
    recurrence: "weekly",
    color: "#f59e0b",
  },
  {
    id: "b9",
    labId: "lab-c",
    title: "Quantum Mechanics Lab",
    instructor: "Dr. Anna Kowalski",
    course: "PHYS 501",
    startTime: "10:00",
    endTime: "12:00",
    dayOfWeek: 0,
    recurrence: "weekly",
    color: "#ec4899",
  },
  {
    id: "b10",
    labId: "lab-e",
    title: "Protein Analysis",
    instructor: "Dr. Emily Torres",
    course: "BIOCHEM 410",
    startTime: "13:00",
    endTime: "16:00",
    dayOfWeek: 4,
    recurrence: "weekly",
    color: "#10b981",
  },
];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7:00 - 18:00

export function getLabById(id: string): Lab | undefined {
  return LABS.find((l) => l.id === id);
}

export function getBookingsForDay(dayOfWeek: number, labId?: string): Booking[] {
  return BOOKINGS.filter(
    (b) => b.dayOfWeek === dayOfWeek && (!labId || b.labId === labId)
  );
}

export function getLabUtilization(labId: string): number {
  const bookings = BOOKINGS.filter((b) => b.labId === labId);
  const totalSlots = 5 * 11; // 5 days * 11 hours
  let usedSlots = 0;
  for (const b of bookings) {
    const start = parseInt(b.startTime.split(":")[0]);
    const end = parseInt(b.endTime.split(":")[0]);
    usedSlots += end - start;
  }
  return Math.round((usedSlots / totalSlots) * 100);
}
