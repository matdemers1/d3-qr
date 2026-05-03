import { create } from 'zustand';
import type { BatchRow, Config, SavedBatch } from '../types';
import { newId } from '../lib/id';
import { validateUrl } from '../lib/url';

const DEFAULT_CONFIG: Config = {
  pageSize: 'letter',
  errorCorrection: 'M',
  showPageNumbers: true,
  showUrlBelowQr: true,
  fgColor: '#000000',
  bgColor: '#ffffff',
};

interface BatchState {
  rows: BatchRow[];
  config: Config;
}

interface BatchActions {
  addRow: (url: string, label?: string) => string;
  importRows: (rows: Array<{ url: string; label?: string }>) => void;
  updateRow: (id: string, patch: Partial<Omit<BatchRow, 'id'>>) => void;
  removeRow: (id: string) => void;
  reorderRow: (fromIdx: number, toIdx: number) => void;
  clearRows: () => void;
  setConfig: (patch: Partial<Config>) => void;
  resetConfig: () => void;
  loadBatch: (batch: SavedBatch) => void;
  exportBatch: () => SavedBatch;
}

export type BatchStore = BatchState & BatchActions;

function makeRow(url: string, label?: string): BatchRow {
  return {
    id: newId(),
    url,
    label,
    valid: validateUrl(url).valid,
  };
}

export const useBatchStore = create<BatchStore>((set, get) => ({
  rows: [],
  config: DEFAULT_CONFIG,

  addRow: (url, label) => {
    const row = makeRow(url, label);
    set((state) => ({ rows: [...state.rows, row] }));
    return row.id;
  },

  importRows: (incoming) => {
    set((state) => ({
      rows: [...state.rows, ...incoming.map((r) => makeRow(r.url, r.label))],
    }));
  },

  updateRow: (id, patch) => {
    set((state) => ({
      rows: state.rows.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...patch };
        if (patch.url !== undefined) {
          next.valid = validateUrl(next.url).valid;
        }
        return next;
      }),
    }));
  },

  removeRow: (id) => {
    set((state) => ({ rows: state.rows.filter((r) => r.id !== id) }));
  },

  reorderRow: (fromIdx, toIdx) => {
    set((state) => {
      if (
        fromIdx < 0 ||
        toIdx < 0 ||
        fromIdx >= state.rows.length ||
        toIdx >= state.rows.length ||
        fromIdx === toIdx
      ) {
        return state;
      }
      const next = state.rows.slice();
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return { rows: next };
    });
  },

  clearRows: () => set({ rows: [] }),

  setConfig: (patch) =>
    set((state) => ({ config: { ...state.config, ...patch } })),

  resetConfig: () => set({ config: DEFAULT_CONFIG }),

  loadBatch: (batch) => {
    set({
      rows: batch.rows.map((r) => makeRow(r.url, r.label)),
      config: { ...DEFAULT_CONFIG, ...batch.config },
    });
  },

  exportBatch: () => {
    const { rows, config } = get();
    return {
      version: 1,
      rows: rows.map(({ url, label }) => ({ url, label })),
      config,
    };
  },
}));

export const DEFAULT_BATCH_CONFIG = DEFAULT_CONFIG;
