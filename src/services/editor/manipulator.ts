import * as ImageManipulator from 'expo-image-manipulator';
import type { AdjustmentParams } from '@/types/photo';

export async function applyAdjustments(uri: string, adjustments: AdjustmentParams): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
  return result.uri;
}

export async function exportFinal(
  uri: string,
  quality: number,
  format: 'jpeg' | 'png' | 'webp',
  maxDimension?: number
): Promise<string> {
  const saveFormat =
    format === 'png'
      ? ImageManipulator.SaveFormat.PNG
      : format === 'webp'
      ? ImageManipulator.SaveFormat.WEBP
      : ImageManipulator.SaveFormat.JPEG;

  const actions: ImageManipulator.Action[] = [];
  if (maxDimension) {
    actions.push({ resize: { width: maxDimension } });
  }

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: quality,
    format: saveFormat,
  });
  return result.uri;
}
