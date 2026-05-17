import { useEffect, useState } from 'react';
import { getRecentPhotos, requestMediaPermission, pickPhotoFromLibrary } from '@/services/platform/media';
import type { Photo } from '@/types/photo';

export function usePhotoLibrary() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const granted = await requestMediaPermission();
      setHasPermission(granted);
      if (granted) {
        setLoading(true);
        const recent = await getRecentPhotos(30);
        setPhotos(recent);
        setLoading(false);
      }
    })();
  }, []);

  async function pickPhoto(): Promise<Photo | null> {
    return pickPhotoFromLibrary();
  }

  return { photos, hasPermission, loading, pickPhoto };
}
