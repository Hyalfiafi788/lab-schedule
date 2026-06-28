# LAB Schedule Pro

A production-ready, mobile-first Laboratory Staff Scheduling System for hospital laboratory departments.

## Features

- **4 Departments**: Hematology, Biochemistry, Microbiology, Reception & Sendout
- **Monthly Schedule**: Interactive calendar with click-to-assign shifts
- **Weekly Schedule**: Weekly grid view optimized for mobile
- **Staff Management**: Add/edit/remove staff, view profiles
- **Statistics**: Charts and analytics for shift distribution and coverage
- **Reports**: Export to PDF and Excel, individual staff reports
- **Settings**: Hospital name, working hours, week start day, shift colors
- **Conflict Detection**: Max weekly hours validation
- **PWA Ready**: Installable as a progressive web app

## Shift Types

| Shift    | Color  | Hours |
|----------|--------|-------|
| Morning  | Green  | 8h    |
| Evening  | Blue   | 8h    |
| Night    | Purple | 8h    |
| Off      | Gray   | —     |
| Vacation | Yellow | —     |
| Sick     | Red    | —     |
| Training | Orange | —     |
| Meeting  | Cyan   | —     |
| On Call  | Pink   | 8h    |

## Tech Stack

- React 19 + TypeScript
- Vite 8
- TailwindCSS 3
- Zustand (with LocalStorage persistence)
- React Router v6
- React Hook Form
- Framer Motion
- Dayjs
- Recharts
- jsPDF + jspdf-autotable
- XLSX

## Getting Started

```bash
cd lab-schedule-pro
npm install
npm run dev
```

## Project Structure

```
src/
  types/         # TypeScript interfaces
  data/          # Static data (staff, departments, shifts)
  store/         # Zustand stores (schedule, staff, settings, ui)
  utils/         # Helpers (schedule math, export, cn)
  components/
    ui/           # Reusable UI components (Button, Card, Modal, etc.)
    layout/       # App layout (Sidebar, Header, BottomNav, DepartmentTabs)
    schedule/     # ShiftBadge, ShiftPicker
  pages/
    Dashboard/
    Schedule/     # Monthly + Weekly
    Staff/
    Statistics/
    Reports/
    Settings/
```

## Future Integration

Architecture is prepared for:
- **Supabase** — Replace Zustand persist with Supabase tables
- **Authentication** — Add auth layer around routes
- **Notifications** — Real-time schedule updates
- **Leave Management** — Vacation request workflow
- **Attendance** — Clock-in/out integration
- **Payroll** — Hours calculation export
