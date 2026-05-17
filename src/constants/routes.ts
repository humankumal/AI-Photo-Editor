export const Routes = {
  WELCOME: '/(auth)/welcome' as const,
  SIGN_IN: '/(auth)/sign-in' as const,
  HOME: '/(tabs)/' as const,
  PROFILE: '/(tabs)/profile' as const,
  EDITOR: (photoId: string) => `/editor/${photoId}` as const,
  AI_RESULTS: (photoId: string) => `/ai-results/${photoId}` as const,
  EXPORT: (photoId: string) => `/export/${photoId}` as const,
};
