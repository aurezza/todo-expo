import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useChatStore } from '../../store/useChatStore';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
};

const EMPTY_MESSAGES: any[] = [];

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const chatId = Array.isArray(id) ? id[0] : id || 'new'; // Handle array or undefined
  const router = useRouter();
  
  // Use a stable selector or handle empty array in component
  const messages = useChatStore((state) => state.conversations[chatId] ?? EMPTY_MESSAGES);
  const sendMessage = useChatStore((state) => state.sendMessage);
  
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(chatId, inputText.trim());
    setInputText('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-black"
    >
      <View className="flex-row items-center p-4 border-b border-gray-800 bg-gray-900 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
          <Text className="text-white font-bold text-lg">T</Text>
        </View>
        <View>
          <Text className="text-white font-bold text-lg">Team Member {id}</Text>
          <Text className="text-green-500 text-xs">Online</Text>
        </View>
        <View className="flex-1 items-end">
           <TouchableOpacity onPress={() => router.push(`/call/${id}`)}>
             <Ionicons name="videocam" size={24} color="#3b82f6" />
           </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View className={`max-w-[80%] p-3 rounded-2xl ${item.sender === 'me' ? 'bg-blue-600 self-end rounded-br-none' : 'bg-gray-800 self-start rounded-bl-none'}`}>
            <Text className="text-white text-base">{item.text}</Text>
            <Text className="text-gray-300 text-[10px] self-end mt-1">{item.timestamp}</Text>
          </View>
        )}
      />

      <View className="flex-row items-center p-4 bg-gray-900 border-t border-gray-800">
        <TextInput
          className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 mr-2"
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity onPress={handleSend} className="bg-blue-600 p-2 rounded-full">
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
