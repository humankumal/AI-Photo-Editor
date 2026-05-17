import { Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import type { TextLayer } from '@/types/editor';

type Props = {
  layer: TextLayer;
  canvasWidth: number;
  canvasHeight: number;
};

export function TextLayerNode({ layer, canvasWidth, canvasHeight }: Props) {
  const font = matchFont({
    fontFamily: 'sans-serif',
    fontSize: layer.fontSize,
    fontStyle: 'normal',
    fontWeight: 'bold',
  });

  return (
    <SkiaText
      x={layer.x * canvasWidth}
      y={layer.y * canvasHeight}
      text={layer.text}
      font={font}
      color={layer.color}
    />
  );
}
