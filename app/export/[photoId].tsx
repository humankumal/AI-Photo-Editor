import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, useWindowDimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEditorStore } from '@/store/editorSlice';
import { useUIStore } from '@/store/uiSlice';
import { useAIStore } from '@/store/aiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useFirestorePhoto } from '@/hooks/useFirestorePhoto';
import { savePhotoToLibrary } from '@/services/platform/media';
import { shareFile } from '@/services/platform/share';
import { exportFinal } from '@/services/editor/manipulator';
import { PhotoCanvas } from '@/components/editor/PhotoCanvas';
import { successNotification, lightTap } from '@/utils/haptics';

type Format = 'jpeg' | 'png' | 'webp';
type SizeOption = { label: string; value: number | null };

const FORMAT_OPTIONS: { label: string; value: Format }[] = [
  { label: 'JPEG', value: 'jpeg' },
  { label: 'PNG', value: 'png' },
  { label: 'WebP', value: 'webp' },
];

const SIZE_OPTIONS: SizeOption[] = [
  { label: 'Full', value: null },
  { label: '2048', value: 2048 },
  { label: '1080', value: 1080 },
  { label: '720', value: 720 },
];

const QUALITY_OPTIONS = [
  { label: '60%', value: 0.6 },
  { label: '80%', value: 0.8 },
  { label: '90%', value: 0.9 },
  { label: '100%', value: 1.0 },
];

const MIME: Record<Format, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export default function ExportScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  const decodedId = decodeURIComponent(photoId ?? '');

  const workingUri = useEditorStore((s) => s.workingUri);
  const originalUri = useEditorStore((s) => s.originalUri);
  const adjustments = useEditorStore((s) => s.adjustments);
  const appliedFilterId = useEditorStore((s) => s.appliedFilterId);
  const textLayers = useEditorStore((s) => s.textLayers);
  const captureCanvas = useUIStore((s) => s.captureCanvas);
  const aiResults = useAIStore((s) => s.results[decodedId] ?? {});
  const { user } = useAuth();
  const { saveEdit } = useFirestorePhoto(user?.uid ?? null);

  const [format, setFormat] = useState<Format>('jpeg');
  const [quality, setQuality] = useState(0.9);
  const [maxDimension, setMaxDimension] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cloudSaved, setCloudSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSize = width - 32;
  const isPng = format === 'png';

  async function getFinalUri(): Promise<string | null> {
    // Capture the Skia canvas (includes all visual adjustments + text layers)
    let sourceUri: string | null = null;
    if (captureCanvas) {
      sourceUri = await captureCanvas();
    }
    if (!sourceUri) sourceUri = workingUri;
    if (!sourceUri) return null;

    // Apply format, quality, and resize via manipulator
    return exportFinal(
      sourceUri,
      isPng ? 1.0 : quality,
      format,
      maxDimension ?? undefined
    );
  }

  async function handleSave() {
    setIsLoading(true);
    setError(null);
    try {
      const uri = await getFinalUri();
      if (!uri) throw new Error('Could not render the edited image.');

      await savePhotoToLibrary(uri);
      successNotification();
      setDone(true);

      if (user && originalUri) {
        await saveEdit({
          photoId: decodedId,
          editedUri: uri,
          originalUri,
          adjustments,
          appliedFilterId,
          aiResults,
        });
        setCloudSaved(true);
      }
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
      await shareFile(uri, MIME[format]);
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Live preview */}
        {workingUri && (
          <View
            className="mx-4 bg-black rounded-2xl overflow-hidden mb-6 items-center justify-center"
            style={{ height: previewSize * 0.55 }}
          >
            <PhotoCanvas
              uri={workingUri}
              adjustments={adjustments}
              textLayers={textLayers}
              width={previewSize}
              height={previewSize * 0.55}
            />
          </View>
        )}

        <View className="px-4 gap-5">
          {/* Format */}
          <View>
            <Text className="text-textSecondary text-xs font-semibold uppercase tracking-widest mb-2">
              Format
            </Text>
            <View className="flex-row gap-2">
              {FORMAT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`flex-1 py-2 rounded-xl items-center ${format === opt.value ? 'bg-primary' : 'bg-surface'}`}
                  onPress={() => setFormat(opt.value)}
                >
                  <Text className={format === opt.value ? 'text-white font-semibold' : 'text-textSecondary'}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Max dimension */}
          <View>
            <Text className="text-textSecondary text-xs font-semibold uppercase tracking-widest mb-2">
              Size (long edge)
            </Text>
            <View className="flex-row gap-2">
              {SIZE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  className={`flex-1 py-2 rounded-xl items-center ${maxDimension === opt.value ? 'bg-primary' : 'bg-surface'}`}
                  onPress={() => setMaxDimension(opt.value)}
                >
                  <Text className={maxDimension === opt.value ? 'text-white font-semibold text-xs' : 'text-textSecondary text-xs'}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quality — hidden for PNG (lossless) */}
          {!isPng && (
            <View>
              <Text className="text-textSecondary text-xs font-semibold uppercase tracking-widest mb-2">
                Quality
              </Text>
              <View className="flex-row gap-2">
                {QUALITY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    className={`flex-1 py-2 rounded-xl items-center ${quality === opt.value ? 'bg-primary' : 'bg-surface'}`}
                    onPress={() => setQuality(opt.value)}
                  >
                    <Text className={quality === opt.value ? 'text-white font-semibold text-xs' : 'text-textSecondary text-xs'}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          {done ? (
            <View className="bg-success/20 rounded-xl py-3 px-4">
              <Text className="text-success font-semibold text-center">Saved to camera roll!</Text>
              {cloudSaved && (
                <Text className="text-success/70 text-xs text-center mt-1">Also saved to cloud</Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center"
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
            <Text className="text-textPrimary font-semibold text-base">Share…</Text>
          </TouchableOpacity>

          {error && (
            <Text className="text-error text-sm text-center">{error}</Text>
          )}
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
