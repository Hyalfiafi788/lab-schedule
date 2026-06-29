import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Building2, Clock, Calendar, Palette, Save, RotateCcw, Settings as SettingsIcon, Download, Upload, ShieldCheck,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useToast } from '../../components/ui/toast-context';
import type { WeekDay } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { downloadBackup, restoreBackup } from '../../utils/backup';

const WEEK_DAYS_OPTIONS = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'saturday', label: 'Saturday' },
];

export const SettingsPage = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { toast } = useToast();
  const restoreInputRef = React.useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      hospitalName: settings.hospitalName,
      weekStartDay: settings.weekStartDay,
      defaultVacationDays: settings.defaultVacationDays,
      maxWeeklyHours: settings.maxWeeklyHours,
      minRestHours: settings.minRestHours,
    },
  });

  const onSubmit = (data: any) => {
    updateSettings({
      hospitalName: data.hospitalName,
      weekStartDay: data.weekStartDay as WeekDay,
      defaultVacationDays: Number(data.defaultVacationDays),
      maxWeeklyHours: Number(data.maxWeeklyHours),
      minRestHours: Number(data.minRestHours),
    });
    toast('Settings saved successfully', 'success');
  };

  const handleReset = () => {
    resetSettings();
    reset({
      hospitalName: settings.hospitalName,
      weekStartDay: settings.weekStartDay,
      defaultVacationDays: settings.defaultVacationDays,
      maxWeeklyHours: settings.maxWeeklyHours,
      minRestHours: settings.minRestHours,
    });
    toast('Settings reset to defaults', 'info');
  };

  const handleExportBackup = () => {
    downloadBackup();
    toast('Backup file downloaded', 'success');
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await restoreBackup(file);
      toast('Backup restored. Reloading app...', 'success');
      window.setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Backup restore failed', 'error');
    } finally {
      event.target.value = '';
    }
  };

  const settingSections = [
    {
      id: 'hospital',
      title: 'Hospital Information',
      icon: <Building2 className="h-5 w-5 text-blue-600" />,
      fields: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Hospital Name"
            placeholder="e.g. King Abdulaziz Medical City"
            {...register('hospitalName')}
            className="sm:col-span-2"
          />
        </div>
      ),
    },
    {
      id: 'schedule',
      title: 'Schedule Configuration',
      icon: <Calendar className="h-5 w-5 text-green-600" />,
      fields: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Week Start Day"
            options={WEEK_DAYS_OPTIONS}
            {...register('weekStartDay')}
          />
          <Input
            label="Default Vacation Days / Year"
            type="number"
            min={0}
            max={60}
            {...register('defaultVacationDays')}
          />
        </div>
      ),
    },
    {
      id: 'hours',
      title: 'Working Hours Rules',
      icon: <Clock className="h-5 w-5 text-purple-600" />,
      fields: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Maximum Weekly Hours"
            type="number"
            min={20}
            max={80}
            {...register('maxWeeklyHours')}
          />
          <Input
            label="Minimum Rest Between Shifts (hours)"
            type="number"
            min={6}
            max={24}
            {...register('minRestHours')}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Configure your scheduling system</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {settingSections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-50 rounded-xl">{section.icon}</div>
                  <CardTitle>{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>{section.fields}</CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </form>

      {/* Data safety */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="overflow-hidden border-white/70 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Elite Data Safety</CardTitle>
                <p className="text-sm text-slate-500">Export or restore a complete local backup.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">Backup includes staff, schedules, and settings.</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Use this before major schedule changes or when moving the app to another Windows computer.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={handleExportBackup}>
                  <Download className="h-4 w-4" />
                  Export Backup
                </Button>
                <Button type="button" variant="navy" onClick={() => restoreInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Restore Backup
                </Button>
              </div>
            </div>
            <input
              ref={restoreInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleRestoreBackup}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Shift colors reference */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-50 rounded-xl">
                <Palette className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle>Shift Colors Reference</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {settings.shiftDefinitions.map((shift) => (
                <div
                  key={shift.id}
                  className="rounded-xl p-3 text-center border"
                  style={{
                    backgroundColor: shift.bgColor,
                    borderColor: `${shift.color}30`,
                  }}
                >
                  <div
                    className="text-lg font-bold mb-0.5"
                    style={{ color: shift.textColor }}
                  >
                    {shift.shortLabel}
                  </div>
                  <div className="text-xs font-medium" style={{ color: shift.textColor }}>
                    {shift.label}
                  </div>
                  {shift.hours ? (
                    <div className="text-[10px] text-slate-400 mt-1">{shift.hours}h shift</div>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* App info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">LAB Schedule Pro</p>
              <p className="text-xs text-slate-400">
                Version 1.0.0 · Built for Hospital Laboratory Management
              </p>
            </div>
            <div className="text-xs text-slate-400 text-right">
              <p>Ready for Supabase integration</p>
              <p>PWA Enabled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
