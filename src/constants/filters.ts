import type { AdjustmentParams } from '@/types/photo';

export type FilterPreset = {
  id: string;
  name: string;
  adjustments: AdjustmentParams;
};

const BASE: Pick<AdjustmentParams, 'hue' | 'sharpness' | 'vignette' | 'blur'> = {
  hue: 0,
  sharpness: 1.0,
  vignette: 0,
  blur: 0,
};

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none',  name: 'Original', adjustments: { brightness: 1,    contrast: 1,    saturation: 1,    ...BASE } },
  { id: 'vivid', name: 'Vivid',    adjustments: { brightness: 1.05, contrast: 1.1,  saturation: 1.3,  ...BASE } },
  { id: 'muted', name: 'Muted',    adjustments: { brightness: 0.95, contrast: 0.9,  saturation: 0.7,  ...BASE } },
  { id: 'warm',  name: 'Warm',     adjustments: { brightness: 1.05, contrast: 1.0,  saturation: 1.1,  hue: 15,  sharpness: 1.0, vignette: 0,   blur: 0 } },
  { id: 'cool',  name: 'Cool',     adjustments: { brightness: 0.95, contrast: 1.05, saturation: 0.9,  hue: -15, sharpness: 1.0, vignette: 0,   blur: 0 } },
  { id: 'noir',  name: 'Noir',     adjustments: { brightness: 0.9,  contrast: 1.3,  saturation: 0,    hue: 0,   sharpness: 1.2, vignette: 0.4, blur: 0 } },
  { id: 'fade',  name: 'Fade',     adjustments: { brightness: 1.1,  contrast: 0.85, saturation: 0.8,  hue: 0,   sharpness: 0.8, vignette: 0,   blur: 0 } },
  { id: 'sharp', name: 'Sharp',    adjustments: { brightness: 1.0,  contrast: 1.2,  saturation: 1.05, hue: 0,   sharpness: 1.6, vignette: 0.1, blur: 0 } },
];
