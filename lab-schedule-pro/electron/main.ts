import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'path';
import { initLogger, log } from './logger';
import { initDatabase, closeDatabase } from './database';
import { registerIpcHandlers } from './ipc-handlers';
import { createAppMenu } from './menu';
import { autoBackup } from './backup';

const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

// ── Splash screen ─────────────────────────────────────────────────────────
function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 480,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    show: false,
    skipTaskbar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  const splashPath = isDev
    ? path.join(__dirname, '../electron/splash.html')
    : path.join(__dirname, 'splash.html');

  splash.loadFile(splashPath);
  splash.once('ready-to-show', () => splash.show());
  return splash;
}

// ── Main window ───────────────────────────────────────────────────────────
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: 'Lab Schedule Pro',
    icon: path.join(
      app.isPackaged ? process.resourcesPath : path.join(__dirname, '../..'),
      'build',
      process.platform === 'win32' ? 'icon.ico' : 'icon.png'
    ),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    if (process.env.OPEN_DEVTOOLS === '1') {
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // When ready: close splash and show main window
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
        splashWindow = null;
      }
      mainWindow?.show();
      mainWindow?.focus();
    }, isDev ? 0 : 1800); // show splash for 1.8s in production
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Catch renderer crashes
  mainWindow.webContents.on('render-process-gone', (_, details) => {
    log.error('Renderer process gone:', details);
  });
  mainWindow.webContents.on('unresponsive', () => {
    log.warn('Renderer became unresponsive');
  });
}

// ── Auto-backup scheduler (once per day) ─────────────────────────────────
let backupTimer: NodeJS.Timeout | null = null;

function scheduleAutoBackup(): void {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  autoBackup().catch(() => {});
  backupTimer = setInterval(() => autoBackup().catch(() => {}), TWENTY_FOUR_HOURS);
}

// ── App lifecycle ─────────────────────────────────────────────────────────
app.whenReady().then(() => {
  initLogger();
  log.info('App starting…');

  initDatabase();
  registerIpcHandlers();

  splashWindow = createSplashWindow();
  createMainWindow();

  Menu.setApplicationMenu(createAppMenu());
  scheduleAutoBackup();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (backupTimer) clearInterval(backupTimer);
  closeDatabase();
  if (process.platform !== 'darwin') app.quit();
});

// Global error handlers
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason);
});
