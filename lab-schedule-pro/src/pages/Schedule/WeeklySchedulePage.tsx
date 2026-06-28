import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { useStaffStore } from '../../store/staffStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToast } from '../../components/ui/Toast';
import type { DepartmentId, ShiftType } from '../../types';
import { getShiftDefinition } from '../../data/shifts';
import { getDepartmentById } from '../../data/departments';
import { isToday, isWeekend } from '../../utils/schedule';
import { ShiftBadge, ShiftPicker } from '../../components/schedule/ShiftBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeeklySchedulePage = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const deptId = departmentId as DepartmentId;

  const { getStaffByDepartment } = useStaffStore();
  const { setShift, getWeekEntries } = useScheduleStore();
  useSettingsStore();
  const { toast } = useToast();

  const dept = getDepartmentById(deptId);
  const staff = getStaffByDepartment(deptId);

  // Current week - start from Sunday
  const [weekStart, setWeekStart] = useState(() =>
    dayjs().startOf('week').format('YYYY-MM-DD')
  );

  const [editCell, setEditCell] = useState<{ staffId: string; date: string; staffName: string } | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD')
  );

  const entries = getWeekEntries(deptId, weekStart);

  const prevWeek = () => setWeekStart(dayjs(weekStart).subtract(7, 'day').format('YYYY-MM-DD'));
  const nextWeek = () => setWeekStart(dayjs(weekStart).add(7, 'day').format('YYYY-MM-DD'));
  const goToToday = () => setWeekStart(dayjs().startOf('week').format('YYYY-MM-DD'));

  const handleShiftSelect = (shift: ShiftType) => {
    if (!editCell) return;
    const conflict = setShift(editCell.staffId, deptId, editCell.date, shift);
    if (conflict) {
      toast(conflict.message, 'warning');
    } else {
      toast(`Shift set to ${getShiftDefinition(shift).label}`, 'success', 1800);
    }
    setEditCell(null);
  };

  const handleClearShift = () => {
    if (!editCell) return;
    useScheduleStore.getState().removeShift(editCell.staffId, editCell.date);
    toast('Shift cleared', 'info', 1800);
    setEditCell(null);
  };

  // Count shifts per day
  const getDayShiftCounts = (date: string) => {
    const dayEntries = entries.filter((e) => e.date === date);
    return {
      morning: dayEntries.filter((e) => e.shift === 'morning').length,
      evening: dayEntries.filter((e) => e.shift === 'evening').length,
      night: dayEntries.filter((e) => e.shift === 'night').length,
    };
  };

  const currentEntry = editCell
    ? entries.find((e) => e.staffId === editCell.staffId && e.date === editCell.date)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-4 md:px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
          <span className="text-sm font-semibold text-slate-800">{dept.name}</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
          <Button variant="ghost" size="icon-sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-semibold text-slate-700 px-2 min-w-[160px] text-center">
            {dayjs(weekStart).format('D MMM')} – {dayjs(weekStart).add(6, 'day').format('D MMM YYYY')}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Week columns layout - desktop */}
      <div className="flex-1 overflow-auto scrollbar-thin p-4 md:p-5">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-3 sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm py-2">
          {weekDays.map((date) => {
            const today = isToday(date);
            const weekend = isWeekend(date);
            const counts = getDayShiftCounts(date);
            return (
              <div
                key={date}
                className={`rounded-xl p-2 text-center ${
                  today ? 'bg-primary text-white shadow-md' : weekend ? 'bg-slate-100' : 'bg-white border border-slate-100'
                }`}
              >
                <div className={`text-[11px] font-semibold uppercase ${today ? 'text-white/80' : 'text-slate-400'}`}>
                  {SHORT_DAYS[dayjs(date).day()]}
                </div>
                <div className={`text-lg font-bold ${today ? 'text-white' : weekend ? 'text-slate-400' : 'text-slate-800'}`}>
                  {dayjs(date).date()}
                </div>
                <div className="flex justify-center gap-0.5 mt-1">
                  {counts.morning > 0 && (
                    <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1 rounded">M{counts.morning}</span>
                  )}
                  {counts.evening > 0 && (
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 rounded">E{counts.evening}</span>
                  )}
                  {counts.night > 0 && (
                    <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1 rounded">N{counts.night}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Staff rows */}
        <div className="space-y-2">
          {staff.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            >
              {/* Staff header */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 bg-slate-50/50">
                <Avatar name={member.name} size="xs" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{member.name}</div>
                  <div className="text-[10px] text-slate-400">{member.role}</div>
                </div>
              </div>

              {/* Week cells */}
              <div className="grid grid-cols-7 divide-x divide-slate-50">
                {weekDays.map((date) => {
                  const entry = entries.find((e) => e.staffId === member.id && e.date === date);
                  const today = isToday(date);
                  const weekend = isWeekend(date);

                  return (
                    <div
                      key={date}
                      className={`flex flex-col items-center justify-center py-3 cursor-pointer transition-all min-h-[72px] ${
                        today ? 'bg-blue-50/50' : weekend ? 'bg-slate-50/50' : 'hover:bg-slate-50'
                      }`}
                      onClick={() =>
                        setEditCell({ staffId: member.id, date, staffName: member.name })
                      }
                    >
                      {entry ? (
                        <ShiftBadge shift={entry.shift} size="xs" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                          <span className="text-slate-300 text-sm">+</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        open={!!editCell}
        onClose={() => setEditCell(null)}
        title="Assign Shift"
        description={
          editCell
            ? `${editCell.staffName} · ${dayjs(editCell.date).format('dddd, D MMMM YYYY')}`
            : ''
        }
        size="sm"
      >
        {editCell && (
          <div className="space-y-4">
            {currentEntry && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Current:</span>
                <ShiftBadge shift={currentEntry.shift} size="sm" showLabel />
              </div>
            )}
            <ShiftPicker
              value={currentEntry?.shift}
              onChange={handleShiftSelect}
              onClear={currentEntry ? handleClearShift : undefined}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
