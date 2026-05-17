import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAIStore } from '@/store/aiSlice';
import { useEditorStore } from '@/store/editorSlice';

export default function AIResultsScreen() {
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  const decodedId = decodeURIComponent(photoId ?? '');
  const router = useRouter();

  const results = useAIStore((s) => s.results[decodedId]);
  const applyAdjustment = useEditorStore((s) => s.applyAdjustment);

  function applyEnhancements() {
    const enhance = results?.enhance;
    if (!enhance) return;
    const brightness = 1 + enhance.brightness / 100;
    const contrast = 1 + enhance.contrast / 100;
    const saturation = 1 + enhance.saturation / 100;
    applyAdjustment({ brightness, contrast, saturation });
    router.back();
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary font-semibold">Done</Text>
        </TouchableOpacity>
        <Text className="text-textPrimary font-semibold text-base">AI Results</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {results?.caption && (
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-primary font-semibold mb-2">Caption</Text>
            <Text className="text-textPrimary text-base mb-2">{results.caption.caption}</Text>
            <Text className="text-textSecondary text-sm mb-1">Mood: {results.caption.mood}</Text>
            <Text className="text-textSecondary text-sm">
              Keywords: {results.caption.keywords?.join(', ')}
            </Text>
          </View>
        )}

        {results?.enhance && (
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-primary font-semibold mb-2">Smart Enhancement</Text>
            <Text className="text-textSecondary text-sm mb-3">{results.enhance.reason}</Text>
            {(['brightness', 'contrast', 'saturation'] as const).map((k) => (
              <View key={k} className="flex-row justify-between mb-1">
                <Text className="text-textSecondary capitalize">{k}</Text>
                <Text className={results.enhance![k] > 0 ? 'text-success' : results.enhance![k] < 0 ? 'text-error' : 'text-textMuted'}>
                  {results.enhance![k] > 0 ? '+' : ''}{results.enhance![k]}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              className="bg-primary rounded-xl py-3 items-center mt-3"
              onPress={applyEnhancements}
            >
              <Text className="text-white font-semibold">Apply Enhancements</Text>
            </TouchableOpacity>
          </View>
        )}

        {results?.background && (
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-primary font-semibold mb-2">Subject Detection</Text>
            <Text className="text-textPrimary text-sm mb-1">{results.background.subjectDescription}</Text>
            <Text className="text-textSecondary text-xs">
              Confidence: {Math.round(results.background.confidence * 100)}%
            </Text>
          </View>
        )}

        {results?.recognize && (
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-primary font-semibold mb-2">Scene Recognition</Text>
            {results.recognize.objects?.slice(0, 5).map((o, i) => (
              <Text key={i} className="text-textSecondary text-sm">
                • {o.name} ({Math.round(o.confidence * 100)}%)
              </Text>
            ))}
            {results.recognize.scenes?.length > 0 && (
              <Text className="text-textSecondary text-sm mt-2">
                Scene: {results.recognize.scenes.join(', ')}
              </Text>
            )}
            {results.recognize.dominantColors?.length > 0 && (
              <View className="flex-row gap-2 mt-2">
                {results.recognize.dominantColors.slice(0, 5).map((c, i) => (
                  <View key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </View>
            )}
          </View>
        )}

        {!results && (
          <View className="items-center py-12">
            <Text className="text-textSecondary text-center">
              No AI results yet. Run AI tools from the editor.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
