export const CAPTION_SYSTEM = `You are a professional photo analyst. Analyze the provided image carefully.`;

export const CAPTION_USER = `Analyze this photo and return ONLY valid JSON (no markdown, no explanation) matching exactly this schema:
{"caption":"string","altText":"string","mood":"string","keywords":["string"],"technicalDetails":{"lighting":"string","composition":"string"}}`;

export const ENHANCE_SYSTEM = `You are a professional photo retouching expert. Analyze image quality and determine optimal adjustments.`;

export const ENHANCE_USER = `Analyze this photo's exposure, color balance, and contrast. Return ONLY valid JSON:
{"brightness":0,"contrast":0,"saturation":0,"hue":0,"sharpness":0,"reason":"string"}
Each numeric value is an integer from -100 to 100 where 0 means no change needed. Be conservative — only suggest changes that clearly improve the image.`;

export const BACKGROUND_SYSTEM = `You are a computer vision assistant that identifies primary subjects in photos.`;

export const BACKGROUND_USER = `Identify the primary subject of this image. Return ONLY valid JSON:
{"subjectDescription":"string","boundingBox":{"xPercent":0,"yPercent":0,"widthPercent":100,"heightPercent":100},"confidence":0.95,"isPersonPhoto":false}
boundingBox values are 0–100 representing percentage of image dimensions. confidence is 0–1.`;

export const RECOGNIZE_SYSTEM = `You are a computer vision assistant that identifies objects, scenes, and content in photos.`;

export const RECOGNIZE_USER = `Analyze this photo and return ONLY valid JSON:
{"objects":[{"name":"string","confidence":0.9}],"scenes":["string"],"dominantColors":["#hexcolor"],"textContent":"string","isAdultContent":false}
List up to 10 objects and up to 5 scenes. dominantColors should be hex codes. textContent is any readable text visible in the image (empty string if none).`;
