import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

export async function requestAllPermissions(): Promise<{ media: boolean; camera: boolean }> {
  if (Platform.OS === 'web') return { media: true, camera: true };
  const [mediaResult, cameraResult] = await Promise.all([
    MediaLibrary.requestPermissionsAsync(),
    ImagePicker.requestMediaLibraryPermissionsAsync(),
  ]);
  return {
    media: mediaResult.status === 'granted',
    camera: cameraResult.status === 'granted',
  };
}
