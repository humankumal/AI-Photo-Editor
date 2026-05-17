import type { AdjustmentParams } from './photo';

export type UserPreset = {
  id: string;
  name: string;
  adjustments: AdjustmentParams;
  createdAt: number;
};
