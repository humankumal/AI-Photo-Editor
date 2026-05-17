import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useEditorStore } from '@/store/editorSlice';
import { TextEditModal } from './TextEditModal';

const STICKERS = [
  '⭐', '❤️', '🔥', '✨', '🎉', '😍', '🌈', '🌸',
  '🦋', '🌙', '☀️', '🍀', '🎵', '💫', '🦄', '🌺',
];

export function TextToolPanel() {
  const { textLayers, addTextLayer, removeTextLayer } = useEditorStore();
  const [showModal, setShowModal] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

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

  function addSticker(emoji: string) {
    addTextLayer({
      id: `sticker_${Date.now()}`,
      text: emoji,
      x: 0.5,
      y: 0.4,
      fontSize: 56,
      color: '#ffffff',
    });
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={{
            flex: 1, backgroundColor: '#6366f1',
            paddingVertical: 12, borderRadius: 12, alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>＋ Add Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowStickers((v) => !v)}
          style={{
            flex: 1,
            backgroundColor: showStickers ? '#4f46e5' : '#2a2a2a',
            paddingVertical: 12, borderRadius: 12, alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: showStickers ? 'white' : '#a3a3a3', fontWeight: '600' }}>
            ⭐ Stickers
          </Text>
        </TouchableOpacity>
      </View>

      {showStickers && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {STICKERS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => addSticker(emoji)}
              style={{
                width: '11%', aspectRatio: 1,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#2a2a2a', borderRadius: 10,
              }}
            >
              <Text style={{ fontSize: 24 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
