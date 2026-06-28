/**
 * Custom Zustand persist storage adapter.
 * - In Electron: persists via IPC → SQLite (main process).
 * - In browser / dev mode: falls back to localStorage.
 *
 * Pass `electronStorage` to `createJSONStorage(() => electronStorage)`
 * in each Zustand persist config.
 */
import { createJSONStorage } from 'zustand/middleware';

const isElectron = (): boolean =>
  typeof window !== 'undefined' && !!window.electronAPI?.store;

/** Raw string-based StateStorage that createJSONStorage wraps. */
const rawStorage = {
  getItem: (name: string): Promise<string | null> | string | null => {
    if (isElectron()) {
      return window.electronAPI!.store.get(name);
    }
    return localStorage.getItem(name);
  },

  setItem: (name: string, value: string): Promise<void> | void => {
    if (isElectron()) {
      return window.electronAPI!.store.set(name, value);
    }
    localStorage.setItem(name, value);
  },

  removeItem: (name: string): Promise<void> | void => {
    if (isElectron()) {
      return window.electronAPI!.store.remove(name);
    }
    localStorage.removeItem(name);
  },
};

/** Drop-in replacement for `createJSONStorage(() => localStorage)` */
export const electronStorage = createJSONStorage(() => rawStorage);
