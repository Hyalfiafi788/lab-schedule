import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Sun,
  Moon,
  Umbrella,
  Activity,
  AlertTriangle,
  Droplets,
  FlaskConical,
  Microscope,
  ClipboardList,
  ChevronRight,
  Calendar,
  Gauge,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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

const ProgressBar = ({ value, color = '#2563eb' }: { value: number; color?: string }) => (
  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
    />
  </div>
);

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
  const monthEntries = entries.filter((e) => e.date.startsWith(dayjs().format('YYYY-MM')));
  const monthWorkloadHours = monthEntries.reduce((total, entry) => {
    return total + (getShiftDefinition(entry.shift).hours ?? 0);
  }, 0);
  const scheduledToday = totalStaff > 0 ? Math.round((todayEntries.length / totalStaff) * 100) : 0;
  const coverageStatus =
    coverage >= 75 ? 'Excellent coverage' : coverage >= 50 ? 'Monitor coverage' : 'Needs attention';
  const busiestDept = DEPARTMENTS.map((dept) => {
    const deptEntries = todayEntries.filter((e) => e.departmentId === dept.id);
    return {
      ...dept,
      onDuty: deptEntries.filter((e) => getShiftDefinition(e.shift).isWorking).length,
      total: getStaffByDepartment(dept.id).length,
    };
  }).sort((a, b) => b.onDuty - a.onDuty)[0];
  const attentionItems = [
    {
      label: 'Schedule completeness',
      value: `${scheduledToday}%`,
      tone: scheduledToday >= 80 ? 'text-emerald-200' : 'text-amber-200',
    },
    {
      label: 'Monthly workload',
      value: `${monthWorkloadHours}h`,
      tone: 'text-blue-100',
    },
    {
      label: 'Top active unit',
      value: busiestDept ? `${busiestDept.shortName} · ${busiestDept.onDuty}/${busiestDept.total}` : 'N/A',
      tone: 'text-violet-100',
    },
  ];

  const statsCards = [
    {
      label: 'Total Staff',
      value: totalStaff,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      ring: 'ring-blue-100',
      badge: 'Active',
      badgeVariant: 'info' as const,
    },
    {
      label: "Today's Shifts",
      value: todayOnDuty,
      icon: <Sun className="h-5 w-5" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      ring: 'ring-green-100',
      badge: `${coverage}% coverage`,
      badgeVariant: coverage >= 70 ? 'success' as const : 'warning' as const,
    },
    {
      label: 'Night Shifts',
      value: todayNight,
      icon: <Moon className="h-5 w-5" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      ring: 'ring-purple-100',
      badge: 'Tonight',
      badgeVariant: 'purple' as const,
    },
    {
      label: 'On Leave',
      value: todayVacation + todayOff,
      icon: <Umbrella className="h-5 w-5" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      ring: 'ring-amber-100',
      badge: `${todayOff} OFF · ${todayVacation} VAC`,
      badgeVariant: 'warning' as const,
    },
  ];

  const handleDeptNavigate = (deptId: DepartmentId, section: string) => {
    setActiveDepartment(deptId);
    navigate(`/department/${deptId}/${section}`);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      {/* Command center hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-blue-950/20 md:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb_0,transparent_32%),radial-gradient(circle_at_bottom_right,#7c3aed_0,transparent_28%)] opacity-70" />
        <div className="absolute right-8 top-6 hidden h-32 w-32 rounded-full border border-white/10 lg:block" />
        <div className="absolute right-20 top-16 hidden h-20 w-20 rounded-full border border-white/10 lg:block" />

        <div className="relative grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:items-end">
          <div>
            <Badge className="mb-4 bg-white/10 text-white ring-1 ring-white/20">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Smart Command Center
            </Badge>
            <h1 className="max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
              Laboratory scheduling, now command-ready.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              {settings.hospitalName} · live coverage, shift load, and department readiness in one polished view.
            </p>

            <div className="mt-6 grid max-w-2xl grid-cols-3 gap-3">
              {attentionItems.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/10 p-3 backdrop-blur ring-1 ring-white/10">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">{item.label}</div>
                  <div className={`mt-1 text-lg font-black ${item.tone}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur ring-1 ring-white/15">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-blue-100">Today readiness</div>
                <div className="text-3xl font-black">{coverage}%</div>
              </div>
              <div className="rounded-2xl bg-emerald-400/20 p-3 text-emerald-100 ring-1 ring-emerald-300/30">
                <Gauge className="h-7 w-7" />
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-blue-300 to-indigo-300"
                style={{ width: `${Math.min(coverage, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-blue-100">
              <span>{coverageStatus}</span>
              <span>{dayjs().format('dddd, D MMMM YYYY')}</span>
            </div>
          </div>
        </div>
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
            <div className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm shadow-slate-200/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/80 transition-transform duration-500 group-hover:scale-125" />
              <div className="flex items-start justify-between mb-3">
                <div className={`relative rounded-2xl p-2.5 ring-1 ${stat.bg} ${stat.ring}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <Badge variant={stat.badgeVariant} className="text-[10px]">{stat.badge}</Badge>
              </div>
              <div className="relative text-3xl font-black text-slate-950 mb-0.5">{stat.value}</div>
              <div className="relative text-sm font-medium text-slate-500">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Operational briefing */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.15fr]"
      >
        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden border-white/70 bg-white/85 shadow-lg shadow-slate-200/60 backdrop-blur">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Operational pulse</h2>
                  <p className="text-sm text-slate-500">Live signals from today's roster</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 ring-1 ring-blue-100">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">Coverage strength</span>
                    <span className="font-black text-slate-950">{coverage}%</span>
                  </div>
                  <ProgressBar value={coverage} color={coverage >= 70 ? '#10b981' : '#f59e0b'} />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">Schedule completion</span>
                    <span className="font-black text-slate-950">{scheduledToday}%</span>
                  </div>
                  <ProgressBar value={scheduledToday} color="#2563eb" />
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900">{coverageStatus}</div>
                      <div className="text-sm text-slate-500">
                        {todayOnDuty} working, {todayNight} night, {todayVacation + todayOff} off or leave today.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden border-white/70 bg-white/85 shadow-lg shadow-slate-200/60 backdrop-blur">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Priority watchlist</h2>
                  <p className="text-sm text-slate-500">Departments that need attention first</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 ring-1 ring-amber-100">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {DEPARTMENTS.map((dept) => {
                  const deptStaff = getStaffByDepartment(dept.id);
                  const deptEntries = todayEntries.filter((e) => e.departmentId === dept.id);
                  const onDuty = deptEntries.filter((e) => getShiftDefinition(e.shift).isWorking).length;
                  const deptCoverage = deptStaff.length > 0 ? Math.round((onDuty / deptStaff.length) * 100) : 0;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => handleDeptNavigate(dept.id, 'monthly')}
                      className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                          <span className="font-bold text-slate-900">{dept.shortName}</span>
                        </div>
                        <span className="text-xs font-black text-slate-500">{deptCoverage}%</span>
                      </div>
                      <ProgressBar value={deptCoverage} color={dept.color} />
                      <div className="mt-2 text-xs text-slate-500">{onDuty} of {deptStaff.length} staff assigned today</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
              <Card className="group overflow-hidden border-white/70 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100">
                <div
                  className="h-2 w-full"
                  style={{ background: `linear-gradient(90deg, ${dept.color}, ${dept.color}66, #ffffff)` }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                        style={{ background: `linear-gradient(135deg, ${dept.color}, #0f172a)` }}
                      >
                        {DEPT_ICONS[dept.id]}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-950">{dept.name}</h3>
                        <p className="text-xs font-medium text-slate-500">{dept.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-950">{deptCoverage}%</div>
                      <div className="text-xs font-semibold text-slate-500">coverage</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <ProgressBar value={deptCoverage} color={dept.color} />
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
                        className="flex-1 rounded-2xl py-2 text-center ring-1 ring-black/5"
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
                        className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        <Calendar className="h-3 w-3" />
                        Schedule
                      </button>
                      <button
                        onClick={() => handleDeptNavigate(dept.id, 'staff')}
                        className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
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
        <Card className="overflow-hidden border-white/70 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-blue-50 p-2 text-blue-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">Today's Shift Overview</h2>
                <p className="text-xs font-medium text-slate-500">Assigned working staff by department</p>
              </div>
            </div>
            <Badge variant="info">{dayjs().format('DD MMM YYYY')}</Badge>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {DEPARTMENTS.map((dept) => {
                const deptStaff = getStaffByDepartment(dept.id);
                const deptEntries = todayEntries.filter((e) => e.departmentId === dept.id);

                return (
                  <div key={dept.id} className="px-5 py-4 transition-colors hover:bg-slate-50/70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-3 w-3 rounded-full shadow-sm"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="text-sm font-bold text-slate-900">{dept.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-3">
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
                          className="rounded-xl p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
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
