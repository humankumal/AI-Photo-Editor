import { useState, useCallback } from 'react';
import { saveUserPreset, deleteUserPreset, getUserPresets } from '@/services/firebase/firestore';
import type { AdjustmentParams } from '@/types/photo';
import type { UserPreset } from '@/types/preset';

export function useCustomPresets(userId: string | null) {
  const [presets, setPresets] = useState<UserPreset[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPresets = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserPresets(userId);
      setPresets(data);
    } catch {
      // Non-fatal — Firebase may not be configured
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const savePreset = useCallback(async (name: string, adjustments: AdjustmentParams) => {
    if (!userId) return;
    const preset: UserPreset = {
      id: `preset_${Date.now()}`,
      name: name.trim(),
      adjustments,
      createdAt: Date.now(),
    };
    try {
      await saveUserPreset(userId, preset);
      setPresets((prev) => [preset, ...prev]);
    } catch {
      // Non-fatal
    }
  }, [userId]);

  const deletePreset = useCallback(async (presetId: string) => {
    if (!userId) return;
    try {
      await deleteUserPreset(userId, presetId);
      setPresets((prev) => prev.filter((p) => p.id !== presetId));
    } catch {
      // Non-fatal
    }
  }, [userId]);

  return { presets, loading, loadPresets, savePreset, deletePreset };
}
