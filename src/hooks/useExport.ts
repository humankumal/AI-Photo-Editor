import { useState } from 'react';
import { useUIStore } from '@/store/uiSlice';
import { exportFinal } from '@/services/editor/manipulator';
import { savePhotoToLibrary } from '@/services/platform/media';
import { shareFile } from '@/services/platform/share';
import type { ExportOptions } from '@/types/photo';

export function useExport() {
  const { setExporting } = useUIStore();
  const [error, setError] = useState<string | null>(null);

  async function exportPhoto(uri: string, options: ExportOptions) {
    setExporting(true);
    setError(null);
    try {
      const finalUri = await exportFinal(uri, options.quality, options.format);
      if (options.saveToLibrary) await savePhotoToLibrary(finalUri);
      return finalUri;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Export failed';
      setError(msg);
      return null;
    } finally {
      setExporting(false);
    }
  }

  async function sharePhoto(uri: string) {
    await shareFile(uri);
  }

  return { exportPhoto, sharePhoto, error };
}
