import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import type { ScheduleEntry, Staff, DepartmentId } from '../types';
import { getShiftDefinition, SHIFT_DEFINITIONS } from '../data/shifts';
import { getDaysInMonth, formatMonth } from './schedule';
import { getDepartmentById } from '../data/departments';

export const exportToExcel = (
  staff: Staff[],
  entries: ScheduleEntry[],
  departmentId: DepartmentId,
  month: string
) => {
  const dept = getDepartmentById(departmentId);
  const days = getDaysInMonth(month);
  const headers = ['Employee', 'Role', ...days.map((d) => dayjs(d).format('D')), 'Total Days', 'Total Hours'];

  const rows = staff.map((s) => {
    const staffEntries = entries.filter((e) => e.staffId === s.id);
    let totalDays = 0;
    let totalHours = 0;

    const shiftCells = days.map((date) => {
      const entry = staffEntries.find((e) => e.date === date);
      if (!entry) return '';
      const def = getShiftDefinition(entry.shift);
      if (def.isWorking) {
        totalDays++;
        totalHours += def.hours ?? 0;
      }
      return def.shortLabel;
    });

    return [s.name, s.role, ...shiftCells, totalDays, totalHours];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${dept.shortName} ${month}`);

  ws['!cols'] = [{ wch: 25 }, { wch: 20 }, ...days.map(() => ({ wch: 6 })), { wch: 12 }, { wch: 12 }];

  XLSX.writeFile(wb, `${dept.name}_Schedule_${month}.xlsx`);
};

export const exportToPDF = (
  staff: Staff[],
  entries: ScheduleEntry[],
  departmentId: DepartmentId,
  month: string,
  hospitalName: string
) => {
  const dept = getDepartmentById(departmentId);
  const days = getDaysInMonth(month);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });

  // Header
  doc.setFillColor(13, 33, 55);
  doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(hospitalName, 14, 9);
  doc.setFontSize(10);
  doc.text(`${dept.name} Department — Schedule ${formatMonth(month)}`, 14, 16);
  doc.setTextColor(0, 0, 0);

  const shiftColorMap: Record<string, [number, number, number]> = {
    morning: [220, 252, 231],
    evening: [219, 234, 254],
    night: [237, 233, 254],
    off: [243, 244, 246],
    vacation: [254, 249, 195],
    sick: [254, 226, 226],
    training: [255, 237, 213],
    meeting: [207, 250, 254],
    oncall: [252, 231, 243],
  };

  const tableHead = [
    ['Employee', 'Role', ...days.map((d) => dayjs(d).format('D')), 'Days', 'Hrs'],
  ];

  const tableBody = staff.map((s) => {
    const staffEntries = entries.filter((e) => e.staffId === s.id);
    let totalDays = 0;
    let totalHours = 0;

    const cells = days.map((date) => {
      const entry = staffEntries.find((e) => e.date === date);
      if (!entry) return '';
      const def = getShiftDefinition(entry.shift);
      if (def.isWorking) {
        totalDays++;
        totalHours += def.hours ?? 0;
      }
      return def.shortLabel;
    });

    return [s.name, s.role, ...cells, totalDays.toString(), totalHours.toString()];
  });

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 24,
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
    headStyles: {
      fillColor: [26, 115, 232],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 7,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 28 },
      1: { halign: 'left', cellWidth: 22 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index > 1) {
        const cellValue = data.cell.raw as string;
        const shiftDef = SHIFT_DEFINITIONS.find((s) => s.shortLabel === cellValue);
        if (shiftDef) {
          const color = shiftColorMap[shiftDef.id];
          if (color) data.cell.styles.fillColor = color;
        }
      }
    },
    margin: { top: 24, right: 5, bottom: 10, left: 5 },
  });

  doc.save(`${dept.name}_Schedule_${month}.pdf`);
};

export const exportIndividualPDF = (
  staff: Staff,
  entries: ScheduleEntry[],
  month: string,
  hospitalName: string
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const days = getDaysInMonth(month);

  doc.setFillColor(13, 33, 55);
  doc.rect(0, 0, doc.internal.pageSize.width, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(hospitalName, 14, 10);
  doc.setFontSize(11);
  doc.text(`Individual Schedule — ${formatMonth(month)}`, 14, 18);
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(staff.name, 14, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Role: ${staff.role}  |  Employee #: ${staff.employeeNumber ?? 'N/A'}`, 14, 39);

  let morningCount = 0, eveningCount = 0, nightCount = 0, offCount = 0, vacCount = 0;

  const tableBody = days.map((date) => {
    const entry = entries.find((e) => e.staffId === staff.id && e.date === date);
    const dayName = dayjs(date).format('dddd');
    const dayNum = dayjs(date).format('D MMM');

    if (!entry) return [dayNum, dayName, '-', ''];
    const def = getShiftDefinition(entry.shift);
    if (entry.shift === 'morning') morningCount++;
    if (entry.shift === 'evening') eveningCount++;
    if (entry.shift === 'night') nightCount++;
    if (entry.shift === 'off') offCount++;
    if (entry.shift === 'vacation') vacCount++;

    return [dayNum, dayName, def.label, entry.note ?? ''];
  });

  autoTable(doc, {
    head: [['Date', 'Day', 'Shift', 'Note']],
    body: tableBody,
    startY: 45,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [26, 115, 232], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary:', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Morning: ${morningCount}  Evening: ${eveningCount}  Night: ${nightCount}  OFF: ${offCount}  Vacation: ${vacCount}`,
    14,
    finalY + 7
  );

  doc.save(`${staff.name.replace(/\s+/g, '_')}_Schedule_${month}.pdf`);
};
