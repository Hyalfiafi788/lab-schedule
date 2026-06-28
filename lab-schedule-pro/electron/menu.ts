import { Menu, MenuItemConstructorOptions, app, shell, BrowserWindow, dialog } from 'electron';
import { exportBackup, importBackup } from './backup';
import { getLogPath } from './logger';

export function createAppMenu(): Menu {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const },
      ],
    }] : []),

    // File
    {
      label: '&File',
      submenu: [
        {
          label: 'Export Backup…',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: async () => {
            const win = BrowserWindow.getFocusedWindow();
            if (!win) return;
            const result = await exportBackup(win);
            if (result.success) {
              dialog.showMessageBox(win, {
                type: 'info',
                title: 'Backup Exported',
                message: `Backup saved to:\n${result.filePath}`,
              });
            } else if (result.error) {
              dialog.showErrorBox('Backup Failed', result.error);
            }
          },
        },
        {
          label: 'Import Backup…',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: async () => {
            const win = BrowserWindow.getFocusedWindow();
            if (!win) return;
            const confirm = await dialog.showMessageBox(win, {
              type: 'warning',
              title: 'Import Backup',
              message: 'Importing a backup will overwrite all current data. Continue?',
              buttons: ['Cancel', 'Import'],
              defaultId: 1,
            });
            if (confirm.response !== 1) return;
            const result = await importBackup(win);
            if (result.success) {
              const reload = await dialog.showMessageBox(win, {
                type: 'info',
                title: 'Backup Imported',
                message: 'Backup restored successfully. Reload now?',
                buttons: ['Later', 'Reload Now'],
                defaultId: 1,
              });
              if (reload.response === 1) win.reload();
            } else if (result.error) {
              dialog.showErrorBox('Import Failed', result.error);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Print Schedule',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            win?.webContents.send('menu:print');
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' as const } : { role: 'quit' as const },
      ],
    },

    // Edit
    {
      label: '&Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const },
      ],
    },

    // View
    {
      label: '&View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
        ...( process.env.NODE_ENV === 'development' ? [
          { type: 'separator' as const },
          { role: 'toggleDevTools' as const },
        ] : []),
      ],
    },

    // Tools
    {
      label: '&Tools',
      submenu: [
        {
          label: 'Open Data Folder',
          click: () => shell.openPath(app.getPath('userData')),
        },
        {
          label: 'Open Log File',
          click: () => shell.openPath(getLogPath()),
        },
      ],
    },

    // Help
    {
      label: '&Help',
      submenu: [
        {
          label: 'About Lab Schedule Pro',
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            if (!win) return;
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'About Lab Schedule Pro',
              message: 'Lab Schedule Pro',
              detail: [
                `Version: ${app.getVersion()}`,
                'Company: Al Yamamah Hospital',
                'Description: Laboratory Staff Scheduling System',
                '',
                `Electron: ${process.versions.electron}`,
                `Node.js: ${process.versions.node}`,
                `Chrome: ${process.versions.chrome}`,
              ].join('\n'),
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
