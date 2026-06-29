const STORAGE_KEYS = ['lab-staff-data', 'lab-schedule-entries', 'lab-schedule-settings'] as const;

export interface BackupPayload {
  app: 'lab-schedule-pro';
  version: 1;
  exportedAt: string;
  data: Record<(typeof STORAGE_KEYS)[number], string | null>;
}

export const createBackupPayload = (): BackupPayload => {
  return {
    app: 'lab-schedule-pro',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: STORAGE_KEYS.reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {} as BackupPayload['data']),
  };
};

export const downloadBackup = () => {
  const payload = createBackupPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `lab-schedule-pro-backup-${payload.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const restoreBackup = async (file: File) => {
  const raw = await file.text();
  const parsed = JSON.parse(raw) as BackupPayload;

  if (parsed.app !== 'lab-schedule-pro' || parsed.version !== 1 || typeof parsed.data !== 'object') {
    throw new Error('Invalid Lab Schedule Pro backup file.');
  }

  STORAGE_KEYS.forEach((key) => {
    const value = parsed.data[key];
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    }
  });
};
