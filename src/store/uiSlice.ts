import { create } from 'zustand';
import type { EditorTool } from '@/types/editor';

type UIState = {
  activeTool: EditorTool;
  isAISheetOpen: boolean;
  isExporting: boolean;
};

type UIActions = {
  setActiveTool: (tool: EditorTool) => void;
  setAISheetOpen: (open: boolean) => void;
  setExporting: (exporting: boolean) => void;
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  activeTool: 'adjust',
  isAISheetOpen: false,
  isExporting: false,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setAISheetOpen: (open) => set({ isAISheetOpen: open }),
  setExporting: (exporting) => set({ isExporting: exporting }),
}));
