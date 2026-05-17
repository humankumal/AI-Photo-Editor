import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEditorStore } from '@/store/editorSlice';
import { useExport } from '@/hooks/useExport';
import { Colors } from '@/constants/colors';

export default function ExportScreen() {
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  const router = useRouter();
  const workingUri = useEditorStore((s) => s.workingUri);
  const { exportPhoto, sharePhoto, error } = useExport();
  const [quality, setQuality] = useState(0.9);
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    if (!workingUri) return;
    setIsLoading(true);
    const uri = await exportPhoto(workingUri, { quality, format: 'jpeg', saveToLibrary: true, uploadToCloud: false });
    setIsLoading(false);
    if (uri) setDone(true);
  }

  async function handleShare() {
    if (!workingUri) return;
    const uri = await exportPhoto(workingUri, { quality, format: 'jpeg', saveToLibrary: false, uploadToCloud: false });
    if (uri) await sharePhoto(uri);
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

      {workingUri && (
        <View className="mx-4 h-64 bg-black rounded-2xl overflow-hidden mb-6">
          <Image source={{ uri: workingUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
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
