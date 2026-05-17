import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const SLIDES = [
  { title: 'Edit with AI', subtitle: 'Enhance your photos with one tap using Claude AI.' },
  { title: 'Smart Filters', subtitle: 'AI-suggested adjustments tuned to each unique photo.' },
  { title: 'Understand Your Photos', subtitle: 'Captions, object detection, and scene recognition built in.' },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#0f0f0f', '#1a0a2e']} className="flex-1 items-center justify-between py-20 px-6">
      <StatusBar style="light" />
      <View className="items-center mt-16">
        <Text className="text-5xl font-bold text-white mb-2">AI Photo</Text>
        <Text className="text-5xl font-bold text-primary">Editor</Text>
      </View>

      <View className="items-center px-4">
        {SLIDES.map((s, i) => (
          <View key={i} className="mb-6 items-center">
            <Text className="text-textPrimary text-xl font-semibold text-center">{s.title}</Text>
            <Text className="text-textSecondary text-sm text-center mt-1">{s.subtitle}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="w-full bg-primary rounded-2xl py-4 items-center"
        onPress={() => router.push('/(auth)/sign-in')}
      >
        <Text className="text-white font-semibold text-base">Get Started</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
