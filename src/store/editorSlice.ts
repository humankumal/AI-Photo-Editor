import { create } from 'zustand';
import type { AdjustmentParams } from '@/types/photo';
import type { HistoryEntry, TextLayer } from '@/types/editor';
import { DEFAULT_ADJUSTMENTS, pushHistory } from '@/services/editor/history';

type EditorState = {
  photoId: string | null;
  originalUri: string | null;
  workingUri: string | null;
  adjustments: AdjustmentParams;
  appliedFilterId: string | null;
  textLayers: TextLayer[];
  history: HistoryEntry[];
  historyIndex: number;
};

type EditorActions = {
  initEditor: (photoId: string, uri: string) => void;
  setWorkingUri: (uri: string) => void;
  applyAdjustment: (params: Partial<AdjustmentParams>) => void;
  applyFilter: (filterId: string, adjustments: AdjustmentParams) => void;
  commitTransform: (uri: string) => void;
  addTextLayer: (layer: TextLayer) => void;
  removeTextLayer: (id: string) => void;
  updateTextLayer: (id: string, update: Partial<Pick<TextLayer, 'x' | 'y'>>) => void;
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
  textLayers: [],
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
      textLayers: [],
      timestamp: Date.now(),
    };
    set({
      photoId,
      originalUri: uri,
      workingUri: uri,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      appliedFilterId: null,
      textLayers: [],
      history: [entry],
      historyIndex: 0,
    });
  },

  setWorkingUri(uri) {
    set({ workingUri: uri });
  },

  applyAdjustment(params) {
    const { adjustments, workingUri, appliedFilterId, textLayers, history, historyIndex } = get();
    const next = { ...adjustments, ...params };
    const entry: HistoryEntry = {
      workingUri: workingUri!,
      adjustments: next,
      appliedFilterId,
      textLayers,
      timestamp: Date.now(),
    };
    const trimmed = history.slice(0, historyIndex + 1);
    const newHistory = pushHistory(trimmed, entry);
    set({ adjustments: next, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  applyFilter(filterId, adjustments) {
    const { workingUri, textLayers, history, historyIndex } = get();
    const entry: HistoryEntry = {
      workingUri: workingUri!,
      adjustments,
      appliedFilterId: filterId,
      textLayers,
      timestamp: Date.now(),
    };
    const trimmed = history.slice(0, historyIndex + 1);
    const newHistory = pushHistory(trimmed, entry);
    set({ adjustments, appliedFilterId: filterId, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  commitTransform(uri) {
    const { adjustments, appliedFilterId, textLayers, history, historyIndex } = get();
    const entry: HistoryEntry = {
      workingUri: uri,
      adjustments,
      appliedFilterId,
      textLayers,
      timestamp: Date.now(),
    };
    const trimmed = history.slice(0, historyIndex + 1);
    const newHistory = pushHistory(trimmed, entry);
    set({ workingUri: uri, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  addTextLayer(layer) {
    const { textLayers, workingUri, adjustments, appliedFilterId, history, historyIndex } = get();
    const newLayers = [...textLayers, layer];
    const entry: HistoryEntry = {
      workingUri: workingUri!,
      adjustments,
      appliedFilterId,
      textLayers: newLayers,
      timestamp: Date.now(),
    };
    const trimmed = history.slice(0, historyIndex + 1);
    const newHistory = pushHistory(trimmed, entry);
    set({ textLayers: newLayers, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  removeTextLayer(id) {
    const { textLayers, workingUri, adjustments, appliedFilterId, history, historyIndex } = get();
    const newLayers = textLayers.filter((l) => l.id !== id);
    const entry: HistoryEntry = {
      workingUri: workingUri!,
      adjustments,
      appliedFilterId,
      textLayers: newLayers,
      timestamp: Date.now(),
    };
    const trimmed = history.slice(0, historyIndex + 1);
    const newHistory = pushHistory(trimmed, entry);
    set({ textLayers: newLayers, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  updateTextLayer(id, update) {
    const { textLayers } = get();
    set({ textLayers: textLayers.map((l) => (l.id === id ? { ...l, ...update } : l)) });
  },

  undo() {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const entry = history[newIndex];
    set({
      historyIndex: newIndex,
      workingUri: entry.workingUri,
      adjustments: entry.adjustments,
      appliedFilterId: entry.appliedFilterId,
      textLayers: entry.textLayers ?? [],
    });
  },

  redo() {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    set({
      historyIndex: newIndex,
      workingUri: entry.workingUri,
      adjustments: entry.adjustments,
      appliedFilterId: entry.appliedFilterId,
      textLayers: entry.textLayers ?? [],
    });
  },

  resetEditor() {
    const { originalUri, photoId } = get();
    if (originalUri && photoId) {
      get().initEditor(photoId, originalUri);
    }
  },
}));
