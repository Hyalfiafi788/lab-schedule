import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, FileSpreadsheet, FileText, Printer, Save, ShieldCheck } from 'lucide-react';
import dayjs from 'dayjs';
import type { DepartmentId, HandoverRecord, HandoverShiftCode } from '../../types';
import { getDepartmentById } from '../../data/departments';
import { useHandoverStore } from '../../store/handoverStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToast } from '../../components/ui/toast-context';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { exportHandoverToExcel, exportHandoverToPDF } from '../../utils/export';
import { cn } from '../../utils/cn';

type HandoverForm = Omit<HandoverRecord, 'id' | 'departmentId' | 'date' | 'shiftCode' | 'createdAt' | 'updatedAt'>;

const emptyForm: HandoverForm = {
  outgoingStaff: '',
  incomingStaff: '',
  supervisor: '',
  instrumentsStatus: '',
  qcStatus: '',
  criticalResults: '',
  pendingSamples: '',
  pendingTests: '',
  incidents: '',
  suppliesStatus: '',
  notes: '',
  checklist: {
    patientSafety: false,
    criticalResultsCommunicated: false,
    qcReviewed: false,
    pendingWorkListed: false,
    equipmentIssuesEscalated: false,
    documentationComplete: false,
  },
  outgoingSignature: '',
  incomingSignature: '',
};

const shiftCards: { code: HandoverShiftCode; label: string; time: string }[] = [
  { code: 'A', label: 'Shift A', time: '07:00 - 15:00' },
  { code: 'B', label: 'Shift B', time: '15:00 - 23:00' },
  { code: 'C', label: 'Shift C', time: '23:00 - 07:00' },
];

const checklistLabels: Record<keyof HandoverForm['checklist'], string> = {
  patientSafety: 'Patient safety risks reviewed',
  criticalResultsCommunicated: 'Critical results communicated/escalated',
  qcReviewed: 'QC, calibration, and controls reviewed',
  pendingWorkListed: 'Pending samples/tests clearly listed',
  equipmentIssuesEscalated: 'Equipment issues escalated',
  documentationComplete: 'Documentation complete and signed',
};

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
    />
  </label>
);

export const HandoverPage = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const deptId = (departmentId ?? 'hematology') as DepartmentId;
  const dept = getDepartmentById(deptId);
  const { settings } = useSettingsStore();
  const { getRecord, upsertRecord } = useHandoverStore();
  const { toast } = useToast();

  const [date, setDate] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [shiftCode, setShiftCode] = React.useState<HandoverShiftCode>('A');
  const [form, setForm] = React.useState<HandoverForm>(emptyForm);

  React.useEffect(() => {
    const saved = getRecord(deptId, date, shiftCode);
    setForm(saved ? {
      outgoingStaff: saved.outgoingStaff,
      incomingStaff: saved.incomingStaff,
      supervisor: saved.supervisor,
      instrumentsStatus: saved.instrumentsStatus,
      qcStatus: saved.qcStatus,
      criticalResults: saved.criticalResults,
      pendingSamples: saved.pendingSamples,
      pendingTests: saved.pendingTests,
      incidents: saved.incidents,
      suppliesStatus: saved.suppliesStatus,
      notes: saved.notes,
      checklist: saved.checklist,
      outgoingSignature: saved.outgoingSignature,
      incomingSignature: saved.incomingSignature,
    } : emptyForm);
  }, [date, deptId, getRecord, shiftCode]);

  const updateField = (field: keyof HandoverForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveRecord = () => {
    const saved = upsertRecord({
      ...form,
      departmentId: deptId,
      date,
      shiftCode,
    });
    toast(`Shift ${shiftCode} handover saved`, 'success');
    return saved;
  };

  const handleExportPdf = () => {
    const saved = saveRecord();
    exportHandoverToPDF(saved, settings.hospitalName);
    toast('Handover PDF downloaded', 'success');
  };

  const handleExportExcel = () => {
    const saved = saveRecord();
    exportHandoverToExcel(saved, settings.hospitalName);
    toast('Handover Excel downloaded', 'success');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-blue-950/20 md:p-7"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-3 bg-white/10 text-white ring-1 ring-white/20">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              CAP/ISO-aligned Offline Handover
            </Badge>
            <h1 className="text-2xl font-black md:text-4xl">Shift handover & takeover</h1>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              {dept.name} · structured A/B/C handover, local offline saving, PDF, Excel, and print.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Quality note</div>
            <div className="mt-1 text-sm font-bold">Template ready for local quality approval</div>
          </div>
        </div>
      </motion.div>

      <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
        <CardContent className="space-y-4 p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[180px_1fr]">
            <Input label="Handover Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Shift Code</span>
              <div className="grid grid-cols-3 gap-2">
                {shiftCards.map((shift) => (
                  <button
                    key={shift.code}
                    onClick={() => setShiftCode(shift.code)}
                    className={cn(
                      'rounded-2xl border p-3 text-left transition-all',
                      shiftCode === shift.code
                        ? 'border-blue-500 bg-blue-50 shadow-sm ring-4 ring-blue-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <div className="text-lg font-black text-slate-950">{shift.code}</div>
                    <div className="text-xs font-semibold text-slate-500">{shift.time}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Input label="Outgoing Staff" value={form.outgoingStaff} onChange={(event) => updateField('outgoingStaff', event.target.value)} placeholder="Name / ID" />
            <Input label="Incoming Staff" value={form.incomingStaff} onChange={(event) => updateField('incomingStaff', event.target.value)} placeholder="Name / ID" />
            <Input label="Supervisor" value={form.supervisor} onChange={(event) => updateField('supervisor', event.target.value)} placeholder="Supervisor name" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
          <CardContent className="space-y-4 p-4 md:p-5">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-black text-slate-950">Operational Handover</h2>
            </div>
            <TextArea label="Instruments Status" value={form.instrumentsStatus} onChange={(value) => updateField('instrumentsStatus', value)} placeholder="Analyzer status, maintenance, downtime, alarms..." />
            <TextArea label="QC / Calibration Status" value={form.qcStatus} onChange={(value) => updateField('qcStatus', value)} placeholder="QC pass/fail, calibrations, corrective actions..." />
            <TextArea label="Critical Results" value={form.criticalResults} onChange={(value) => updateField('criticalResults', value)} placeholder="Critical values communicated, pending calls, read-back..." />
            <TextArea label="Incidents / Deviations" value={form.incidents} onChange={(value) => updateField('incidents', value)} placeholder="Nonconformities, safety events, escalations..." />
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
          <CardContent className="space-y-4 p-4 md:p-5">
            <h2 className="text-lg font-black text-slate-950">Pending Work & Readiness</h2>
            <TextArea label="Pending Samples" value={form.pendingSamples} onChange={(value) => updateField('pendingSamples', value)} placeholder="Specimen IDs, priorities, storage conditions..." />
            <TextArea label="Pending Tests" value={form.pendingTests} onChange={(value) => updateField('pendingTests', value)} placeholder="Tests awaiting processing, verification, or send-out..." />
            <TextArea label="Supplies Status" value={form.suppliesStatus} onChange={(value) => updateField('suppliesStatus', value)} placeholder="Reagents, controls, consumables, low stock..." />
            <TextArea label="General Notes" value={form.notes} onChange={(value) => updateField('notes', value)} placeholder="Any additional handover notes..." />
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
        <CardContent className="space-y-5 p-4 md:p-5">
          <div>
            <h2 className="text-lg font-black text-slate-950">CAP/ISO-aligned checklist</h2>
            <p className="text-sm text-slate-500">Designed for documentation completeness, traceability, and shift accountability.</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {Object.entries(checklistLabels).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={form.checklist[key as keyof HandoverForm['checklist']]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      checklist: { ...current.checklist, [key]: event.target.checked },
                    }))
                  }
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Outgoing Signature / Name" value={form.outgoingSignature} onChange={(event) => updateField('outgoingSignature', event.target.value)} placeholder="Outgoing staff confirmation" />
            <Input label="Incoming Signature / Name" value={form.incomingSignature} onChange={(event) => updateField('incomingSignature', event.target.value)} placeholder="Incoming staff confirmation" />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={handleExportPdf}>
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button onClick={saveRecord} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Save className="h-4 w-4" />
              Save Offline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
