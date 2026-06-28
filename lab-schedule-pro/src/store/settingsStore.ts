import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, ShiftDefinition } from '../types';
import { DEFAULT_SETTINGS } from '../data/settings';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateShiftDefinition: (id: string, updates: Partial<ShiftDefinition>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) => {
        set({ settings: { ...get().settings, ...updates } });
      },

      updateShiftDefinition: (id, updates) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            shiftDefinitions: settings.shiftDefinitions.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          },
        });
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'lab-schedule-settings',
    }
  )
);
