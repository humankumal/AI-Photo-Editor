import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useEditorStore } from '@/store/editorSlice';
import { TextEditModal } from './TextEditModal';

export function TextToolPanel() {
  const { textLayers, addTextLayer, removeTextLayer } = useEditorStore();
  const [showModal, setShowModal] = useState(false);

  function handleAdd(text: string, fontSize: number, color: string) {
    addTextLayer({
      id: `txt_${Date.now()}`,
      text,
      x: 0.5,
      y: 0.4,
      fontSize,
      color,
    });
    setShowModal(false);
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={{
          backgroundColor: '#6366f1',
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>＋ Add Text</Text>
      </TouchableOpacity>

      {textLayers.length > 0 ? (
        <View style={{ gap: 8 }}>
          {textLayers.map((layer) => (
            <View
              key={layer.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#2a2a2a',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: layer.color,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: '#555',
                }}
              />
              <Text style={{ color: '#e5e5e5', flex: 1, fontSize: 14 }} numberOfLines={1}>
                {layer.text}
              </Text>
              <Text style={{ color: '#888', fontSize: 12, marginRight: 12 }}>
                {layer.fontSize}px
              </Text>
              <TouchableOpacity onPress={() => removeTextLayer(layer.id)}>
                <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: '700' }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ color: '#555', textAlign: 'center', fontSize: 13 }}>
          Drag text overlays to reposition them on the photo.
        </Text>
      )}

      <TextEditModal visible={showModal} onAdd={handleAdd} onClose={() => setShowModal(false)} />
    </View>
  );
}
