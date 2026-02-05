import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useLayout } from '../context/LayoutContext';

export default function BottomNav() {
  const { setSidebarVisible } = useLayout();

  const handleNavPress = (route: string) => {
    if (route === '/(home)') {
      setSidebarVisible(true);
    } else {
      setSidebarVisible(false);
    }
    router.push(route as any);
  };

  return (
    <View className="flex-row justify-around items-center bg-gray-900 border-t border-gray-800 py-4 pb-8">
      <TouchableOpacity onPress={() => handleNavPress('/(home)')} className="items-center">
        <Ionicons name="home-outline" size={28} color="white" />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleNavPress('/notifications')} className="items-center">
        <Ionicons name="notifications-outline" size={28} color="white" />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleNavPress('/(home)/profile')} className="items-center">
        <Ionicons name="person-outline" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
