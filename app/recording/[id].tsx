import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useCallStore } from '../../store/useCallStore';

export default function RecordingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Find the recording with id
  const recording = useCallStore((state) => state.recordings.find((r) => r.id === id));
  
  const videoSource = recording?.videoUrl === 'dummy_recording_url.mp4' 
    ? 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
    : recording?.videoUrl || '';

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    if (!recording) {
      Alert.alert("Error", "Recording not found.");
      router.back();
    }
  }, [recording]);

  if (!recording) {
    return <View className="flex-1 bg-black" />;
  }

  return (
    <View className="flex-1 bg-black justify-center">
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-black/50 rounded-full">
            <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="w-full h-[300px]">
          <VideoView 
             style={{ width: '100%', height: '100%' }} 
             player={player} 
             allowsFullscreen 
             allowsPictureInPicture
          />
      </View>

      <View className="p-4 bg-gray-900 m-4 rounded-xl">
          <Text className="text-white text-lg font-bold mb-1">Recording Details</Text>
          <Text className="text-gray-400">ID: {recording.id}</Text>
          <Text className="text-gray-400">With: {recording.chatId}</Text>
          <Text className="text-gray-400">Date: {recording.timestamp}</Text>
          <Text className="text-gray-400">Duration: {recording.duration}s</Text>
      </View>
    </View>
  );
}
