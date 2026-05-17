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
  format: 'jpeg' | 'png'
): Promise<string> {
  const saveFormat =
    format === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG;
  const result = await ImageManipulator.manipulateAsync(uri, [], {
    compress: quality,
    format: saveFormat,
  });
  return result.uri;
}
