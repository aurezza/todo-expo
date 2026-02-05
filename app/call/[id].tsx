import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useCallStore } from '../../store/useCallStore';

export default function CallScreen() {
  const { id } = useLocalSearchParams();
  const chatId = Array.isArray(id) ? id[0] : id || 'unknown';
  const router = useRouter();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const saveRecording = useCallStore((state) => state.saveRecording);

  useEffect(() => {
    if (!permission) {
        requestPermission();
    }
    
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [permission]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center bg-black p-4">
        <Text className="text-white text-center mb-4">We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-blue-600 p-4 rounded-lg">
            <Text className="text-white text-center font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleEndCall = () => {
    if (isRecording) {
      handleStopRecording();
    }
    router.back();
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      // Mock recording start
      setIsRecording(true);
      Alert.alert("Recording Started", "This call is now being recorded (mocked).");
    }
  };

  const handleStopRecording = () => {
    // Mock recording stop
    setIsRecording(false);
    saveRecording({
      chatId,
      duration: duration,
      timestamp: new Date().toLocaleString(),
      videoUrl: 'dummy_recording_url.mp4',
    });
    Alert.alert("Recording Saved", "Your dummy recording has been saved to history.");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-gray-900 relative">
      <View className="flex-1 items-center justify-center overflow-hidden">
        {isVideoOff ? (
             <View className="items-center justify-center p-8 bg-gray-800 rounded-full w-40 h-40">
                 <Text className="text-4xl text-white font-bold">T</Text>
             </View>
        ) : (
            <CameraView 
                ref={cameraRef}
                style={{ flex: 1, width: '100%' }}
                facing="front"
            >
               <View className="flex-1 bg-black/30" />
            </CameraView>
        )}
        
        <View className="absolute top-16 items-center">
             <Text className="text-white text-2xl font-bold mb-2">Team Member {id}</Text>
             <Text className="text-gray-300 text-lg">{formatTime(duration)}</Text>
             {isRecording && (
               <View className="flex-row items-center mt-2 bg-red-500/80 px-3 py-1 rounded-full">
                 <View className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                 <Text className="text-white text-xs font-bold">REC</Text>
               </View>
             )}
        </View>
      </View>

      {/* Self View (Mocked as inverse of main view or small camera preview if supported multiple cameras, usually just one active on mobile. So keeping as 'You' placeholder or simulate switching) */}
      <View className="absolute top-16 right-4 w-32 h-48 bg-black rounded-xl border border-gray-700 overflow-hidden shadow-lg">
         <View className="flex-1 bg-gray-800 items-center justify-center">
             <Text className="text-gray-500">You</Text>
         </View>
      </View>

      {/* Controls */}
      <View className="absolute bottom-12 left-0 right-0 flex-row justify-evenly items-center px-4">
        <TouchableOpacity 
            onPress={handleToggleRecording}
            className={`p-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-600/80'}`}
        >
          <Ionicons name="radio-button-on" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full ${isMuted ? 'bg-white' : 'bg-gray-600/80'}`}
        >
          <Ionicons name={isMuted ? "mic-off" : "mic"} size={32} color={isMuted ? "black" : "white"} />
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={handleEndCall}
            className="p-6 rounded-full bg-red-600 shadow-lg scale-110"
        >
          <Ionicons name="call" size={36} color="white" style={{ transform: [{ rotate: '135deg' }]}} />
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full ${isVideoOff ? 'bg-white' : 'bg-gray-600/80'}`}
        >
          <Ionicons name={isVideoOff ? "videocam-off" : "videocam"} size={32} color={isVideoOff ? "black" : "white"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
