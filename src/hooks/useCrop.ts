import { useState } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import { useEditorStore } from '@/store/editorSlice';
import type { CropRect } from '@/components/editor/CropOverlay';

export function useCrop() {
  const [isCropping, setIsCropping] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const { workingUri, originalUri, setWorkingUri, applyAdjustment } = useEditorStore();

  function startCrop() {
    setIsCropping(true);
  }

  function cancelCrop() {
    setIsCropping(false);
  }

  async function applyCrop(
    cropRect: CropRect,
    imageDisplayWidth: number,
    imageDisplayHeight: number
  ) {
    const uri = workingUri ?? originalUri;
    if (!uri) return;

    setIsApplying(true);
    try {
      // Get actual image dimensions
      const info = await ImageManipulator.manipulateAsync(uri, [], {
        format: ImageManipulator.SaveFormat.JPEG,
      });

      // We need the actual image pixel size. Use a canvas read to get dims.
      // Approximate: map the display crop % to actual pixel dimensions
      const imgW = info.width;
      const imgH = info.height;

      // The display may letterbox/pillarbox — account for aspect ratio
      const imgAspect = imgW / imgH;
      const displayAspect = imageDisplayWidth / imageDisplayHeight;

      let drawW: number, drawH: number, drawOffsetX: number, drawOffsetY: number;
      if (imgAspect > displayAspect) {
        drawW = imageDisplayWidth;
        drawH = imageDisplayWidth / imgAspect;
        drawOffsetX = 0;
        drawOffsetY = (imageDisplayHeight - drawH) / 2;
      } else {
        drawH = imageDisplayHeight;
        drawW = imageDisplayHeight * imgAspect;
        drawOffsetX = (imageDisplayWidth - drawW) / 2;
        drawOffsetY = 0;
      }

      // Convert crop rect (relative to canvas) to pixel coords inside the drawn image
      const cropXInDraw = cropRect.x * imageDisplayWidth - drawOffsetX;
      const cropYInDraw = cropRect.y * imageDisplayHeight - drawOffsetY;
      const cropWInDraw = cropRect.width * imageDisplayWidth;
      const cropHInDraw = cropRect.height * imageDisplayHeight;

      // Scale to actual image pixels
      const scaleX = imgW / drawW;
      const scaleY = imgH / drawH;

      const originX = Math.max(0, Math.round(cropXInDraw * scaleX));
      const originY = Math.max(0, Math.round(cropYInDraw * scaleY));
      const cropW = Math.min(imgW - originX, Math.round(cropWInDraw * scaleX));
      const cropH = Math.min(imgH - originY, Math.round(cropHInDraw * scaleY));

      if (cropW < 10 || cropH < 10) return;

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX, originY, width: cropW, height: cropH } }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );

      setWorkingUri(result.uri);
      setIsCropping(false);
    } catch (e) {
      console.warn('Crop failed:', e);
    } finally {
      setIsApplying(false);
    }
  }

  return { isCropping, isApplying, startCrop, cancelCrop, applyCrop };
}
