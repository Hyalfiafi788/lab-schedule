import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, Printer, Trash2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useStaffStore } from '../../store/staffStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useUIStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToast } from '../../components/ui/Toast';
import type { DepartmentId, ShiftType } from '../../types';
import { getDaysInMonth, formatMonth, isWeekend, isToday, DAY_NAMES } from '../../utils/schedule';
import { getShiftDefinition } from '../../data/shifts';
import { getDepartmentById } from '../../data/departments';
import { exportToExcel, exportToPDF } from '../../utils/export';
import { ShiftBadge, ShiftPicker } from '../../components/schedule/ShiftBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import dayjs from 'dayjs';

interface CellEditState {
  staffId: string;
  date: string;
  staffName: string;
}

export const MonthlySchedulePage = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const deptId = departmentId as DepartmentId;

  const { getStaffByDepartment } = useStaffStore();
  const { setShift, getDepartmentMonthEntries, clearDepartmentMonth } = useScheduleStore();
  const { currentMonth, prevMonth, nextMonth } = useUIStore();
  const { settings } = useSettingsStore();
  const { toast } = useToast();

  const [editCell, setEditCell] = useState<CellEditState | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const dept = getDepartmentById(deptId);
  const staff = getStaffByDepartment(deptId);
  const days = getDaysInMonth(currentMonth);
  const entries = getDepartmentMonthEntries(deptId, currentMonth);

  const handleCellClick = (staffId: string, date: string, staffName: string) => {
    setEditCell({ staffId, date, staffName });
  };

  const handleShiftSelect = useCallback(
    (shift: ShiftType) => {
      if (!editCell) return;
      const conflict = setShift(editCell.staffId, deptId, editCell.date, shift);
      if (conflict) {
        toast(conflict.message, 'warning');
      } else {
        toast(`Shift updated to ${getShiftDefinition(shift).label}`, 'success', 2000);
      }
      setEditCell(null);
    },
    [editCell, deptId, setShift, toast]
  );

  const handleClearShift = useCallback(() => {
    if (!editCell) return;
    const { removeShift } = useScheduleStore.getState();
    removeShift(editCell.staffId, editCell.date);
    toast('Shift cleared', 'info', 2000);
    setEditCell(null);
  }, [editCell, toast]);

  const handleExcelExport = () => {
    exportToExcel(staff, entries, deptId, currentMonth);
    toast('Excel file downloaded', 'success');
  };

  const handlePDFExport = () => {
    exportToPDF(staff, entries, deptId, currentMonth, settings.hospitalName);
    toast('PDF file downloaded', 'success');
  };

  const handleClearMonth = () => {
    clearDepartmentMonth(deptId, currentMonth);
    toast(`Schedule cleared for ${formatMonth(currentMonth)}`, 'info');
    setConfirmClear(false);
  };

  // Shift summary per staff
  const getShiftCounts = (staffId: string) => {
    const staffEntries = entries.filter((e) => e.staffId === staffId);
    const counts = { morning: 0, evening: 0, night: 0, off: 0, working: 0, hours: 0 };
    staffEntries.forEach((e) => {
      if (e.shift === 'morning') counts.morning++;
      else if (e.shift === 'evening') counts.evening++;
      else if (e.shift === 'night') counts.night++;
      else if (e.shift === 'off') counts.off++;
      const def = getShiftDefinition(e.shift);
      if (def.isWorking) {
        counts.working++;
        counts.hours += def.hours ?? 0;
      }
    });
    return counts;
  };

  const currentEntry = editCell ? entries.find((e) => e.staffId === editCell.staffId && e.date === editCell.date) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-4 md:px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: dept.color }}
          />
          <span className="text-sm font-semibold text-slate-800">{dept.name}</span>
          <Badge variant="info">{staff.length} staff</Badge>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
          <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-semibold text-slate-700 px-1.5 min-w-[110px] text-center">
            {formatMonth(currentMonth)}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={handleExcelExport} className="hidden sm:flex">
          <FileSpreadsheet className="h-4 w-4" />
          Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handlePDFExport} className="hidden sm:flex">
          <Download className="h-4 w-4" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmClear(true)}
          className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>

      {/* Schedule table */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse" style={{ minWidth: `${200 + days.length * 52}px` }}>
          <thead className="sticky top-0 z-20 bg-white shadow-sm">
            <tr>
              <th className="sticky left-0 z-30 bg-white px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 min-w-[160px]">
                Employee
              </th>
              {days.map((date) => {
                const d = dayjs(date);
                const weekend = isWeekend(date);
                const today = isToday(date);
                return (
                  <th
                    key={date}
                    className={`px-1 py-2 text-center text-xs font-medium min-w-[52px] border-r border-slate-50 ${
                      weekend ? 'bg-slate-50' : ''
                    } ${today ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-[10px] uppercase ${weekend ? 'text-slate-400' : 'text-slate-400'}`}>
                      {DAY_NAMES[d.day()]}
                    </div>
                    <div
                      className={`font-bold text-sm mt-0.5 ${
                        today
                          ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                          : weekend
                          ? 'text-slate-400'
                          : 'text-slate-700'
                      }`}
                    >
                      {d.date()}
                    </div>
                  </th>
                );
              })}
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[120px]">
                Summary
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member, idx) => {
              const counts = getShiftCounts(member.id);
              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-slate-50 hover:bg-slate-50/30 group"
                >
                  {/* Staff name */}
                  <td className="sticky left-0 bg-white group-hover:bg-slate-50/80 z-10 px-4 py-2 border-r border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member.name} size="xs" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 whitespace-nowrap">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{member.role}</div>
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {days.map((date) => {
                    const entry = entries.find((e) => e.staffId === member.id && e.date === date);
                    const weekend = isWeekend(date);
                    const today = isToday(date);

                    return (
                      <td
                        key={date}
                        className={`schedule-cell text-center border-r border-slate-50 ${
                          weekend ? 'bg-slate-50/50' : ''
                        } ${today ? 'bg-blue-50/30' : ''}`}
                        onClick={() => handleCellClick(member.id, date, member.name)}
                      >
                        {entry ? (
                          <ShiftBadge shift={entry.shift} size="xs" />
                        ) : (
                          <span className="text-slate-200 text-xs font-light">—</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Summary */}
                  <td className="px-2 py-2 text-center">
                    <div className="flex flex-col gap-0.5 items-center">
                      <div className="flex gap-1 text-[10px] flex-wrap justify-center">
                        {counts.morning > 0 && (
                          <span className="font-semibold text-green-600">M:{counts.morning}</span>
                        )}
                        {counts.evening > 0 && (
                          <span className="font-semibold text-blue-600">E:{counts.evening}</span>
                        )}
                        {counts.night > 0 && (
                          <span className="font-semibold text-purple-600">N:{counts.night}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {counts.hours}h
                      </div>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Shift Legend */}
      <div className="px-4 md:px-6 py-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-slate-400 mr-1">Legend:</span>
        {['morning', 'evening', 'night', 'off', 'vacation', 'sick', 'training', 'meeting', 'oncall'].map((s) => {
          const def = getShiftDefinition(s as ShiftType);
          return (
            <span
              key={s}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: def.bgColor, color: def.textColor }}
            >
              {def.shortLabel} = {def.label}
            </span>
          );
        })}
      </div>

      {/* Shift edit modal */}
      <Modal
        open={!!editCell}
        onClose={() => setEditCell(null)}
        title="Assign Shift"
        description={editCell ? `${editCell.staffName} · ${dayjs(editCell.date).format('dddd, D MMMM YYYY')}` : ''}
        size="sm"
      >
        {editCell && (
          <div className="space-y-4">
            {currentEntry && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Current shift:</span>
                <ShiftBadge shift={currentEntry.shift} size="sm" showLabel />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Select new shift:</p>
              <ShiftPicker
                value={currentEntry?.shift}
                onChange={handleShiftSelect}
                onClear={currentEntry ? handleClearShift : undefined}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Clear confirmation modal */}
      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear Schedule"
        description="This action cannot be undone."
        size="sm"
      >
        <p className="text-sm text-slate-600 mb-4">
          Are you sure you want to clear all shifts for{' '}
          <strong>{dept.name}</strong> in <strong>{formatMonth(currentMonth)}</strong>?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setConfirmClear(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearMonth}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </Modal>
    </div>
  );
};
