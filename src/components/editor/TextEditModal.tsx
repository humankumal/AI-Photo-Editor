import { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';

const FONT_SIZES = [16, 24, 36, 48, 72];
const COLORS = ['#ffffff', '#000000', '#ff3b30', '#007aff', '#ffcc00', '#34c759', '#ff9500', '#ff2d55'];

type Props = {
  visible: boolean;
  onAdd: (text: string, fontSize: number, color: string) => void;
  onClose: () => void;
};

export function TextEditModal({ visible, onAdd, onClose }: Props) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState('#ffffff');

  function handleAdd() {
    if (!text.trim()) return;
    onAdd(text.trim(), fontSize, color);
    setText('');
    setFontSize(36);
    setColor('#ffffff');
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <View
          style={{
            backgroundColor: '#1a1a1a',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            gap: 16,
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
            Add Text
          </Text>

          <TextInput
            style={{
              backgroundColor: '#2a2a2a',
              color: 'white',
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
            }}
            placeholder="Enter text…"
            placeholderTextColor="#555"
            value={text}
            onChangeText={setText}
            autoFocus
          />

          {/* Font size */}
          <View>
            <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8, fontWeight: '600' }}>
              FONT SIZE
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {FONT_SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setFontSize(s)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: fontSize === s ? '#6366f1' : '#2a2a2a',
                  }}
                >
                  <Text
                    style={{
                      color: fontSize === s ? 'white' : '#aaa',
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color swatches */}
          <View>
            <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8, fontWeight: '600' }}>
              COLOR
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: c,
                    borderWidth: color === c ? 3 : 1.5,
                    borderColor: color === c ? '#6366f1' : '#555',
                  }}
                />
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: '#2a2a2a',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#aaa', fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!text.trim()}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: text.trim() ? '#6366f1' : '#333',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: text.trim() ? 'white' : '#555', fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
