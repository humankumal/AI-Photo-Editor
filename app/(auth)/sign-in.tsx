import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { signInWithGoogle } from '@/services/firebase/auth';
import { Colors } from '@/constants/colors';

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0f0f0f', '#1a0a2e']} className="flex-1 items-center justify-center px-6">
      <StatusBar style="light" />

      <View className="items-center mb-16">
        <Text className="text-4xl font-bold text-white">Welcome</Text>
        <Text className="text-textSecondary text-base mt-2 text-center">
          Sign in to save your edits and access AI features
        </Text>
      </View>

      <TouchableOpacity
        className="w-full bg-white rounded-2xl py-4 flex-row items-center justify-center gap-3"
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text className="text-gray-800 font-semibold text-base">Continue with Google</Text>
        )}
      </TouchableOpacity>

      {error && (
        <Text className="text-error text-sm mt-4 text-center">{error}</Text>
      )}
    </LinearGradient>
  );
}
