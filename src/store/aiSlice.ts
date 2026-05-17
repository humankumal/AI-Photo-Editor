import { create } from 'zustand';
import type { AIResults, AIFeature } from '@/types/ai';

type AIState = {
  results: Record<string, AIResults>;
  loading: Record<AIFeature, boolean>;
  errors: Record<AIFeature, string | null>;
};

type AIActions = {
  setLoading: (feature: AIFeature, loading: boolean) => void;
  setResult: (photoId: string, feature: AIFeature, data: AIResults[AIFeature]) => void;
  setError: (feature: AIFeature, error: string | null) => void;
  clearResults: (photoId: string) => void;
};

export const useAIStore = create<AIState & AIActions>((set) => ({
  results: {},
  loading: { caption: false, enhance: false, background: false, recognize: false },
  errors: { caption: null, enhance: null, background: null, recognize: null },

  setLoading(feature, loading) {
    set((s) => ({ loading: { ...s.loading, [feature]: loading } }));
  },

  setResult(photoId, feature, data) {
    set((s) => ({
      results: {
        ...s.results,
        [photoId]: { ...(s.results[photoId] ?? {}), [feature]: data },
      },
    }));
  },

  setError(feature, error) {
    set((s) => ({ errors: { ...s.errors, [feature]: error } }));
  },

  clearResults(photoId) {
    set((s) => {
      const next = { ...s.results };
      delete next[photoId];
      return { results: next };
    });
  },
}));
