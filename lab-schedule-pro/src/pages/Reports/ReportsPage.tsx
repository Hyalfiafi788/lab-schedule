import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, FileSpreadsheet, Download, Printer, User,
} from 'lucide-react';
import { getShiftDefinition } from '../../data/shifts';
import { useStaffStore } from '../../store/staffStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useUIStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToast } from '../../components/ui/Toast';
import type { DepartmentId } from '../../types';
import { getDepartmentById } from '../../data/departments';
import { formatMonth } from '../../utils/schedule';
import { exportToExcel, exportToPDF, exportIndividualPDF } from '../../utils/export';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';

export const ReportsPage = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const deptId = departmentId as DepartmentId;

  const { getStaffByDepartment } = useStaffStore();
  const { getDepartmentMonthEntries, getStaffMonthEntries } = useScheduleStore();
  const { currentMonth } = useUIStore();
  const { settings } = useSettingsStore();
  const { toast } = useToast();

  const dept = getDepartmentById(deptId);
  const staff = getStaffByDepartment(deptId);
  const entries = getDepartmentMonthEntries(deptId, currentMonth);

  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (actionId: string, fn: () => void) => {
    setLoading(actionId);
    await new Promise((r) => setTimeout(r, 300));
    try {
      fn();
    } finally {
      setLoading(null);
    }
  };

  const reportCards = [
    {
      id: 'dept-pdf',
      title: 'Department Monthly PDF',
      description: `Full schedule for all ${staff.length} staff members`,
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      bg: 'bg-blue-50',
      action: () => {
        exportToPDF(staff, entries, deptId, currentMonth, settings.hospitalName);
        toast('Department PDF downloaded', 'success');
      },
      label: 'Download PDF',
      variant: 'default' as const,
    },
    {
      id: 'dept-excel',
      title: 'Department Excel Export',
      description: 'Spreadsheet format for data analysis',
      icon: <FileSpreadsheet className="h-6 w-6 text-green-600" />,
      bg: 'bg-green-50',
      action: () => {
        exportToExcel(staff, entries, deptId, currentMonth);
        toast('Excel file downloaded', 'success');
      },
      label: 'Download Excel',
      variant: 'outline' as const,
    },
    {
      id: 'print',
      title: 'Print Schedule',
      description: 'Open browser print dialog for direct printing',
      icon: <Printer className="h-6 w-6 text-slate-600" />,
      bg: 'bg-slate-50',
      action: () => window.print(),
      label: 'Print Now',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
            <h2 className="text-xl font-bold text-slate-900">{dept.name}</h2>
          </div>
          <p className="text-sm text-slate-500">Reports for {formatMonth(currentMonth)}</p>
        </div>
        <Badge variant="info">{entries.length} entries</Badge>
      </div>

      {/* Department reports */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Department Reports
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reportCards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="card-hover h-full">
                <CardContent className="p-5">
                  <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center mb-4`}>
                    {card.icon}
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1.5">{card.title}</h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">{card.description}</p>
                  <Button
                    variant={card.variant}
                    size="sm"
                    className="w-full"
                    loading={loading === card.id}
                    onClick={() => handleAction(card.id, card.action)}
                  >
                    <Download className="h-4 w-4" />
                    {card.label}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Individual reports */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Individual Staff Reports
        </h3>
        <Card>
          <div className="divide-y divide-slate-50">
            {staff.map((member, idx) => {
              const memberEntries = getStaffMonthEntries(member.id, currentMonth);
              const workingDays = memberEntries.filter((e) => {
                const def = getShiftDefinition(e.shift);
                return def.isWorking;
              }).length;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{member.name}</div>
                    <div className="text-xs text-slate-400">{member.role}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-slate-700">{workingDays} shifts</div>
                    <div className="text-xs text-slate-400">{formatMonth(currentMonth)}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={loading === `ind-${member.id}`}
                    onClick={() =>
                      handleAction(`ind-${member.id}`, () => {
                        exportIndividualPDF(member, memberEntries, currentMonth, settings.hospitalName);
                        toast(`PDF for ${member.name} downloaded`, 'success');
                      })
                    }
                  >
                    <User className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
