import type { HistoryEntry } from '@/types/editor';
import type { AdjustmentParams } from '@/types/photo';

const MAX_HISTORY = 20;

export function pushHistory(stack: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [...stack.slice(-MAX_HISTORY + 1), entry];
}

export function undoHistory(
  stack: HistoryEntry[],
  index: number
): { entry: HistoryEntry; newIndex: number } | null {
  if (index <= 0) return null;
  const newIndex = index - 1;
  return { entry: stack[newIndex], newIndex };
}

export function redoHistory(
  stack: HistoryEntry[],
  index: number
): { entry: HistoryEntry; newIndex: number } | null {
  if (index >= stack.length - 1) return null;
  const newIndex = index + 1;
  return { entry: stack[newIndex], newIndex };
}

export const DEFAULT_ADJUSTMENTS: AdjustmentParams = {
  brightness: 1.0,
  contrast: 1.0,
  saturation: 1.0,
};
