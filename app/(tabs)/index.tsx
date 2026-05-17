import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePhotoLibrary } from '@/hooks/usePhotoLibrary';
import type { Photo } from '@/types/photo';

const { width } = Dimensions.get('window');
const COLUMNS = 3;
const TILE = (width - 4) / COLUMNS;

function PhotoTile({ photo, onPress }: { photo: Photo; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: TILE, height: TILE, margin: 1 }}>
      <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%' }} />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { photos, loading, hasPermission, pickPhoto } = usePhotoLibrary();

  async function handlePick() {
    const photo = await pickPhoto();
    if (photo) router.push(`/editor/${photo.id}`);
  }

  function handlePhotoPress(photo: Photo) {
    router.push(`/editor/${encodeURIComponent(photo.id)}`);
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3">
        <Text className="text-textPrimary text-2xl font-bold">AI Photo Editor</Text>
        <TouchableOpacity
          className="bg-primary px-4 py-2 rounded-xl"
          onPress={handlePick}
        >
          <Text className="text-white font-semibold text-sm">Import</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366f1" />
        </View>
      )}

      {!loading && !hasPermission && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-textSecondary text-center text-base">
            Photo library access is required to browse your photos.
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl mt-4"
            onPress={handlePick}
          >
            <Text className="text-white font-semibold">Import a Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && hasPermission && photos.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-textSecondary text-center">No photos found in your library.</Text>
        </View>
      )}

      {!loading && photos.length > 0 && (
        <FlatList
          data={photos}
          keyExtractor={(p) => p.id}
          numColumns={COLUMNS}
          renderItem={({ item }) => (
            <PhotoTile photo={item} onPress={() => handlePhotoPress(item)} />
          )}
        />
      )}
    </View>
  );
}
