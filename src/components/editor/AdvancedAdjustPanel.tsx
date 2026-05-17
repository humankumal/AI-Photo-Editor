import { View, Text, TouchableOpacity } from 'react-native';
import { useEditorStore } from '@/store/editorSlice';

type SliderRow = {
  key: 'hue' | 'sharpness' | 'vignette' | 'blur';
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
};

const ROWS: SliderRow[] = [
  { key: 'hue',       label: 'Hue',       min: -180, max: 180,  step: 10,  format: (v) => `${v > 0 ? '+' : ''}${v}°` },
  { key: 'sharpness', label: 'Sharpness', min: 0,    max: 2.0,  step: 0.1, format: (v) => v.toFixed(1) },
  { key: 'vignette',  label: 'Vignette',  min: 0,    max: 1.0,  step: 0.1, format: (v) => v.toFixed(1) },
  { key: 'blur',      label: 'Blur',      min: 0,    max: 20,   step: 1,   format: (v) => v.toFixed(0) },
];

export function AdvancedAdjustPanel() {
  const { adjustments, applyAdjustment } = useEditorStore();

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 4, gap: 12 }}>
      {ROWS.map(({ key, label, min, max, step, format }) => {
        const value = adjustments[key];
        return (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: '#a3a3a3', width: 72, fontSize: 13 }}>{label}</Text>
            <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#2a2a2a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                onPress={() =>
                  applyAdjustment({ [key]: Math.max(min, parseFloat((value - step).toFixed(10))) })
                }
              >
                <Text style={{ color: '#e5e5e5', fontSize: 16 }}>−</Text>
              </TouchableOpacity>
              <Text style={{ color: '#e5e5e5', flex: 1, textAlign: 'center', lineHeight: 36, fontSize: 13 }}>
                {format(value)}
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: '#2a2a2a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                onPress={() =>
                  applyAdjustment({ [key]: Math.min(max, parseFloat((value + step).toFixed(10))) })
                }
              >
                <Text style={{ color: '#e5e5e5', fontSize: 16 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}
