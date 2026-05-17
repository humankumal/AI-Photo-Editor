import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function mimeFromUri(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  return MIME[ext] ?? 'image/jpeg';
}

export async function shareFile(uri: string, mimeType?: string): Promise<void> {
  const mime = mimeType ?? mimeFromUri(uri);
  if (Platform.OS === 'web') {
    if (navigator.share) {
      await navigator.share({ url: uri });
    } else {
      const ext = mime.split('/')[1] ?? 'jpg';
      const link = document.createElement('a');
      link.href = uri;
      link.download = `edited-photo.${ext}`;
      link.click();
    }
    return;
  }
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, { mimeType: mime, dialogTitle: 'Share your photo' });
  }
}
