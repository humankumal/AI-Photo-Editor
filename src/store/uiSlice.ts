import { create } from 'zustand';
import type { EditorTool } from '@/types/editor';

type UIState = {
  activeTool: EditorTool;
  isAISheetOpen: boolean;
  isExporting: boolean;
  // Capture function registered by the editor's PhotoCanvas for use by the export screen
  captureCanvas: (() => Promise<string | null>) | null;
};

type UIActions = {
  setActiveTool: (tool: EditorTool) => void;
  setAISheetOpen: (open: boolean) => void;
  setExporting: (exporting: boolean) => void;
  setCaptureCanvas: (fn: (() => Promise<string | null>) | null) => void;
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  activeTool: 'adjust',
  isAISheetOpen: false,
  isExporting: false,
  captureCanvas: null,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setAISheetOpen: (open) => set({ isAISheetOpen: open }),
  setExporting: (exporting) => set({ isExporting: exporting }),
  setCaptureCanvas: (fn) => set({ captureCanvas: fn }),
}));
