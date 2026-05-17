import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import type { Photo } from '@/types/photo';

export async function requestMediaPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function getRecentPhotos(count: number = 30): Promise<Photo[]> {
  if (Platform.OS === 'web') return [];
  const { assets } = await MediaLibrary.getAssetsAsync({
    first: count,
    mediaType: 'photo',
    sortBy: ['creationTime'],
  });
  return assets.map((a) => ({
    id: a.id,
    uri: a.uri,
    width: a.width,
    height: a.height,
    filename: a.filename,
    creationTime: a.creationTime,
  }));
}

export async function pickPhotoFromLibrary(): Promise<Photo | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return {
    id: asset.assetId ?? asset.uri ?? String(Date.now()),
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    filename: asset.fileName ?? undefined,
  };
}

export async function savePhotoToLibrary(uri: string): Promise<void> {
  if (Platform.OS === 'web') {
    // Trigger a browser download
    const link = document.createElement('a');
    link.href = uri;
    link.download = `edited-photo-${Date.now()}.jpg`;
    link.click();
    return;
  }
  await MediaLibrary.saveToLibraryAsync(uri);
}
