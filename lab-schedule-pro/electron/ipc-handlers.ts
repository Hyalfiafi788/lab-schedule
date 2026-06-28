import { ipcMain, app, shell, BrowserWindow, dialog } from 'electron';
import { dbGet, dbSet, dbDelete, getDbPath } from './database';
import { exportBackup, importBackup } from './backup';
import { getLogPath } from './logger';
import log from 'electron-log';

export function registerIpcHandlers(): void {
  // ── Database (key-value store for Zustand persistence) ──────────────────
  ipcMain.handle('db:get', (_event, key: string) => {
    return dbGet(key);
  });

  ipcMain.handle('db:set', (_event, key: string, value: string) => {
    dbSet(key, value);
  });

  ipcMain.handle('db:delete', (_event, key: string) => {
    dbDelete(key);
  });

  // ── App info ─────────────────────────────────────────────────────────────
  ipcMain.handle('app:version', () => app.getVersion());
  ipcMain.handle('app:userData', () => app.getPath('userData'));
  ipcMain.handle('app:dbPath', () => getDbPath());
  ipcMain.handle('app:logPath', () => getLogPath());

  // ── Backup / Restore ─────────────────────────────────────────────────────
  ipcMain.handle('backup:export', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, error: 'No window' };
    return exportBackup(win);
  });

  ipcMain.handle('backup:import', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, error: 'No window' };
    const result = await importBackup(win);
    // Tell renderer to reload stores
    if (result.success) event.sender.send('backup:restored');
    return result;
  });

  // ── Shell / OS integration ───────────────────────────────────────────────
  ipcMain.handle('shell:openExternal', (_event, url: string) => {
    return shell.openExternal(url);
  });

  ipcMain.handle('shell:openPath', (_event, filePath: string) => {
    return shell.openPath(filePath);
  });

  // ── Print ────────────────────────────────────────────────────────────────
  ipcMain.handle('print:page', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    win.webContents.print({
      silent: false,
      printBackground: true,
      deviceName: '',
    }, (success, failureReason) => {
      if (!success) log.warn('Print failed:', failureReason);
    });
  });

  ipcMain.handle('print:pdf', async (event, options: { filename?: string } = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false };

    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Save as PDF',
      defaultPath: options.filename ?? 'schedule.pdf',
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
    });

    if (!filePath) return { success: false };

    const data = await win.webContents.printToPDF({
      printBackground: true,
      landscape: true,
      pageSize: 'A4',
    });

    const fs = await import('fs');
    fs.writeFileSync(filePath, data);
    log.info('PDF saved to:', filePath);
    return { success: true, filePath };
  });

  // ── Error logging from renderer ──────────────────────────────────────────
  ipcMain.on('log:error', (_event, message: string, stack?: string) => {
    log.error('[Renderer]', message, stack ?? '');
  });

  ipcMain.on('log:warn', (_event, message: string) => {
    log.warn('[Renderer]', message);
  });

  ipcMain.on('log:info', (_event, message: string) => {
    log.info('[Renderer]', message);
  });
}
