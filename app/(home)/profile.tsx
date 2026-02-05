import { useProfileStore } from '@/store/useProfileStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthActions } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';

export default function ProfileScreen() {
  const { profile, updateProfile, fetchProfile } = useProfileStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, []);
  
  // Temporary state for editing form
  const [editForm, setEditForm] = useState(profile);

  // Sync form when profile changes externally or modal opens
  useEffect(() => {
    if (isEditing) {
      setEditForm(profile);
    }
  }, [isEditing, profile]);

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await useAuthActions.logout();
    // No need to manually redirect; the root _layout effect will handle it when isAuthenticated becomes false.
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setEditForm(prev => ({ ...prev, avatar: result.assets[0].uri }));
    }
  };

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="items-center pt-8 px-4">
        <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 mb-4 relative">
          <Image 
            source={{ uri: profile.avatar }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        
        <Text className="text-2xl font-bold text-white mb-1">{profile.name}</Text>
        <Text className="text-blue-400 font-medium mb-4">{profile.role}</Text>

        <TouchableOpacity 
          onPress={() => setIsEditing(true)}
          className="bg-gray-800 px-6 py-2 rounded-full mb-8 flex-row items-center"
        >
          <Ionicons name="pencil-outline" size={16} color="white" />
          <Text className="text-white ml-2 font-medium">Edit Profile</Text>
        </TouchableOpacity>
        
        <View className="flex-col w-full justify-around mb-8 bg-gray-900 p-4 rounded-xl">
          <Text className="text-lg font-bold text-white mb-4">My Tasks</Text>
          <View className='flex-row justify-around'> 
            <View className="items-center">
              <Text className="text-xl font-bold text-white">{profile.stats.tasks}</Text>
              <Text className="text-gray-400 text-sm">Tasks</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-white">{profile.stats.completed}</Text>
              <Text className="text-gray-400 text-sm">Completed</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-white">{profile.stats.pending}</Text>
              <Text className="text-gray-400 text-sm">Pending</Text>
            </View>
          </View>
        </View>

        <View className="w-full bg-gray-900 p-6 rounded-xl mb-6">
          <Text className="text-lg font-bold text-white mb-2">About Me</Text>
          <Text className="text-gray-300 leading-relaxed">{profile.bio}</Text>
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="w-full bg-red-600/10 border border-red-600/50 p-4 rounded-xl flex-row items-center justify-center mb-8"
        >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-bold ml-2">Log Out</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isEditing} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/90 justify-center px-4">
          <View className="bg-gray-900 p-6 rounded-2xl w-full">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-white">Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={pickImage} className="items-center mb-6">
              <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-600 items-center justify-center relative">
                 {editForm.avatar ? (
                   <Image source={{ uri: editForm.avatar }} className="w-full h-full absolute" />
                 ) : null}
                 <View className="bg-black/40 absolute inset-0 items-center justify-center">
                    <Ionicons name="camera" size={24} color="white" />
                 </View>
              </View>
              <Text className="text-blue-400 text-sm mt-2">Change Photo</Text>
            </TouchableOpacity>

            <View className="gap-4">
              <View>
                <Text className="text-gray-400 mb-1 text-sm">Name</Text>
                <TextInput 
                  className="bg-gray-800 text-white p-3 rounded-lg"
                  value={editForm.name}
                  onChangeText={(t) => setEditForm(prev => ({...prev, name: t}))}
                />
              </View>
              
              <View>
                <Text className="text-gray-400 mb-1 text-sm">Role</Text>
                <TextInput 
                  className="bg-gray-800 text-white p-3 rounded-lg"
                  value={editForm.role}
                  onChangeText={(t) => setEditForm(prev => ({...prev, role: t}))}
                />
              </View>

              <View>
                <Text className="text-gray-400 mb-1 text-sm">About Me</Text>
                <TextInput 
                  className="bg-gray-800 text-white p-3 rounded-lg h-24"
                  multiline
                  textAlignVertical="top"
                  value={editForm.bio}
                  onChangeText={(t) => setEditForm(prev => ({...prev, bio: t}))}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleSave}
              className="bg-blue-600 w-full py-4 rounded-lg mt-6 items-center"
            >
              <Text className="text-white font-bold">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
