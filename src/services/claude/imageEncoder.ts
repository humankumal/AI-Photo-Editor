import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_DIMENSION = 1024;

export type EncodedImage = {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
};

export async function encodeImageForClaude(uri: string): Promise<EncodedImage> {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!resized.base64) {
    throw new Error('Failed to encode image as base64');
  }

  return { base64: resized.base64, mimeType: 'image/jpeg' };
}
