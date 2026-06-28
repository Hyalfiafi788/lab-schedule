import fs from 'fs';
import path from 'path';
import { app, dialog, BrowserWindow } from 'electron';
import { dbAll, dbSet } from './database';
import log from 'electron-log';

export interface BackupData {
  version: string;
  exportedAt: string;
  appVersion: string;
  entries: { key: string; value: string }[];
}

export async function exportBackup(win: BrowserWindow): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Export Backup',
      defaultPath: path.join(
        app.getPath('documents'),
        `lab-schedule-backup-${new Date().toISOString().slice(0, 10)}.json`
      ),
      filters: [{ name: 'JSON Backup', extensions: ['json'] }],
    });

    if (!filePath) return { success: false };

    const entries = dbAll();
    const backup: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appVersion: app.getVersion(),
      entries,
    };

    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2), 'utf8');
    log.info('Backup exported to:', filePath);
    return { success: true, filePath };
  } catch (error) {
    log.error('Backup export failed:', error);
    return { success: false, error: String(error) };
  }
}

export async function importBackup(win: BrowserWindow): Promise<{ success: boolean; error?: string }> {
  try {
    const { filePaths } = await dialog.showOpenDialog(win, {
      title: 'Import Backup',
      filters: [{ name: 'JSON Backup', extensions: ['json'] }],
      properties: ['openFile'],
    });

    if (!filePaths.length) return { success: false };

    const raw = fs.readFileSync(filePaths[0], 'utf8');
    const backup: BackupData = JSON.parse(raw);

    if (!backup.version || !backup.entries) {
      throw new Error('Invalid backup file format');
    }

    // Restore all key-value pairs
    for (const { key, value } of backup.entries) {
      dbSet(key, value);
    }

    log.info('Backup imported from:', filePaths[0], `(${backup.entries.length} entries)`);
    return { success: true };
  } catch (error) {
    log.error('Backup import failed:', error);
    return { success: false, error: String(error) };
  }
}

export async function autoBackup(): Promise<void> {
  try {
    const backupDir = path.join(app.getPath('userData'), 'auto-backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const filename = `auto-${new Date().toISOString().slice(0, 10)}.json`;
    const backupPath = path.join(backupDir, filename);

    const entries = dbAll();
    const backup: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appVersion: app.getVersion(),
      entries,
    };

    fs.writeFileSync(backupPath, JSON.stringify(backup), 'utf8');

    // Keep only the last 7 daily backups
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('auto-') && f.endsWith('.json'))
      .sort()
      .reverse();

    for (const old of files.slice(7)) {
      fs.unlinkSync(path.join(backupDir, old));
    }

    log.info('Auto-backup written:', backupPath);
  } catch (error) {
    log.error('Auto-backup failed:', error);
  }
}
