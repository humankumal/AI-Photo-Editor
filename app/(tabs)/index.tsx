import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePhotoLibrary } from '@/hooks/usePhotoLibrary';
import { useAuth } from '@/hooks/useAuth';
import { useFirestorePhoto } from '@/hooks/useFirestorePhoto';
import type { Photo } from '@/types/photo';
import type { FirestorePhotoDoc } from '@/types/firebase';

const { width } = Dimensions.get('window');
const COLUMNS = 3;
const TILE = (width - 4) / COLUMNS;

function PhotoTile({ uri, onPress }: { uri: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: TILE, height: TILE, margin: 1 }}>
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
    </TouchableOpacity>
  );
}

function RecentEditTile({ doc, onPress }: { doc: FirestorePhotoDoc; onPress: () => void }) {
  const uri = doc.editedStorageUrl ?? doc.originalStorageUrl;
  if (!uri) return null;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ marginRight: 12 }}
    >
      <View style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', backgroundColor: '#252525' }}>
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </View>
      <Text style={{ color: '#a3a3a3', fontSize: 10, textAlign: 'center', marginTop: 4 }}>
        {new Date(doc.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { photos, loading: libraryLoading, hasPermission, pickPhoto } = usePhotoLibrary();
  const { user } = useAuth();
  const { recentEdits, loading: editsLoading, loadRecentEdits } = useFirestorePhoto(user?.uid ?? null);

  useEffect(() => {
    if (user) loadRecentEdits();
  }, [user]);

  async function handlePick() {
    const photo = await pickPhoto();
    if (photo) router.push(`/editor/${encodeURIComponent(photo.id)}`);
  }

  function handlePhotoPress(photo: Photo) {
    router.push(`/editor/${encodeURIComponent(photo.id)}`);
  }

  function handleRecentEditPress(doc: FirestorePhotoDoc) {
    // Re-open editor with the photo id so user can continue editing
    router.push(`/editor/${encodeURIComponent(doc.photoId)}`);
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3">
        <Text className="text-textPrimary text-2xl font-bold">AI Photo Editor</Text>
        <TouchableOpacity
          className="bg-primary px-4 py-2 rounded-xl"
          onPress={handlePick}
        >
          <Text className="text-white font-semibold text-sm">Import</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Edits section */}
      {recentEdits.length > 0 && (
        <View className="mb-4">
          <Text className="text-textSecondary text-sm font-semibold px-4 mb-2">Recent Edits</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}>
            {recentEdits.map((doc) => (
              <RecentEditTile
                key={doc.photoId}
                doc={doc}
                onPress={() => handleRecentEditPress(doc)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Camera roll */}
      {(libraryLoading || editsLoading) && photos.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366f1" />
        </View>
      )}

      {!libraryLoading && !hasPermission && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-textSecondary text-center text-base mb-4">
            Photo library access is required to browse your photos.
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={handlePick}
          >
            <Text className="text-white font-semibold">Import a Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {!libraryLoading && hasPermission && photos.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-textSecondary text-center">No photos found in your library.</Text>
        </View>
      )}

      {photos.length > 0 && (
        <>
          <Text className="text-textSecondary text-sm font-semibold px-4 mb-1">Camera Roll</Text>
          <FlatList
            data={photos}
            keyExtractor={(p) => p.id}
            numColumns={COLUMNS}
            renderItem={({ item }) => (
              <PhotoTile uri={item.uri} onPress={() => handlePhotoPress(item)} />
            )}
          />
        </>
      )}
    </View>
  );
}
