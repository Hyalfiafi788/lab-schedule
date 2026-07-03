'use strict';

const { app, BrowserWindow, shell, Menu, protocol, net } = require('electron');
const path = require('path');
const url = require('url');

// Register the custom scheme BEFORE app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      allowServiceWorkers: true,
      corsEnabled: false,
    },
  },
]);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Lab Schedule Pro',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false,
  });

  // Load using the custom 'app://' scheme – BrowserRouter sees a normal origin
  mainWindow.loadURL('app://./index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in the default browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler(({ url: linkUrl }) => {
    if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
      shell.openExternal(linkUrl);
    }
    return { action: 'deny' };
  });

  // Remove default menu bar for a cleaner desktop-app feel
  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  const distPath = path.join(app.getAppPath(), 'dist');

  // Serve all requests under app:// from the dist/ directory.
  // Any path that doesn't resolve to a real file falls back to index.html
  // so that react-router-dom's BrowserRouter handles SPA navigation.
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url);
    // Decode and strip the leading '/'
    const relative = decodeURIComponent(pathname.replace(/^\//, ''));
    const filePath = relative ? path.join(distPath, relative) : path.join(distPath, 'index.html');

    return net.fetch(
      url.pathToFileURL(filePath).toString()
    ).catch(() =>
      // Fallback to index.html for any path not found (SPA routing)
      net.fetch(url.pathToFileURL(path.join(distPath, 'index.html')).toString())
    );
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
