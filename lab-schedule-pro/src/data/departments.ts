import type { Department, DepartmentId } from '../types';

export const DEPARTMENTS: Department[] = [
  {
    id: 'hematology',
    name: 'Hematology',
    shortName: 'HEMA',
    color: '#ef4444',
    icon: 'Droplets',
    description: 'Blood analysis and hematological studies',
  },
  {
    id: 'biochemistry',
    name: 'Biochemistry',
    shortName: 'BIOC',
    color: '#3b82f6',
    icon: 'FlaskConical',
    description: 'Chemical analysis and biochemical testing',
  },
  {
    id: 'microbiology',
    name: 'Microbiology',
    shortName: 'MICRO',
    color: '#10b981',
    icon: 'Microscope',
    description: 'Microbial culture and sensitivity testing',
  },
  {
    id: 'reception',
    name: 'Reception & Sendout',
    shortName: 'RECV',
    color: '#8b5cf6',
    icon: 'ClipboardList',
    description: 'Sample reception and external lab sendout',
  },
];

export const getDepartmentById = (id: DepartmentId): Department =>
  DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[0];

export const DEPARTMENT_IDS: DepartmentId[] = ['hematology', 'biochemistry', 'microbiology', 'reception'];
