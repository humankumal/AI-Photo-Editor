import { useAIStore } from '@/store/aiSlice';
import { encodeImageForClaude } from '@/services/claude/imageEncoder';
import { getIdToken } from '@/services/firebase/auth';
import type { AIFeature } from '@/types/ai';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8081';

async function callAIRoute<T>(feature: AIFeature, uri: string): Promise<T> {
  const [encoded, token] = await Promise.all([
    encodeImageForClaude(uri),
    getIdToken(),
  ]);

  const res = await fetch(`${BASE_URL}/api/ai/${feature}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ base64Image: encoded.base64, mimeType: encoded.mimeType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'AI request failed');
  }

  return res.json();
}

export function useAIFeatures(photoId: string, workingUri: string | null) {
  const { setLoading, setResult, setError, loading, errors, results } = useAIStore();
  const photoResults = results[photoId];

  async function run(feature: AIFeature) {
    if (!workingUri) return;
    setLoading(feature, true);
    setError(feature, null);
    try {
      const data = await callAIRoute(feature, workingUri);
      setResult(photoId, feature, data as never);
    } catch (e: unknown) {
      setError(feature, e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(feature, false);
    }
  }

  return { run, loading, errors, results: photoResults ?? {} };
}
