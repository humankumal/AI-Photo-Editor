import type { AdjustmentParams } from './photo';

export type TextLayer = {
  id: string;
  text: string;
  x: number;       // 0–1 relative to canvas
  y: number;
  fontSize: number;
  color: string;   // CSS color string
};

export type HistoryEntry = {
  workingUri: string;
  adjustments: AdjustmentParams;
  appliedFilterId: string | null;
  textLayers: TextLayer[];
  timestamp: number;
};

export type DrawingPath = {
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
};

export type EditorTool = 'adjust' | 'filters' | 'ai' | 'crop' | 'transform' | 'text' | 'draw';

export type AIToolType = 'caption' | 'enhance' | 'background' | 'recognize';
