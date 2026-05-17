import { forwardRef, memo, useImperativeHandle, useMemo } from 'react';
import { View, Platform } from 'react-native';
import {
  Canvas,
  Image,
  useImage,
  ColorMatrix,
  useCanvasRef,
  Group,
  Blur,
  Rect,
  RadialGradient,
} from '@shopify/react-native-skia';
import { cacheDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { buildColorMatrix, isIdentityAdjustment } from '@/utils/colorMatrix';
import { TextLayerNode } from './TextLayerNode';
import type { AdjustmentParams } from '@/types/photo';
import type { TextLayer } from '@/types/editor';

export type PhotoCanvasRef = {
  capture: () => Promise<string | null>;
};

type Props = {
  uri: string;
  adjustments: AdjustmentParams;
  width: number;
  height: number;
  freeRotateDeg?: number;
  textLayers?: TextLayer[];
};

const PhotoCanvasInner = forwardRef<PhotoCanvasRef, Props>(
  ({ uri, adjustments, width, height, freeRotateDeg, textLayers }, ref) => {
    const canvasRef = useCanvasRef();
    const image = useImage(uri);

    useImperativeHandle(ref, () => ({
      async capture(): Promise<string | null> {
        if (!canvasRef.current || !image) return null;
        try {
          const snapshot = canvasRef.current.makeImageSnapshot();
          const bytes = snapshot.encodeToBytes();
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);

          // On web, file system isn't available — return a data URL instead
          if (Platform.OS === 'web' || !cacheDirectory) {
            return `data:image/jpeg;base64,${base64}`;
          }

          const path = `${cacheDirectory}edited_${Date.now()}.jpg`;
          await writeAsStringAsync(path, base64, { encoding: EncodingType.Base64 });
          return path;
        } catch {
          return null;
        }
      },
    }));

    const { brightness, contrast, saturation, hue, sharpness, vignette, blur } = adjustments;

    const { matrix, noColorAdjust, effectiveBlur } = useMemo(() => {
      const ec = sharpness > 1 ? contrast * (1 + (sharpness - 1) * 0.4) : contrast;
      const sb = sharpness < 1 ? (1 - sharpness) * 3 : 0;
      return {
        matrix: buildColorMatrix(brightness, ec, saturation, hue),
        noColorAdjust: isIdentityAdjustment(brightness, ec, saturation, hue),
        effectiveBlur: blur + sb,
      };
    }, [brightness, contrast, saturation, hue, sharpness, blur]);

    if (!image) return <View style={{ width, height }} />;

    // Fit image into canvas maintaining aspect ratio (letterbox/pillarbox)
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

    const rotateDeg = freeRotateDeg ?? 0;
    const rotateRad = (rotateDeg * Math.PI) / 180;
    const shouldRotate = Math.abs(rotateDeg) > 0.001;
    const cx = drawX + drawW / 2;
    const cy = drawY + drawH / 2;

    const imageNode = (
      <Image image={image} x={drawX} y={drawY} width={drawW} height={drawH} fit="contain">
        {!noColorAdjust && <ColorMatrix matrix={matrix} />}
        {effectiveBlur > 0 && <Blur blur={effectiveBlur} />}
      </Image>
    );

    return (
      <Canvas ref={canvasRef} style={{ width, height }}>
        {shouldRotate ? (
          <Group transform={[{ rotate: rotateRad }]} origin={{ x: cx, y: cy }}>
            {imageNode}
          </Group>
        ) : (
          imageNode
        )}

        {/* Vignette overlay — radial gradient from transparent center to dark edges */}
        {vignette > 0 && (
          <Rect x={0} y={0} width={width} height={height}>
            <RadialGradient
              c={{ x: width / 2, y: height / 2 }}
              r={Math.max(width, height) * 0.72}
              colors={['rgba(0,0,0,0)', `rgba(0,0,0,${vignette})`]}
              positions={[0.5, 1.0]}
            />
          </Rect>
        )}

        {/* Text overlays (rendered last so they appear on top) */}
        {textLayers?.map((layer) => (
          <TextLayerNode
            key={layer.id}
            layer={layer}
            canvasWidth={width}
            canvasHeight={height}
          />
        ))}
      </Canvas>
    );
  }
);

function adjustmentsEqual(a: Props, b: Props): boolean {
  return (
    a.uri === b.uri &&
    a.width === b.width &&
    a.height === b.height &&
    a.freeRotateDeg === b.freeRotateDeg &&
    a.textLayers === b.textLayers &&
    a.adjustments.brightness === b.adjustments.brightness &&
    a.adjustments.contrast === b.adjustments.contrast &&
    a.adjustments.saturation === b.adjustments.saturation &&
    a.adjustments.hue === b.adjustments.hue &&
    a.adjustments.sharpness === b.adjustments.sharpness &&
    a.adjustments.vignette === b.adjustments.vignette &&
    a.adjustments.blur === b.adjustments.blur
  );
}

export const PhotoCanvas = memo(PhotoCanvasInner, adjustmentsEqual);
PhotoCanvas.displayName = 'PhotoCanvas';
