import type { AdjustmentParams } from './photo';

export type HistoryEntry = {
  workingUri: string;
  adjustments: AdjustmentParams;
  appliedFilterId: string | null;
  timestamp: number;
};

export type EditorTool = 'adjust' | 'filters' | 'ai' | 'crop';

export type AIToolType = 'caption' | 'enhance' | 'background' | 'recognize';
