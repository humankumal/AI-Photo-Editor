import { FlatList, View, TouchableOpacity } from 'react-native';
import { useEditorStore } from '@/store/editorSlice';
import { PhotoCanvas } from './PhotoCanvas';

const THUMB = 56;

export function HistoryTimeline() {
  const { history, historyIndex, jumpToHistory } = useEditorStore();

  if (history.length <= 1) return null;

  return (
    <FlatList
      horizontal
      data={history}
      keyExtractor={(_, i) => String(i)}
      showsHorizontalScrollIndicator={false}
      initialNumToRender={5}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 6, gap: 6 }}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          onPress={() => jumpToHistory(index)}
          style={{
            width: THUMB,
            height: THUMB,
            borderRadius: 8,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: index === historyIndex ? '#6366f1' : 'transparent',
          }}
        >
          <PhotoCanvas
            uri={item.workingUri}
            adjustments={item.adjustments}
            width={THUMB}
            height={THUMB}
          />
        </TouchableOpacity>
      )}
    />
  );
}
