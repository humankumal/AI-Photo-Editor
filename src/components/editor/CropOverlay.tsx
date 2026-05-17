import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export type CropRect = {
  x: number; // 0–1 relative to canvas
  y: number;
  width: number;
  height: number;
};

type Props = {
  canvasWidth: number;
  canvasHeight: number;
  onApply: (crop: CropRect) => void;
  onCancel: () => void;
};

const MIN_SIZE = 48;
type Corner = 'tl' | 'tr' | 'bl' | 'br';

type AspectOption = { label: string; ratio: number | null };
const ASPECT_OPTIONS: AspectOption[] = [
  { label: 'Free', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '3:2', ratio: 3 / 2 },
  { label: '16:9', ratio: 16 / 9 },
];

export function CropOverlay({ canvasWidth, canvasHeight, onApply, onCancel }: Props) {
  const [selectedAspectIdx, setSelectedAspectIdx] = useState(0);

  const left = useSharedValue(canvasWidth * 0.1);
  const top = useSharedValue(canvasHeight * 0.1);
  const right = useSharedValue(canvasWidth * 0.9);
  const bottom = useSharedValue(canvasHeight * 0.9);
  const aspectRatioSV = useSharedValue<number>(0); // 0 = free

  const overlayStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: left.value,
    top: top.value,
    width: right.value - left.value,
    height: bottom.value - top.value,
    borderWidth: 2,
    borderColor: 'white',
  }));

  // Track previous translation to compute per-frame delta
  const prevTx = useSharedValue(0);
  const prevTy = useSharedValue(0);

  const moveGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      prevTx.value = 0;
      prevTy.value = 0;
    })
    .onUpdate((e) => {
      'worklet';
      const dx = e.translationX - prevTx.value;
      const dy = e.translationY - prevTy.value;
      prevTx.value = e.translationX;
      prevTy.value = e.translationY;

      const w = right.value - left.value;
      const h = bottom.value - top.value;
      const newLeft = Math.max(0, Math.min(left.value + dx, canvasWidth - w));
      const newTop = Math.max(0, Math.min(top.value + dy, canvasHeight - h));
      left.value = newLeft;
      top.value = newTop;
      right.value = newLeft + w;
      bottom.value = newTop + h;
    });

  function selectAspect(idx: number) {
    const ratio = ASPECT_OPTIONS[idx].ratio;
    setSelectedAspectIdx(idx);
    aspectRatioSV.value = ratio ?? 0;
    if (ratio !== null) {
      // Snap height to match aspect ratio, keeping width and centering vertically
      const currentW = right.value - left.value;
      const newH = currentW / ratio;
      const centerY = (top.value + bottom.value) / 2;
      top.value = Math.max(0, centerY - newH / 2);
      bottom.value = Math.min(canvasHeight, centerY + newH / 2);
    }
  }

  function makeCornerGesture(corner: Corner) {
    const px = useSharedValue(0);
    const py = useSharedValue(0);
    return Gesture.Pan()
      .onBegin(() => {
        'worklet';
        px.value = 0;
        py.value = 0;
      })
      .onUpdate((e) => {
        'worklet';
        const dx = e.translationX - px.value;
        const dy = e.translationY - py.value;
        px.value = e.translationX;
        py.value = e.translationY;
        const ar = aspectRatioSV.value;

        if (corner === 'tl') {
          const newLeft = Math.max(0, Math.min(left.value + dx, right.value - MIN_SIZE));
          const newW = right.value - newLeft;
          const newTop = ar > 0
            ? Math.max(0, bottom.value - newW / ar)
            : Math.max(0, Math.min(top.value + dy, bottom.value - MIN_SIZE));
          left.value = newLeft;
          top.value = newTop;
        } else if (corner === 'tr') {
          const newRight = Math.min(canvasWidth, Math.max(right.value + dx, left.value + MIN_SIZE));
          const newW = newRight - left.value;
          const newTop = ar > 0
            ? Math.max(0, bottom.value - newW / ar)
            : Math.max(0, Math.min(top.value + dy, bottom.value - MIN_SIZE));
          right.value = newRight;
          top.value = newTop;
        } else if (corner === 'bl') {
          const newLeft = Math.max(0, Math.min(left.value + dx, right.value - MIN_SIZE));
          const newW = right.value - newLeft;
          const newBottom = ar > 0
            ? Math.min(canvasHeight, top.value + newW / ar)
            : Math.min(canvasHeight, Math.max(bottom.value + dy, top.value + MIN_SIZE));
          left.value = newLeft;
          bottom.value = newBottom;
        } else {
          const newRight = Math.min(canvasWidth, Math.max(right.value + dx, left.value + MIN_SIZE));
          const newW = newRight - left.value;
          const newBottom = ar > 0
            ? Math.min(canvasHeight, top.value + newW / ar)
            : Math.min(canvasHeight, Math.max(bottom.value + dy, top.value + MIN_SIZE));
          right.value = newRight;
          bottom.value = newBottom;
        }
      });
  }

  const handleSize = 28;

  function CornerHandle({ corner }: { corner: Corner }) {
    const gesture = makeCornerGesture(corner);
    const style = useAnimatedStyle(() => ({
      position: 'absolute',
      width: handleSize,
      height: handleSize,
      backgroundColor: 'white',
      borderRadius: 5,
      left: (corner.endsWith('l') ? left.value : right.value) - handleSize / 2,
      top: (corner.startsWith('t') ? top.value : bottom.value) - handleSize / 2,
    }));
    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={style} />
      </GestureDetector>
    );
  }

  function handleApply() {
    onApply({
      x: left.value / canvasWidth,
      y: top.value / canvasHeight,
      width: (right.value - left.value) / canvasWidth,
      height: (bottom.value - top.value) / canvasHeight,
    });
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Overlay fills the canvas */}
      <View style={{ position: 'absolute', width: canvasWidth, height: canvasHeight }}>
        {/* Dark overlay outside crop area */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
        />

        {/* Movable crop rect with rule-of-thirds grid */}
        <GestureDetector gesture={moveGesture}>
          <Animated.View style={overlayStyle}>
            <View style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.35)' }} />
            <View style={{ position: 'absolute', left: '66.6%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.35)' }} />
            <View style={{ position: 'absolute', top: '33.3%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' }} />
            <View style={{ position: 'absolute', top: '66.6%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' }} />
          </Animated.View>
        </GestureDetector>

        {/* Corner drag handles */}
        <CornerHandle corner="tl" />
        <CornerHandle corner="tr" />
        <CornerHandle corner="bl" />
        <CornerHandle corner="br" />
      </View>

      {/* Controls rendered BELOW the canvas (in normal layout flow) */}
      <View
        style={{
          position: 'absolute',
          top: canvasHeight + 8,
          left: 0,
          right: 0,
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Aspect ratio selector */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {ASPECT_OPTIONS.map((opt, idx) => (
            <TouchableOpacity
              key={opt.label}
              onPress={() => selectAspect(idx)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: selectedAspectIdx === idx ? '#6366f1' : '#2a2a2a',
              }}
            >
              <Text
                style={{
                  color: selectedAspectIdx === idx ? 'white' : '#aaa',
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Apply / Cancel */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            width: '100%',
          }}
        >
          <TouchableOpacity
            onPress={onCancel}
            style={{
              backgroundColor: '#2a2a2a',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#aaa', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleApply}
            style={{
              backgroundColor: '#6366f1',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Apply Crop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
