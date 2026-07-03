import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DepartmentId, HandoverRecord, HandoverShiftCode } from '../types';

type HandoverDraft = Omit<HandoverRecord, 'id' | 'createdAt' | 'updatedAt'>;

interface HandoverState {
  records: HandoverRecord[];
  upsertRecord: (record: HandoverDraft) => HandoverRecord;
  getRecord: (departmentId: DepartmentId, date: string, shiftCode: HandoverShiftCode) => HandoverRecord | undefined;
  getDepartmentRecords: (departmentId: DepartmentId) => HandoverRecord[];
}

export const useHandoverStore = create<HandoverState>()(
  persist(
    (set, get) => ({
      records: [],

      upsertRecord: (record) => {
        const now = new Date().toISOString();
        const id = `${record.departmentId}-${record.date}-${record.shiftCode}`;
        const existing = get().records.find((item) => item.id === id);
        const saved: HandoverRecord = {
          ...record,
          id,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };

        set({
          records: existing
            ? get().records.map((item) => (item.id === id ? saved : item))
            : [...get().records, saved],
        });

        return saved;
      },

      getRecord: (departmentId, date, shiftCode) => {
        return get().records.find(
          (record) =>
            record.departmentId === departmentId &&
            record.date === date &&
            record.shiftCode === shiftCode
        );
      },

      getDepartmentRecords: (departmentId) => {
        return get().records.filter((record) => record.departmentId === departmentId);
      },
    }),
    {
      name: 'lab-handover-records',
    }
  )
);
