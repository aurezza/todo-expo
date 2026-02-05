import { useCallStore } from '@/store/useCallStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  const recordings = useCallStore((state) => state.recordings);
  const handleStartChat = () => {
    router.push('/conversation/new');
  };

  const handleStartVideoCall = () => {
    router.push('/call/new');
  };

  return (
    <View className="flex-1 bg-black p-4">
      <Text className="text-3xl font-bold text-white mb-2">Messages</Text>
      <Text className="text-gray-400 mb-8">Connect with your team</Text>

      <View className="flex-row gap-4 mb-8">
        <TouchableOpacity 
          onPress={handleStartChat}
          className="flex-1 bg-gray-900 p-4 rounded-2xl items-center border border-gray-800 active:bg-gray-800"
        >
          <View className="w-12 h-12 bg-blue-600/20 rounded-full items-center justify-center mb-3">
            <Ionicons name="chatbubbles" size={24} color="#3b82f6" />
          </View>
          <Text className="text-white text-base font-bold">Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleStartVideoCall}
          className="flex-1 bg-gray-900 p-4 rounded-2xl items-center border border-gray-800 active:bg-gray-800"
        >
          <View className="w-12 h-12 bg-green-600/20 rounded-full items-center justify-center mb-3">
            <Ionicons name="videocam" size={24} color="#22c55e" />
          </View>
          <Text className="text-white text-base font-bold">Video</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/zoom')}
          className="flex-1 bg-gray-900 p-4 rounded-2xl items-center border border-gray-800 active:bg-gray-800"
        >
          <View className="w-12 h-12 bg-blue-400/20 rounded-full items-center justify-center mb-3">
            <Ionicons name="people" size={24} color="#60a5fa" />
          </View>
          <Text className="text-white text-base font-bold">Zoom</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Text className="text-white text-xl font-bold mb-4">Recordings</Text>
        {recordings.length === 0 ? (
          <Text className="text-gray-500 mb-6">No recordings saved locally.</Text>
        ) : (
          recordings.map((rec) => (
             <TouchableOpacity 
                 key={rec.id} 
                 className="flex-row items-center p-4 bg-gray-900/50 mb-2 rounded-xl"
                 onPress={() => router.push(`/recording/${rec.id}`)}
             >
               <View className="w-10 h-10 bg-red-900/40 rounded-full items-center justify-center mr-3">
                 <Ionicons name="videocam" size={20} color="#f87171" />
               </View>
               <View className="flex-1">
                 <Text className="text-white font-medium">Call with {rec.chatId}</Text>
                 <Text className="text-gray-500 text-xs">{rec.timestamp} • {rec.duration}s</Text>
               </View>
               <Ionicons name="play-circle-outline" size={24} color="#3b82f6" />
             </TouchableOpacity>
          ))
        )}

        <Text className="text-white text-xl font-bold mb-4">Recent Messages</Text>
        {/* Dummy recent items */}
        {['Team Standup', 'Project Review', 'Design Sync'].map((item, index) => (
          <TouchableOpacity 
            key={index} 
            className="flex-row items-center p-4 bg-gray-900/50 mb-2 rounded-xl"
            onPress={() => router.push(`/conversation/${index + 1}`)}
          >
            <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">{item[0]}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-medium">{item}</Text>
              <Text className="text-gray-500 text-xs">2 hours ago</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
