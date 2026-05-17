import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEditorStore } from '@/store/editorSlice';
import { useUIStore } from '@/store/uiSlice';
import { savePhotoToLibrary } from '@/services/platform/media';
import { shareFile } from '@/services/platform/share';
import { exportFinal } from '@/services/editor/manipulator';
import { PhotoCanvas } from '@/components/editor/PhotoCanvas';
import { Colors } from '@/constants/colors';

export default function ExportScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const workingUri = useEditorStore((s) => s.workingUri);
  const adjustments = useEditorStore((s) => s.adjustments);
  const captureCanvas = useUIStore((s) => s.captureCanvas);

  const [quality, setQuality] = useState(0.9);
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSize = width - 32;

  async function getFinalUri(): Promise<string | null> {
    // Prefer Skia canvas capture (includes color adjustments)
    if (captureCanvas) {
      const uri = await captureCanvas();
      if (uri) return uri;
    }
    // Fallback: use manipulator (no color adjustments, but correct for crop/rotate)
    if (!workingUri) return null;
    return exportFinal(workingUri, quality, 'jpeg');
  }

  async function handleSave() {
    setIsLoading(true);
    setError(null);
    try {
      const uri = await getFinalUri();
      if (!uri) throw new Error('Could not render the edited image.');
      await savePhotoToLibrary(uri);
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleShare() {
    setIsLoading(true);
    setError(null);
    try {
      const uri = await getFinalUri();
      if (!uri) throw new Error('Could not render the edited image.');
      await shareFile(uri);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Share failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary font-semibold">Back</Text>
        </TouchableOpacity>
        <Text className="text-textPrimary font-semibold text-base">Export</Text>
        <View className="w-10" />
      </View>

      {/* Live preview with adjustments */}
      {workingUri && (
        <View
          className="mx-4 bg-black rounded-2xl overflow-hidden mb-6 items-center justify-center"
          style={{ height: previewSize * 0.55 }}
        >
          <PhotoCanvas
            uri={workingUri}
            adjustments={adjustments}
            width={previewSize}
            height={previewSize * 0.55}
          />
        </View>
      )}

      <View className="px-4">
        <Text className="text-textSecondary text-sm mb-2">Quality</Text>
        <View className="flex-row gap-2 mb-6">
          {[0.6, 0.8, 0.9, 1.0].map((q) => (
            <TouchableOpacity
              key={q}
              className={`flex-1 py-2 rounded-xl items-center ${quality === q ? 'bg-primary' : 'bg-surface'}`}
              onPress={() => setQuality(q)}
            >
              <Text className={quality === q ? 'text-white font-semibold' : 'text-textSecondary'}>
                {Math.round(q * 100)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {done ? (
          <View className="bg-success/20 rounded-xl py-3 items-center mb-3">
            <Text className="text-success font-semibold">Saved to camera roll!</Text>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mb-3"
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Save to Camera Roll</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="bg-surface rounded-2xl py-4 items-center"
          onPress={handleShare}
          disabled={isLoading}
        >
          <Text className="text-textPrimary font-semibold text-base">Share</Text>
        </TouchableOpacity>

        {error && (
          <Text className="text-error text-sm mt-3 text-center">{error}</Text>
        )}
      </View>
    </View>
  );
}
