import { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStats } from '@/hooks/useProfileStats';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { totalEdits, recentEdits, loading, loadStats } = useProfileStats(user?.uid ?? null);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar style="light" />
      <View className="px-6 pt-14">
        <Text className="text-textPrimary text-2xl font-bold mb-8">Profile</Text>

        {user && (
          <View className="items-center mb-6">
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

        {/* Stats card */}
        <View className="bg-surface rounded-2xl p-4 mb-6">
          <Text className="text-textSecondary text-xs font-semibold uppercase tracking-widest mb-3">
            Editing Stats
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-textPrimary text-3xl font-bold">
                  {totalEdits ?? '—'}
                </Text>
                <Text className="text-textSecondary text-xs mt-1">Total Edits</Text>
              </View>
              <View className="items-center">
                <Text className="text-textPrimary text-3xl font-bold">
                  {recentEdits.length}
                </Text>
                <Text className="text-textSecondary text-xs mt-1">Recent</Text>
              </View>
            </View>
          )}
        </View>

        {/* Recent edits grid */}
        {recentEdits.length > 0 && (
          <View className="mb-6">
            <Text className="text-textSecondary text-xs font-semibold uppercase tracking-widest mb-3">
              Recent Edits
            </Text>
            <View className="flex-row flex-wrap gap-1">
              {recentEdits.map((doc) =>
                doc.editedStorageUrl ? (
                  <Image
                    key={doc.photoId}
                    source={{ uri: doc.editedStorageUrl }}
                    style={{ width: '32%', aspectRatio: 1, borderRadius: 8 }}
                  />
                ) : null
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          className="bg-error rounded-xl py-3 items-center"
          onPress={signOut}
        >
          <Text className="text-white font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
