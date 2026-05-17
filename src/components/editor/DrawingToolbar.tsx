import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

const COLORS = [
  '#ffffff', '#000000', '#ff3b30', '#ff9500',
  '#ffcc00', '#34c759', '#007aff', '#af52de',
];

const WIDTHS = [
  { label: 'S', value: 4 },
  { label: 'M', value: 8 },
  { label: 'L', value: 16 },
  { label: 'XL', value: 24 },
];

type Props = {
  color: string;
  strokeWidth: number;
  hasStrokes: boolean;
  isApplying: boolean;
  onColorChange: (c: string) => void;
  onWidthChange: (w: number) => void;
  onClear: () => void;
  onApply: () => void;
};

export function DrawingToolbar({ color, strokeWidth, hasStrokes, isApplying, onColorChange, onWidthChange, onClear, onApply }: Props) {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
      {/* Color swatches */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => onColorChange(c)}
            style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: c,
              borderWidth: color === c ? 3 : 1,
              borderColor: color === c ? '#6366f1' : '#444',
            }}
          />
        ))}
      </View>

      {/* Stroke width */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {WIDTHS.map((w) => (
          <TouchableOpacity
            key={w.value}
            onPress={() => onWidthChange(w.value)}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
              backgroundColor: strokeWidth === w.value ? '#6366f1' : '#2a2a2a',
            }}
          >
            <View style={{
              width: w.value, height: w.value, borderRadius: w.value / 2,
              backgroundColor: strokeWidth === w.value ? 'white' : '#888',
            }} />
            <Text style={{ color: strokeWidth === w.value ? 'white' : '#888', fontSize: 10, marginTop: 4 }}>{w.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={onClear}
          disabled={!hasStrokes}
          style={{
            flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
            backgroundColor: '#2a2a2a', opacity: hasStrokes ? 1 : 0.4,
          }}
        >
          <Text style={{ color: '#e5e5e5', fontWeight: '600' }}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onApply}
          disabled={!hasStrokes || isApplying}
          style={{
            flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
            backgroundColor: hasStrokes ? '#6366f1' : '#3a3a5a', opacity: isApplying ? 0.7 : 1,
          }}
        >
          {isApplying
            ? <ActivityIndicator color="white" size="small" />
            : <Text style={{ color: 'white', fontWeight: '700' }}>Apply Drawing</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}
