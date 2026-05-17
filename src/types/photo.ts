export type Photo = {
  id: string;
  uri: string;
  width: number;
  height: number;
  filename?: string;
  creationTime?: number;
};

export type AdjustmentParams = {
  brightness: number; // 0.0 – 2.0 (1.0 = no change)
  contrast: number;
  saturation: number;
};

export type EditSession = {
  photoId: string;
  originalUri: string;
  workingUri: string;
  adjustments: AdjustmentParams;
  appliedFilterId: string | null;
  updatedAt: number;
};

export type ExportOptions = {
  quality: number; // 0–1
  format: 'jpeg' | 'png';
  saveToLibrary: boolean;
  uploadToCloud: boolean;
};
