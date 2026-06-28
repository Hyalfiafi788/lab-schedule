import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { useStaffStore } from '../../store/staffStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useUIStore } from '../../store/uiStore';
import type { DepartmentId } from '../../types';
import { getDepartmentById } from '../../data/departments';
import { computeMonthlyStats, formatMonth, getDaysInMonth } from '../../utils/schedule';
import { getShiftDefinition } from '../../data/shifts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import dayjs from 'dayjs';

const CHART_COLORS = {
  morning: '#16a34a',
  evening: '#2563eb',
  night: '#7c3aed',
  off: '#9ca3af',
  vacation: '#ca8a04',
  sick: '#dc2626',
  training: '#ea580c',
  meeting: '#0891b2',
  oncall: '#db2777',
};

export const StatisticsPage = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const deptId = departmentId as DepartmentId;

  const { getStaffByDepartment } = useStaffStore();
  const { getDepartmentMonthEntries } = useScheduleStore();
  const { currentMonth } = useUIStore();

  const dept = getDepartmentById(deptId);
  const staff = getStaffByDepartment(deptId);
  const entries = getDepartmentMonthEntries(deptId, currentMonth);
  const days = getDaysInMonth(currentMonth);

  // Per-staff stats
  const staffStats = staff.map((s) => {
    const stats = computeMonthlyStats(s, entries, currentMonth);
    return { ...stats, name: s.name, role: s.role };
  });

  // Shift distribution for pie chart
  const shiftDistribution = [
    { name: 'Morning', value: staffStats.reduce((a, b) => a + b.morningCount, 0), color: CHART_COLORS.morning },
    { name: 'Evening', value: staffStats.reduce((a, b) => a + b.eveningCount, 0), color: CHART_COLORS.evening },
    { name: 'Night', value: staffStats.reduce((a, b) => a + b.nightCount, 0), color: CHART_COLORS.night },
    { name: 'OFF', value: staffStats.reduce((a, b) => a + b.offCount, 0), color: CHART_COLORS.off },
    { name: 'Vacation', value: staffStats.reduce((a, b) => a + b.vacationCount, 0), color: CHART_COLORS.vacation },
    { name: 'Sick', value: staffStats.reduce((a, b) => a + b.sickCount, 0), color: CHART_COLORS.sick },
  ].filter((d) => d.value > 0);

  // Daily coverage data
  const dailyCoverage = days.map((date) => {
    const dayEntries = entries.filter((e) => e.date === date);
    return {
      day: dayjs(date).date(),
      date,
      morning: dayEntries.filter((e) => e.shift === 'morning').length,
      evening: dayEntries.filter((e) => e.shift === 'evening').length,
      night: dayEntries.filter((e) => e.shift === 'night').length,
      total: dayEntries.filter((e) => getShiftDefinition(e.shift).isWorking).length,
    };
  });

  // Per-staff bar data
  const staffBarData = staffStats.map((s) => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    Morning: s.morningCount,
    Evening: s.eveningCount,
    Night: s.nightCount,
    OFF: s.offCount,
    Hours: s.totalWorkingHours,
  }));

  const totalStats = {
    totalShifts: staffStats.reduce((a, b) => a + b.totalWorkingDays, 0),
    totalHours: staffStats.reduce((a, b) => a + b.totalWorkingHours, 0),
    nightShifts: staffStats.reduce((a, b) => a + b.nightCount, 0),
    vacationDays: staffStats.reduce((a, b) => a + b.vacationCount, 0),
    sickDays: staffStats.reduce((a, b) => a + b.sickCount, 0),
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
            <h2 className="text-xl font-bold text-slate-900">{dept.name}</h2>
          </div>
          <p className="text-sm text-slate-500">Statistics for {formatMonth(currentMonth)}</p>
        </div>
        <Badge variant="info">{staff.length} staff</Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Shifts', value: totalStats.totalShifts, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Working Hours', value: `${totalStats.totalHours}h`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Night Shifts', value: totalStats.nightShifts, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Vacation Days', value: totalStats.vacationDays, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sick Leave', value: totalStats.sickDays, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${s.bg} rounded-2xl p-4 text-center`}
          >
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Shift distribution pie */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Shift Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shiftDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {shiftDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} shifts`, name]} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily coverage line chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyCoverage} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="morning" stroke={CHART_COLORS.morning} strokeWidth={2} dot={false} name="Morning" />
                  <Line type="monotone" dataKey="evening" stroke={CHART_COLORS.evening} strokeWidth={2} dot={false} name="Evening" />
                  <Line type="monotone" dataKey="night" stroke={CHART_COLORS.night} strokeWidth={2} dot={false} name="Night" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff shifts bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Shift Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffBarData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName ?? label}
                />
                <Legend iconType="rect" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Morning" fill={CHART_COLORS.morning} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Evening" fill={CHART_COLORS.evening} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Night" fill={CHART_COLORS.night} radius={[3, 3, 0, 0]} />
                <Bar dataKey="OFF" fill={CHART_COLORS.off} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Staff table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Monthly Summary</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Employee</th>
                <th className="text-center px-3 py-3 font-semibold text-green-600">M</th>
                <th className="text-center px-3 py-3 font-semibold text-blue-600">E</th>
                <th className="text-center px-3 py-3 font-semibold text-purple-600">N</th>
                <th className="text-center px-3 py-3 font-semibold text-slate-500">OFF</th>
                <th className="text-center px-3 py-3 font-semibold text-amber-500">VAC</th>
                <th className="text-center px-3 py-3 font-semibold text-red-500">SL</th>
                <th className="text-center px-3 py-3 font-semibold text-slate-700">Total Days</th>
                <th className="text-center px-3 py-3 font-semibold text-indigo-600">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffStats.map((s, i) => (
                <motion.tr
                  key={s.staffId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} size="xs" />
                      <div>
                        <div className="font-medium text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-3 py-3 font-semibold text-green-600">{s.morningCount || '—'}</td>
                  <td className="text-center px-3 py-3 font-semibold text-blue-600">{s.eveningCount || '—'}</td>
                  <td className="text-center px-3 py-3 font-semibold text-purple-600">{s.nightCount || '—'}</td>
                  <td className="text-center px-3 py-3 text-slate-500">{s.offCount || '—'}</td>
                  <td className="text-center px-3 py-3 text-amber-500">{s.vacationCount || '—'}</td>
                  <td className="text-center px-3 py-3 text-red-500">{s.sickCount || '—'}</td>
                  <td className="text-center px-3 py-3 font-semibold text-slate-700">{s.totalWorkingDays}</td>
                  <td className="text-center px-3 py-3 font-semibold text-indigo-600">{s.totalWorkingHours}h</td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td className="px-4 py-3 font-bold text-slate-700">Total</td>
                <td className="text-center px-3 py-3 font-bold text-green-600">
                  {staffStats.reduce((a, b) => a + b.morningCount, 0)}
                </td>
                <td className="text-center px-3 py-3 font-bold text-blue-600">
                  {staffStats.reduce((a, b) => a + b.eveningCount, 0)}
                </td>
                <td className="text-center px-3 py-3 font-bold text-purple-600">
                  {staffStats.reduce((a, b) => a + b.nightCount, 0)}
                </td>
                <td className="text-center px-3 py-3 font-bold text-slate-500">
                  {staffStats.reduce((a, b) => a + b.offCount, 0)}
                </td>
                <td className="text-center px-3 py-3 font-bold text-amber-500">
                  {staffStats.reduce((a, b) => a + b.vacationCount, 0)}
                </td>
                <td className="text-center px-3 py-3 font-bold text-red-500">
                  {staffStats.reduce((a, b) => a + b.sickCount, 0)}
                </td>
                <td className="text-center px-3 py-3 font-bold text-slate-700">
                  {staffStats.reduce((a, b) => a + b.totalWorkingDays, 0)}
                </td>
                <td className="text-center px-3 py-3 font-bold text-indigo-600">
                  {staffStats.reduce((a, b) => a + b.totalWorkingHours, 0)}h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};
