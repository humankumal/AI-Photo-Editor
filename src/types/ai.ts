export type CaptionResult = {
  caption: string;
  altText: string;
  mood: string;
  keywords: string[];
  technicalDetails: {
    lighting: string;
    composition: string;
  };
};

export type EnhancementResult = {
  brightness: number; // -100 to 100
  contrast: number;
  saturation: number;
  hue: number;
  sharpness: number;
  reason: string;
};

export type BackgroundResult = {
  subjectDescription: string;
  boundingBox: {
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  };
  confidence: number;
  isPersonPhoto: boolean;
};

export type RecognizeResult = {
  objects: Array<{ name: string; confidence: number }>;
  scenes: string[];
  dominantColors: string[];
  textContent: string;
  isAdultContent: boolean;
};

export type AIResults = {
  caption?: CaptionResult;
  enhance?: EnhancementResult;
  background?: BackgroundResult;
  recognize?: RecognizeResult;
};

export type AIFeature = 'caption' | 'enhance' | 'background' | 'recognize';
