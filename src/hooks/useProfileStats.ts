import { useState, useCallback } from 'react';
import { getUserPhotos } from '@/services/firebase/firestore';
import type { FirestorePhotoDoc } from '@/types/firebase';

export function useProfileStats(userId: string | null) {
  const [totalEdits, setTotalEdits] = useState<number | null>(null);
  const [recentEdits, setRecentEdits] = useState<FirestorePhotoDoc[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const docs = await getUserPhotos(userId, 500);
      setTotalEdits(docs.length);
      setRecentEdits(docs.slice(0, 21)); // 3-col grid, up to 21 items
    } catch {
      // Non-fatal — Firebase may not be configured
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { totalEdits, recentEdits, loading, loadStats };
}
