import { useEffect, useRef, useState, memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { useEditorStore } from '@/store/editorSlice';
import { useUIStore } from '@/store/uiSlice';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { useCrop } from '@/hooks/useCrop';
import { useCustomPresets } from '@/hooks/useCustomPresets';
import { useAuth } from '@/hooks/useAuth';
import { FILTER_PRESETS } from '@/constants/filters';
import { DEFAULT_ADJUSTMENTS } from '@/services/editor/history';
import { Colors } from '@/constants/colors';
import { PhotoCanvas, type PhotoCanvasRef } from '@/components/editor/PhotoCanvas';
import { CropOverlay } from '@/components/editor/CropOverlay';
import { TransformToolbar } from '@/components/editor/TransformToolbar';
import { AdvancedAdjustPanel } from '@/components/editor/AdvancedAdjustPanel';
import { TextToolPanel } from '@/components/editor/TextToolPanel';
import { ImageInfoPanel } from '@/components/editor/ImageInfoPanel';
import { HistoryTimeline } from '@/components/editor/HistoryTimeline';
import { SavePresetModal } from '@/components/editor/SavePresetModal';
import type { EditorTool, TextLayer } from '@/types/editor';
import type { AssetInfo } from 'expo-media-library';
import type { AdjustmentParams } from '@/types/photo';

// Memoized so filter thumbnails don't re-render on unrelated editor state changes
const FilterTile = memo(function FilterTile({
  uri,
  adjustments,
  label,
  isActive,
  onPress,
  onLongPress,
}: {
  uri: string;
  adjustments: AdjustmentParams;
  label: string;
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <TouchableOpacity className="items-center mr-4" onPress={onPress} onLongPress={onLongPress}>
      <View
        style={{
          width: 64, height: 64, borderRadius: 12, overflow: 'hidden',
          borderWidth: 2, borderColor: isActive ? '#6366f1' : 'transparent',
          marginBottom: 4,
        }}
      >
        <PhotoCanvas uri={uri} adjustments={adjustments} width={64} height={64} />
      </View>
      <Text style={{ color: '#a3a3a3', fontSize: 11 }} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
});

const TOOLS: { id: EditorTool; label: string }[] = [
  { id: 'adjust', label: 'Adjust' },
  { id: 'filters', label: 'Filters' },
  { id: 'crop', label: 'Crop' },
  { id: 'transform', label: 'Transform' },
  { id: 'text', label: 'Text' },
  { id: 'ai', label: 'AI' },
];

const DRAG_HANDLE = 52;

function TextDragHandle({
  layer,
  canvasSize,
  onPositionChange,
}: {
  layer: TextLayer;
  canvasSize: number;
  onPositionChange: (id: string, x: number, y: number) => void;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd((e) => {
      'worklet';
      const newX = Math.max(0, Math.min(1, layer.x + e.translationX / canvasSize));
      const newY = Math.max(0, Math.min(1, layer.y + e.translationY / canvasSize));
      runOnJS(onPositionChange)(layer.id, newX, newY);
      tx.value = 0;
      ty.value = 0;
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: layer.x * canvasSize - DRAG_HANDLE / 2,
            top: layer.y * canvasSize - DRAG_HANDLE / 2,
            width: DRAG_HANDLE,
            height: DRAG_HANDLE,
          },
          animStyle,
        ]}
      />
    </GestureDetector>
  );
}

export default function EditorScreen() {
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  const router = useRouter();
  const decodedId = decodeURIComponent(photoId ?? '');
  const { width } = useWindowDimensions();
  const canvasRef = useRef<PhotoCanvasRef>(null);

  const {
    initEditor, workingUri, originalUri, adjustments, appliedFilterId, textLayers,
    applyAdjustment, applyFilter, updateTextLayer,
    undo, redo, historyIndex, history,
  } = useEditorStore();
  const { activeTool, setActiveTool, setCaptureCanvas } = useUIStore();
  const { run, loading: aiLoading, results: aiResults } = useAIFeatures(decodedId, workingUri);
  const { isCropping, isApplying, startCrop, cancelCrop, applyCrop } = useCrop();
  const { user } = useAuth();
  const { presets, loadPresets, savePreset, deletePreset } = useCustomPresets(user?.uid ?? null);
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [freeRotateDeg, setFreeRotateDeg] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showSavePreset, setShowSavePreset] = useState(false);

  useEffect(() => {
    const captureFn = () => canvasRef.current?.capture() ?? Promise.resolve(null);
    setCaptureCanvas(captureFn);
    return () => setCaptureCanvas(null);
  }, []);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  useEffect(() => {
    (async () => {
      try {
        const asset = await MediaLibrary.getAssetInfoAsync(decodedId);
        setAssetInfo(asset);
        const uri = asset.localUri ?? asset.uri;
        setResolvedUri(uri);
        initEditor(decodedId, uri);
      } catch {
        setResolvedUri(decodedId);
        initEditor(decodedId, decodedId);
      }
    })();
  }, [decodedId]);

  function handleTextPositionChange(id: string, x: number, y: number) {
    updateTextLayer(id, { x, y });
  }

  const displayUri = workingUri ?? resolvedUri;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const canvasSize = width - 16;

  // Before/After: show original URI without any edits
  const previewUri = isShowingOriginal ? (originalUri ?? displayUri ?? '') : (displayUri ?? '');
  const previewAdjustments = isShowingOriginal ? DEFAULT_ADJUSTMENTS : adjustments;
  const previewTextLayers = isShowingOriginal ? [] : textLayers;

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
        <TouchableOpacity onPress={() => router.back()} disabled={isCropping}>
          <Text className={isCropping ? 'text-textMuted text-base' : 'text-textSecondary text-base'}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text className="text-textPrimary font-semibold">
          {isCropping ? 'Crop Photo' : 'Edit Photo'}
        </Text>
        <View className="flex-row items-center gap-3">
          {!isCropping && (
            <>
              <TouchableOpacity onPress={() => setShowInfoPanel(true)}>
                <Ionicons name="information-circle-outline" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={undo} disabled={!canUndo}>
                <Text className={!canUndo ? 'text-textMuted text-sm' : 'text-primary text-sm'}>Undo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={redo} disabled={!canRedo}>
                <Text className={!canRedo ? 'text-textMuted text-sm' : 'text-primary text-sm'}>Redo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-primary px-3 py-1 rounded-lg"
                onPress={() => {
                  setFreeRotateDeg(0);
                  router.push(`/export/${encodeURIComponent(decodedId)}`);
                }}
              >
                <Text className="text-white font-semibold text-sm">Export</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Photo Canvas */}
      <View
        className="items-center justify-center bg-black mx-2 rounded-xl"
        style={{ height: canvasSize }}
      >
        <PhotoCanvas
          ref={canvasRef}
          uri={previewUri}
          adjustments={previewAdjustments}
          width={canvasSize}
          height={canvasSize}
          freeRotateDeg={isShowingOriginal ? 0 : freeRotateDeg}
          textLayers={previewTextLayers}
        />

        {/* Text drag handles (invisible, over canvas) */}
        {!isCropping && activeTool === 'text' && !isShowingOriginal &&
          textLayers.map((layer) => (
            <TextDragHandle
              key={layer.id}
              layer={layer}
              canvasSize={canvasSize}
              onPositionChange={handleTextPositionChange}
            />
          ))
        }

        {isCropping && (
          <View style={{ position: 'absolute', top: 0, left: 0, width: canvasSize, height: canvasSize + 100 }}>
            <CropOverlay
              canvasWidth={canvasSize}
              canvasHeight={canvasSize}
              onApply={(rect) => applyCrop(rect, canvasSize, canvasSize)}
              onCancel={cancelCrop}
              imagePixelWidth={assetInfo?.width}
              imagePixelHeight={assetInfo?.height}
            />
          </View>
        )}

        {isApplying && (
          <View className="absolute inset-0 items-center justify-center bg-black/60">
            <ActivityIndicator color="white" size="large" />
            <Text className="text-white mt-2 text-sm">Applying crop…</Text>
          </View>
        )}
      </View>

      {/* History Timeline */}
      {!isCropping && showTimeline && <HistoryTimeline />}

      {/* Before/After + Tool Selector row */}
      {!isCropping && (
        <View className="flex-row items-center bg-surface px-2 py-1 mt-2 gap-1">
          <TouchableOpacity
            onPressIn={() => setIsShowingOriginal(true)}
            onPressOut={() => setIsShowingOriginal(false)}
            className={`px-3 py-2 rounded-lg ${isShowingOriginal ? 'bg-surfaceHigh' : ''}`}
          >
            <Text className="text-textSecondary text-xs font-semibold">Before</Text>
          </TouchableOpacity>
          <View className="flex-1 flex-row justify-around">
            {TOOLS.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => {
                  setActiveTool(t.id);
                  if (t.id === 'crop') startCrop();
                }}
                className={`px-2 py-2 rounded-lg ${activeTool === t.id ? 'bg-primary' : ''}`}
              >
                <Text
                  className={activeTool === t.id ? 'text-white font-semibold text-xs' : 'text-textSecondary text-xs'}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setShowTimeline((v) => !v)}
            className={`px-2 py-2 rounded-lg ${showTimeline ? 'bg-surfaceHigh' : ''}`}
          >
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <ImageInfoPanel
        visible={showInfoPanel}
        onClose={() => setShowInfoPanel(false)}
        workingUri={workingUri}
        assetInfo={assetInfo}
      />

      <SavePresetModal
        visible={showSavePreset}
        onSave={(name) => {
          savePreset(name, adjustments);
          setShowSavePreset(false);
        }}
        onCancel={() => setShowSavePreset(false)}
      />

      {/* Tool Panel */}
      {!isCropping && (
        <View className="bg-surface pb-8" style={{ minHeight: 140 }}>
          {activeTool === 'adjust' && (
            <View className="py-3 gap-3">
              <View className="px-4 gap-3">
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

              <TouchableOpacity
                className="mx-4 bg-surfaceHigh rounded-xl py-2 items-center"
                onPress={() => setShowAdvanced((v) => !v)}
              >
                <Text className="text-textSecondary text-sm font-semibold">
                  {showAdvanced ? 'Advanced ▲' : 'Advanced ▾'}
                </Text>
              </TouchableOpacity>

              {showAdvanced && <AdvancedAdjustPanel />}
            </View>
          )}

          {activeTool === 'filters' && (
            <View className="py-3">
              {/* Built-in presets */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3">
                {FILTER_PRESETS.map((f) => (
                  <FilterTile
                    key={f.id}
                    uri={displayUri}
                    adjustments={f.adjustments}
                    label={f.name}
                    isActive={appliedFilterId === f.id}
                    onPress={() => applyFilter(f.id, f.adjustments)}
                  />
                ))}
              </ScrollView>

              {/* User presets row */}
              {presets.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-2">
                  {presets.map((p) => (
                    <FilterTile
                      key={p.id}
                      uri={displayUri}
                      adjustments={p.adjustments}
                      label={p.name}
                      isActive={appliedFilterId === p.id}
                      onPress={() => applyFilter(p.id, p.adjustments)}
                      onLongPress={() => deletePreset(p.id)}
                    />
                  ))}
                </ScrollView>
              )}

              {/* Save current as preset */}
              <TouchableOpacity
                className="mx-4 bg-surfaceHigh rounded-xl py-2 items-center flex-row justify-center gap-2"
                onPress={() => setShowSavePreset(true)}
              >
                <Ionicons name="bookmark-outline" size={14} color={Colors.textSecondary} />
                <Text className="text-textSecondary text-sm font-semibold">Save current as Preset</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTool === 'crop' && !isCropping && (
            <View className="px-4 py-4 items-center gap-3">
              <Text className="text-textSecondary text-sm text-center">
                Trim your photo. Drag corners to resize, drag inside to move. Lock aspect ratio with the buttons.
              </Text>
              <TouchableOpacity
                className="bg-primary rounded-xl px-6 py-3"
                onPress={startCrop}
              >
                <Text className="text-white font-semibold">Start Cropping</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTool === 'transform' && (
            <TransformToolbar
              freeRotateDeg={freeRotateDeg}
              onFreeRotateChange={setFreeRotateDeg}
            />
          )}

          {activeTool === 'text' && <TextToolPanel />}

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
      )}
    </View>
  );
}
