/**
 * Type declaration for the Electron contextBridge API
 * exposed to the renderer via preload.ts.
 */
interface ElectronStore {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

interface ElectronAPI {
  store: ElectronStore;
  app: {
    version: () => Promise<string>;
    userData: () => Promise<string>;
    dbPath: () => Promise<string>;
    logPath: () => Promise<string>;
  };
  backup: {
    export: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
    import: () => Promise<{ success: boolean; error?: string }>;
    onRestored: (cb: () => void) => () => void;
  };
  print: {
    page: () => Promise<void>;
    toPdf: (options?: { filename?: string }) => Promise<{ success: boolean; filePath?: string }>;
  };
  shell: {
    openExternal: (url: string) => Promise<void>;
    openPath: (filePath: string) => Promise<void>;
  };
  menu: {
    onPrint: (cb: () => void) => () => void;
  };
  log: {
    error: (message: string, stack?: string) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
  };
}

interface Window {
  electronAPI?: ElectronAPI;
}
