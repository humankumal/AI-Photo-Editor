import { useState, useCallback } from 'react';
import { saveEditSession, getUserPhotos } from '@/services/firebase/firestore';
import { uploadPhoto } from '@/services/firebase/storage';
import type { FirestorePhotoDoc } from '@/types/firebase';
import type { AdjustmentParams } from '@/types/photo';
import type { AIResults } from '@/types/ai';

export function useFirestorePhoto(userId: string | null) {
  const [recentEdits, setRecentEdits] = useState<FirestorePhotoDoc[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecentEdits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const docs = await getUserPhotos(userId, 20);
      setRecentEdits(docs);
    } catch {
      // Non-fatal — Firebase may not be configured yet
    } finally {
      setLoading(false);
    }
  }, [userId]);

  async function saveEdit(params: {
    photoId: string;
    editedUri: string;
    originalUri: string;
    adjustments: AdjustmentParams;
    appliedFilterId: string | null;
    aiResults: AIResults;
  }) {
    if (!userId) return;
    try {
      const [editedUrl, originalUrl] = await Promise.all([
        uploadPhoto(userId, params.photoId, 'edited', params.editedUri),
        // Only upload original once (check if already uploaded is complex — always upload for MVP)
        uploadPhoto(userId, params.photoId, 'original', params.originalUri),
      ]);

      await saveEditSession(userId, {
        photoId: params.photoId,
        originalStorageUrl: originalUrl,
        editedStorageUrl: editedUrl,
        adjustments: params.adjustments,
        appliedFilterId: params.appliedFilterId,
        aiResults: params.aiResults,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch {
      // Non-fatal — cloud save failure shouldn't block local export
    }
  }

  return { recentEdits, loading, loadRecentEdits, saveEdit };
}
