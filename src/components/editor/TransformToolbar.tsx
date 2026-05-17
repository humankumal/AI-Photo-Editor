import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useTransform } from '@/hooks/useTransform';

const SLIDER_W = 256;
const SLIDER_HALF = SLIDER_W / 2;
const MAX_DEG = 45;

type Props = {
  freeRotateDeg: number;
  onFreeRotateChange: (deg: number) => void;
};

export function TransformToolbar({ freeRotateDeg, onFreeRotateChange }: Props) {
  const { isApplying, rotateCW, rotateCCW, flipH, flipV, applyFreeRotate } = useTransform();

  const degMirror = useSharedValue(freeRotateDeg);
  const startOffset = useSharedValue(0);

  useEffect(() => {
    degMirror.value = freeRotateDeg;
  }, [freeRotateDeg]);

  const sliderGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      startOffset.value = (degMirror.value / MAX_DEG) * SLIDER_HALF;
    })
    .onUpdate((e) => {
      'worklet';
      const newOffset = Math.max(
        -SLIDER_HALF,
        Math.min(SLIDER_HALF, startOffset.value + e.translationX)
      );
      degMirror.value = (newOffset / SLIDER_HALF) * MAX_DEG;
      runOnJS(onFreeRotateChange)(Math.round(degMirror.value * 10) / 10);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (degMirror.value / MAX_DEG) * SLIDER_HALF }],
  }));

  async function handleRotateCCW() {
    onFreeRotateChange(0);
    await rotateCCW();
  }

  async function handleRotateCW() {
    onFreeRotateChange(0);
    await rotateCW();
  }

  async function handleFlipH() {
    onFreeRotateChange(0);
    await flipH();
  }

  async function handleFlipV() {
    onFreeRotateChange(0);
    await flipV();
  }

  async function handleApply() {
    if (Math.abs(freeRotateDeg) >= 0.1) {
      await applyFreeRotate(freeRotateDeg);
      onFreeRotateChange(0);
    }
  }

  const buttons = [
    { label: '↺ CCW', onPress: handleRotateCCW },
    { label: '↻ CW', onPress: handleRotateCW },
    { label: '⇄ Flip H', onPress: handleFlipH },
    { label: '⇅ Flip V', onPress: handleFlipV },
  ];

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 16 }}>
      {/* Rotate & Flip row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {buttons.map(({ label, onPress }) => (
          <TouchableOpacity
            key={label}
            onPress={onPress}
            disabled={isApplying}
            style={{
              backgroundColor: '#2a2a2a',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              minWidth: 68,
            }}
          >
            {isApplying ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Text style={{ color: '#e5e5e5', fontSize: 13, fontWeight: '600' }}>{label}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Free-rotate slider */}
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ color: '#a3a3a3', fontSize: 13 }}>
          Free Rotate: {freeRotateDeg.toFixed(1)}°
        </Text>
        <GestureDetector gesture={sliderGesture}>
          <View
            style={{
              width: SLIDER_W,
              height: 36,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Track */}
            <View
              style={{
                position: 'absolute',
                width: SLIDER_W,
                height: 3,
                backgroundColor: '#444',
                borderRadius: 2,
              }}
            />
            {/* Center tick */}
            <View
              style={{
                position: 'absolute',
                width: 2,
                height: 14,
                backgroundColor: '#666',
                borderRadius: 1,
              }}
            />
            {/* Thumb */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#6366f1',
                  elevation: 4,
                },
                thumbStyle,
              ]}
            />
          </View>
        </GestureDetector>

        {Math.abs(freeRotateDeg) >= 0.1 && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => onFreeRotateChange(0)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: '#2a2a2a',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#a3a3a3', fontWeight: '600', fontSize: 13 }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              disabled={isApplying}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: '#6366f1',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
