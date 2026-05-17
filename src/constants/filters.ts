export type FilterPreset = {
  id: string;
  name: string;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
};

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', name: 'Original', adjustments: { brightness: 1, contrast: 1, saturation: 1 } },
  { id: 'vivid', name: 'Vivid', adjustments: { brightness: 1.05, contrast: 1.1, saturation: 1.3 } },
  { id: 'muted', name: 'Muted', adjustments: { brightness: 0.95, contrast: 0.9, saturation: 0.7 } },
  { id: 'warm', name: 'Warm', adjustments: { brightness: 1.05, contrast: 1.0, saturation: 1.1 } },
  { id: 'cool', name: 'Cool', adjustments: { brightness: 0.95, contrast: 1.05, saturation: 0.9 } },
  { id: 'noir', name: 'Noir', adjustments: { brightness: 0.9, contrast: 1.3, saturation: 0 } },
  { id: 'fade', name: 'Fade', adjustments: { brightness: 1.1, contrast: 0.85, saturation: 0.8 } },
  { id: 'sharp', name: 'Sharp', adjustments: { brightness: 1.0, contrast: 1.2, saturation: 1.05 } },
];
