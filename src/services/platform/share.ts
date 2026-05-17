import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

export async function shareFile(uri: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (navigator.share) {
      await navigator.share({ url: uri });
    } else {
      const link = document.createElement('a');
      link.href = uri;
      link.download = 'edited-photo.jpg';
      link.click();
    }
    return;
  }
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Share your photo' });
  }
}
