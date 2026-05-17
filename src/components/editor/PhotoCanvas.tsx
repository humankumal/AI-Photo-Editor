import { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import {
  Canvas,
  Image,
  useImage,
  ColorMatrix,
  useCanvasRef,
} from '@shopify/react-native-skia';
import { cacheDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { buildColorMatrix, isIdentityAdjustment } from '@/utils/colorMatrix';
import type { AdjustmentParams } from '@/types/photo';

export type PhotoCanvasRef = {
  capture: () => Promise<string | null>;
};

type Props = {
  uri: string;
  adjustments: AdjustmentParams;
  width: number;
  height: number;
};

export const PhotoCanvas = forwardRef<PhotoCanvasRef, Props>(
  ({ uri, adjustments, width, height }, ref) => {
    const canvasRef = useCanvasRef();
    const image = useImage(uri);

    useImperativeHandle(ref, () => ({
      async capture(): Promise<string | null> {
        if (!canvasRef.current || !image) return null;
        try {
          const snapshot = canvasRef.current.makeImageSnapshot();
          const bytes = snapshot.encodeToBytes();
          // Convert Uint8Array to base64
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          const path = `${cacheDirectory ?? ''}edited_${Date.now()}.jpg`;
          await writeAsStringAsync(path, base64, { encoding: EncodingType.Base64 });
          return path;
        } catch {
          return null;
        }
      },
    }));

    const matrix = buildColorMatrix(
      adjustments.brightness,
      adjustments.contrast,
      adjustments.saturation
    );

    if (!image) return <View style={{ width, height }} />;

    // Fit image into canvas maintaining aspect ratio
    const imgAspect = image.width() / image.height();
    const canvasAspect = width / height;
    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (imgAspect > canvasAspect) {
      drawW = width;
      drawH = width / imgAspect;
      drawX = 0;
      drawY = (height - drawH) / 2;
    } else {
      drawH = height;
      drawW = height * imgAspect;
      drawX = (width - drawW) / 2;
      drawY = 0;
    }

    const noAdjust = isIdentityAdjustment(
      adjustments.brightness,
      adjustments.contrast,
      adjustments.saturation
    );

    return (
      <Canvas ref={canvasRef} style={{ width, height }}>
        <Image
          image={image}
          x={drawX}
          y={drawY}
          width={drawW}
          height={drawH}
          fit="contain"
        >
          {!noAdjust && <ColorMatrix matrix={matrix} />}
        </Image>
      </Canvas>
    );
  }
);

PhotoCanvas.displayName = 'PhotoCanvas';
