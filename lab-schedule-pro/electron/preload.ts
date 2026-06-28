import { contextBridge, ipcRenderer } from 'electron';

// Typed API exposed to the renderer via window.electronAPI
const electronAPI = {
  // SQLite-backed key-value store (replaces localStorage for Zustand persist)
  store: {
    get: (key: string): Promise<string | null> =>
      ipcRenderer.invoke('db:get', key),
    set: (key: string, value: string): Promise<void> =>
      ipcRenderer.invoke('db:set', key, value),
    remove: (key: string): Promise<void> =>
      ipcRenderer.invoke('db:delete', key),
  },

  // App metadata
  app: {
    version: (): Promise<string> => ipcRenderer.invoke('app:version'),
    userData: (): Promise<string> => ipcRenderer.invoke('app:userData'),
    dbPath: (): Promise<string> => ipcRenderer.invoke('app:dbPath'),
    logPath: (): Promise<string> => ipcRenderer.invoke('app:logPath'),
  },

  // Backup & Restore
  backup: {
    export: (): Promise<{ success: boolean; filePath?: string; error?: string }> =>
      ipcRenderer.invoke('backup:export'),
    import: (): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('backup:import'),
    onRestored: (cb: () => void) => {
      ipcRenderer.on('backup:restored', cb);
      return () => ipcRenderer.removeListener('backup:restored', cb);
    },
  },

  // Print
  print: {
    page: (): Promise<void> => ipcRenderer.invoke('print:page'),
    toPdf: (options?: { filename?: string }): Promise<{ success: boolean; filePath?: string }> =>
      ipcRenderer.invoke('print:pdf', options),
  },

  // Shell
  shell: {
    openExternal: (url: string): Promise<void> =>
      ipcRenderer.invoke('shell:openExternal', url),
    openPath: (filePath: string): Promise<void> =>
      ipcRenderer.invoke('shell:openPath', filePath),
  },

  // Native menu events sent to renderer
  menu: {
    onPrint: (cb: () => void) => {
      ipcRenderer.on('menu:print', cb);
      return () => ipcRenderer.removeListener('menu:print', cb);
    },
  },

  // Logging from renderer to main process log file
  log: {
    error: (message: string, stack?: string) =>
      ipcRenderer.send('log:error', message, stack),
    warn: (message: string) => ipcRenderer.send('log:warn', message),
    info: (message: string) => ipcRenderer.send('log:info', message),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for window.electronAPI (used in renderer TypeScript)
export type ElectronAPI = typeof electronAPI;
