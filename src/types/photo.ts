export type Photo = {
  id: string;
  uri: string;
  width: number;
  height: number;
  filename?: string;
  creationTime?: number;
};

export type AdjustmentParams = {
  brightness: number;  // 0.0 – 2.0 (1.0 = no change)
  contrast: number;
  saturation: number;
  hue: number;         // degrees, -180 to 180 (0 = no change)
  sharpness: number;   // 0.0 – 2.0 (1.0 = no change)
  vignette: number;    // 0.0 – 1.0 (0 = none)
  blur: number;        // 0.0 – 20.0 sigma (0 = none)
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
