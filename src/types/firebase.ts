import type { AdjustmentParams } from './photo';
import type { AIResults } from './ai';

export type FirestorePhotoDoc = {
  userId: string;
  photoId: string;
  originalStorageUrl?: string;
  editedStorageUrl?: string;
  adjustments: AdjustmentParams;
  appliedFilterId: string | null;
  aiResults: AIResults;
  createdAt: number;
  updatedAt: number;
};
