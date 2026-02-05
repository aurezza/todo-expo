import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ZoomScreenWeb() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black items-center justify-center p-6">
      <View className="bg-gray-900 p-8 rounded-2xl border border-gray-800 items-center max-w-md w-full">
        <View className="w-20 h-20 bg-blue-600/20 rounded-full items-center justify-center mb-6">
          <Ionicons name="desktop-outline" size={40} color="#3b82f6" />
        </View>
        
        <Text className="text-white text-2xl font-bold mb-3 text-center">Web Support Unavailable</Text>
        
        <Text className="text-gray-400 text-center mb-8 leading-6">
          The Zoom Video SDK integration is currently available only on iOS and Android native applications.
        </Text>

        <View className="w-full space-y-3">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-blue-600 w-full py-4 rounded-xl items-center active:bg-blue-700"
          >
            <Text className="text-white font-bold text-lg">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
