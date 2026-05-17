import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-textPrimary text-lg mb-4">Screen not found.</Text>
      <TouchableOpacity onPress={() => router.replace('/(tabs)/')}>
        <Text className="text-primary">Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}
