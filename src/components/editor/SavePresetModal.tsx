import { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

type Props = {
  visible: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
};

export function SavePresetModal({ visible, onSave, onCancel }: Props) {
  const [name, setName] = useState('');

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setName('');
  }

  function handleCancel() {
    setName('');
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <View style={{ backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
          <Text style={{ color: 'white', fontSize: 17, fontWeight: '700', marginBottom: 16 }}>
            Save as Preset
          </Text>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="Preset name…"
            placeholderTextColor="#555"
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={handleSave}
            style={{
              backgroundColor: '#2a2a2a',
              color: 'white',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 16,
              marginBottom: 16,
            }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={handleCancel}
              style={{ flex: 1, backgroundColor: '#2a2a2a', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#aaa', fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim()}
              style={{
                flex: 1,
                backgroundColor: name.trim() ? '#6366f1' : '#3a3a5a',
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: Platform.OS === 'ios' ? 16 : 0 }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
