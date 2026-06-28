import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Sun,
  Moon,
  Umbrella,
  Activity,
  Droplets,
  FlaskConical,
  Microscope,
  ClipboardList,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useStaffStore } from '../../store/staffStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useUIStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { DEPARTMENTS } from '../../data/departments';
import type { DepartmentId } from '../../types';
import { getShiftDefinition } from '../../data/shifts';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import dayjs from 'dayjs';

const DEPT_ICONS: Record<DepartmentId, React.ReactNode> = {
  hematology: <Droplets className="h-6 w-6" />,
  biochemistry: <FlaskConical className="h-6 w-6" />,
  microbiology: <Microscope className="h-6 w-6" />,
  reception: <ClipboardList className="h-6 w-6" />,
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { staff, getStaffByDepartment } = useStaffStore();
  const { entries } = useScheduleStore();
  const { setActiveDepartment } = useUIStore();
  const { settings } = useSettingsStore();

  const today = dayjs().format('YYYY-MM-DD');
  const todayEntries = entries.filter((e) => e.date === today);

  const totalStaff = staff.filter((s) => s.isActive).length;
  const todayOnDuty = todayEntries.filter((e) => getShiftDefinition(e.shift).isWorking).length;
  const todayOff = todayEntries.filter((e) => e.shift === 'off').length;
  const todayVacation = todayEntries.filter((e) => e.shift === 'vacation').length;
  const todayNight = todayEntries.filter((e) => e.shift === 'night').length;
  const coverage = totalStaff > 0 ? Math.round((todayOnDuty / totalStaff) * 100) : 0;

  const statsCards = [
    {
      label: 'Total Staff',
      value: totalStaff,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      badge: 'Active',
      badgeVariant: 'info' as const,
    },
    {
      label: "Today's Shifts",
      value: todayOnDuty,
      icon: <Sun className="h-5 w-5" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      badge: `${coverage}% coverage`,
      badgeVariant: coverage >= 70 ? 'success' as const : 'warning' as const,
    },
    {
      label: 'Night Shifts',
      value: todayNight,
      icon: <Moon className="h-5 w-5" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      badge: 'Tonight',
      badgeVariant: 'purple' as const,
    },
    {
      label: 'On Leave',
      value: todayVacation + todayOff,
      icon: <Umbrella className="h-5 w-5" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      badge: `${todayOff} OFF · ${todayVacation} VAC`,
      badgeVariant: 'warning' as const,
    },
  ];

  const handleDeptNavigate = (deptId: DepartmentId, section: string) => {
    setActiveDepartment(deptId);
    navigate(`/department/${deptId}/${section}`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <h1 className="page-title">Dashboard</h1>
          <Badge variant="info" className="hidden sm:flex">
            {dayjs().format('dddd, D MMMM YYYY')}
          </Badge>
        </div>
        <p className="text-slate-500 text-sm">{settings.hospitalName} — Laboratory Management System</p>
      </motion.div>

      {/* Stats overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"
      >
        {statsCards.map((stat) => (
          <motion.div key={stat.label} variants={cardVariants}>
            <div className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <Badge variant={stat.badgeVariant} className="text-[10px]">{stat.badge}</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-0.5">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Departments grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        {DEPARTMENTS.map((dept) => {
          const deptStaff = getStaffByDepartment(dept.id);
          const deptEntries = todayEntries.filter((e) => e.departmentId === dept.id);
          const onDuty = deptEntries.filter((e) => getShiftDefinition(e.shift).isWorking).length;
          const morningStaff = deptEntries.filter((e) => e.shift === 'morning');
          const eveningStaff = deptEntries.filter((e) => e.shift === 'evening');
          const nightStaff = deptEntries.filter((e) => e.shift === 'night');
          const deptCoverage = deptStaff.length > 0 ? Math.round((onDuty / deptStaff.length) * 100) : 0;

          return (
            <motion.div key={dept.id} variants={cardVariants}>
              <Card className="card-hover overflow-hidden">
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: dept.color }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: dept.color }}
                      >
                        {DEPT_ICONS[dept.id]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                        <p className="text-xs text-slate-500">{deptStaff.length} staff members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{deptCoverage}%</div>
                      <div className="text-xs text-slate-500">coverage</div>
                    </div>
                  </div>

                  {/* Shift counts */}
                  <div className="flex gap-2 mb-4">
                    {[
                      { label: 'M', count: morningStaff.length, color: '#dcfce7', text: '#15803d' },
                      { label: 'E', count: eveningStaff.length, color: '#dbeafe', text: '#1d4ed8' },
                      { label: 'N', count: nightStaff.length, color: '#ede9fe', text: '#6d28d9' },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex-1 rounded-xl py-2 text-center"
                        style={{ backgroundColor: s.color }}
                      >
                        <div className="text-lg font-bold" style={{ color: s.text }}>{s.count}</div>
                        <div className="text-[10px] font-semibold" style={{ color: s.text }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Staff avatars */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {deptStaff.slice(0, 5).map((s) => (
                        <Avatar key={s.id} name={s.name} size="xs" className="ring-2 ring-white" />
                      ))}
                      {deptStaff.length > 5 && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center text-[10px] font-semibold text-slate-600">
                          +{deptStaff.length - 5}
                        </div>
                      )}
                    </div>

                    {/* Quick links */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDeptNavigate(dept.id, 'monthly')}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        Schedule
                      </button>
                      <button
                        onClick={() => handleDeptNavigate(dept.id, 'staff')}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <Users className="h-3 w-3" />
                        Staff
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Today's schedule summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="section-title">Today's Shift Overview</h2>
            </div>
            <Badge variant="info">{dayjs().format('DD MMM YYYY')}</Badge>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {DEPARTMENTS.map((dept) => {
                const deptStaff = getStaffByDepartment(dept.id);
                const deptEntries = todayEntries.filter((e) => e.departmentId === dept.id);

                return (
                  <div key={dept.id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="text-sm font-medium text-slate-800">{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {deptStaff.map((s) => {
                          const entry = deptEntries.find((e) => e.staffId === s.id);
                          if (!entry) return null;
                          const def = getShiftDefinition(entry.shift);
                          if (!def.isWorking) return null;
                          return (
                            <div key={s.id} className="flex items-center gap-1.5">
                              <Avatar name={s.name} size="xs" />
                              <span
                                className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
                                style={{ backgroundColor: def.bgColor, color: def.textColor }}
                              >
                                {def.shortLabel}
                              </span>
                            </div>
                          );
                        }).filter(Boolean).slice(0, 6)}
                        <button
                          onClick={() => handleDeptNavigate(dept.id, 'monthly')}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
