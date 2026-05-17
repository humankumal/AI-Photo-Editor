import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as MediaLibrary from 'expo-media-library';
import { useEditorStore } from '@/store/editorSlice';
import { useUIStore } from '@/store/uiSlice';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { FILTER_PRESETS } from '@/constants/filters';
import { Colors } from '@/constants/colors';
import { PhotoCanvas, type PhotoCanvasRef } from '@/components/editor/PhotoCanvas';
import type { EditorTool } from '@/types/editor';

const TOOLS: { id: EditorTool; label: string }[] = [
  { id: 'adjust', label: 'Adjust' },
  { id: 'filters', label: 'Filters' },
  { id: 'ai', label: 'AI Tools' },
];

export default function EditorScreen() {
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  const router = useRouter();
  const decodedId = decodeURIComponent(photoId ?? '');
  const { width } = useWindowDimensions();
  const canvasRef = useRef<PhotoCanvasRef>(null);

  const {
    initEditor, workingUri, adjustments,
    applyAdjustment, applyFilter,
    undo, redo, historyIndex, history,
  } = useEditorStore();
  const { activeTool, setActiveTool, setCaptureCanvas } = useUIStore();
  const { run, loading: aiLoading, results: aiResults } = useAIFeatures(decodedId, workingUri);
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);

  // Register the canvas capture function in the global store so export screen can use it
  useEffect(() => {
    const captureFn = () => canvasRef.current?.capture() ?? Promise.resolve(null);
    setCaptureCanvas(captureFn);
    return () => setCaptureCanvas(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const asset = await MediaLibrary.getAssetInfoAsync(decodedId);
        const uri = asset.localUri ?? asset.uri;
        setResolvedUri(uri);
        initEditor(decodedId, uri);
      } catch {
        setResolvedUri(decodedId);
        initEditor(decodedId, decodedId);
      }
    })();
  }, [decodedId]);

  const displayUri = workingUri ?? resolvedUri;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Canvas occupies roughly half the screen height
  const canvasSize = width - 16;

  if (!displayUri) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-textSecondary text-base">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-textPrimary font-semibold">Edit Photo</Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={undo} disabled={!canUndo}>
            <Text className={!canUndo ? 'text-textMuted text-sm' : 'text-primary text-sm'}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={redo} disabled={!canRedo}>
            <Text className={!canRedo ? 'text-textMuted text-sm' : 'text-primary text-sm'}>Redo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-primary px-3 py-1 rounded-lg"
            onPress={() => router.push(`/export/${encodeURIComponent(decodedId)}`)}
          >
            <Text className="text-white font-semibold text-sm">Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Skia Photo Canvas */}
      <View
        className="items-center justify-center bg-black mx-2 rounded-xl overflow-hidden"
        style={{ height: canvasSize }}
      >
        <PhotoCanvas
          ref={canvasRef}
          uri={displayUri}
          adjustments={adjustments}
          width={canvasSize}
          height={canvasSize}
        />
      </View>

      {/* Tool Selector */}
      <View className="flex-row justify-around bg-surface px-4 py-2 mt-2">
        {TOOLS.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setActiveTool(t.id)}
            className={`px-4 py-2 rounded-lg ${activeTool === t.id ? 'bg-primary' : ''}`}
          >
            <Text className={activeTool === t.id ? 'text-white font-semibold' : 'text-textSecondary'}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tool Panel */}
      <View className="bg-surface pb-8" style={{ minHeight: 140 }}>
        {activeTool === 'adjust' && (
          <View className="px-4 py-3 gap-3">
            {(['brightness', 'contrast', 'saturation'] as const).map((key) => (
              <View key={key} className="flex-row items-center gap-3">
                <Text className="text-textSecondary w-24 capitalize">{key}</Text>
                <View className="flex-1 flex-row gap-2">
                  <TouchableOpacity
                    className="bg-surfaceHigh px-3 py-2 rounded-lg"
                    onPress={() => applyAdjustment({ [key]: Math.max(0.1, adjustments[key] - 0.1) })}
                  >
                    <Text className="text-textPrimary">−</Text>
                  </TouchableOpacity>
                  <Text className="text-textPrimary flex-1 text-center my-auto">
                    {adjustments[key].toFixed(1)}
                  </Text>
                  <TouchableOpacity
                    className="bg-surfaceHigh px-3 py-2 rounded-lg"
                    onPress={() => applyAdjustment({ [key]: Math.min(2.0, adjustments[key] + 0.1) })}
                  >
                    <Text className="text-textPrimary">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTool === 'filters' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
            {FILTER_PRESETS.map((f) => (
              <TouchableOpacity
                key={f.id}
                className="items-center mr-4"
                onPress={() => applyFilter(f.id, f.adjustments)}
              >
                <View
                  className={`w-16 h-16 rounded-xl mb-1 overflow-hidden border-2 ${
                    adjustments.brightness === f.adjustments.brightness &&
                    adjustments.saturation === f.adjustments.saturation
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                >
                  <PhotoCanvas
                    uri={displayUri}
                    adjustments={f.adjustments}
                    width={64}
                    height={64}
                  />
                </View>
                <Text className="text-textSecondary text-xs">{f.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {activeTool === 'ai' && (
          <View className="px-4 py-3">
            <View className="flex-row flex-wrap gap-2">
              {[
                { id: 'caption' as const, label: 'Caption', desc: 'Describe photo' },
                { id: 'enhance' as const, label: 'Enhance', desc: 'Smart adjustments' },
                { id: 'background' as const, label: 'Background', desc: 'Find subject' },
                { id: 'recognize' as const, label: 'Recognize', desc: 'Identify objects' },
              ].map((feat) => (
                <TouchableOpacity
                  key={feat.id}
                  className="bg-surfaceHigh rounded-xl p-3 flex-1 min-w-[45%]"
                  onPress={() => run(feat.id)}
                  disabled={aiLoading[feat.id]}
                >
                  {aiLoading[feat.id] ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <>
                      <Text className="text-textPrimary font-semibold text-sm">{feat.label}</Text>
                      <Text className="text-textMuted text-xs">{feat.desc}</Text>
                      {aiResults[feat.id] && (
                        <View className="mt-1 w-2 h-2 rounded-full bg-success" />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {Object.values(aiResults).some(Boolean) && (
              <TouchableOpacity
                className="mt-3 bg-primary rounded-xl py-2 items-center"
                onPress={() => router.push(`/ai-results/${encodeURIComponent(decodedId)}`)}
              >
                <Text className="text-white font-semibold text-sm">View AI Results</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
