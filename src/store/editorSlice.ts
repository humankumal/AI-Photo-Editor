import { create } from 'zustand';
import type { AdjustmentParams } from '@/types/photo';
import type { HistoryEntry } from '@/types/editor';
import { DEFAULT_ADJUSTMENTS, pushHistory } from '@/services/editor/history';

type EditorState = {
  photoId: string | null;
  originalUri: string | null;
  workingUri: string | null;
  adjustments: AdjustmentParams;
  appliedFilterId: string | null;
  history: HistoryEntry[];
  historyIndex: number;
};

type EditorActions = {
  initEditor: (photoId: string, uri: string) => void;
  setWorkingUri: (uri: string) => void;
  applyAdjustment: (params: Partial<AdjustmentParams>) => void;
  applyFilter: (filterId: string, adjustments: AdjustmentParams) => void;
  undo: () => void;
  redo: () => void;
  resetEditor: () => void;
};

const initialState: EditorState = {
  photoId: null,
  originalUri: null,
  workingUri: null,
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  appliedFilterId: null,
  history: [],
  historyIndex: -1,
};

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  ...initialState,

  initEditor(photoId, uri) {
    const entry: HistoryEntry = {
      workingUri: uri,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      appliedFilterId: null,
      timestamp: Date.now(),
    };
    set({
      photoId,
      originalUri: uri,
      workingUri: uri,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      appliedFilterId: null,
      history: [entry],
      historyIndex: 0,
    });
  },

  setWorkingUri(uri) {
    set({ workingUri: uri });
  },

  applyAdjustment(params) {
    const { adjustments, workingUri, appliedFilterId, history, historyIndex } = get();
    const next = { ...adjustments, ...params };
    const entry: HistoryEntry = {
      workingUri: workingUri!,
      adjustments: next,
      appliedFilterId,
      timestamp: Date.now(),
    };
    const trimmed = history.slice(0, historyIndex + 1);
    const newHistory = pushHistory(trimmed, entry);
    set({ adjustments: next, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  applyFilter(filterId, adjustments) {
    const { workingUri, history, historyIndex } = get();
    const entry: HistoryEntry = {
      workingUri: workingUri!,
      adjustments,
      appliedFilterId: filterId,
      timestamp: Date.now(),
    };
    const trimmed = history.slice(0, historyIndex + 1);
    const newHistory = pushHistory(trimmed, entry);
    set({ adjustments, appliedFilterId: filterId, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo() {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const entry = history[newIndex];
    set({ historyIndex: newIndex, workingUri: entry.workingUri, adjustments: entry.adjustments, appliedFilterId: entry.appliedFilterId });
  },

  redo() {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    set({ historyIndex: newIndex, workingUri: entry.workingUri, adjustments: entry.adjustments, appliedFilterId: entry.appliedFilterId });
  },

  resetEditor() {
    const { originalUri, photoId } = get();
    if (originalUri && photoId) {
      get().initEditor(photoId, originalUri);
    }
  },
}));
