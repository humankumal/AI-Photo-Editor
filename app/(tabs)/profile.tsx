import { View, Text, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 bg-background px-6 pt-14">
      <StatusBar style="light" />
      <Text className="text-textPrimary text-2xl font-bold mb-8">Profile</Text>

      {user && (
        <View className="items-center mb-8">
          {user.photoURL && (
            <Image
              source={{ uri: user.photoURL }}
              className="w-20 h-20 rounded-full mb-3"
            />
          )}
          <Text className="text-textPrimary text-lg font-semibold">{user.displayName}</Text>
          <Text className="text-textSecondary text-sm">{user.email}</Text>
        </View>
      )}

      <TouchableOpacity
        className="bg-error rounded-xl py-3 items-center"
        onPress={signOut}
      >
        <Text className="text-white font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
