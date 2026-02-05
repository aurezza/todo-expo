import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useLayout } from '../context/LayoutContext';

const DUMMY_NAV_ITEMS = [
  { id: '1', icon: 'home', route: '/(home)', color: '#3b82f6' },
  { id: '2', icon: 'person', route: '/(home)/profile', color: '#10b981' },
  { id: '3', icon: 'settings', route: '/settings', color: '#8b5cf6' },
  { id: '4', icon: 'calendar', route: '/calendar', color: '#f59e0b' },
  { id: '5', icon: 'chatbubbles', route: '/chat', color: '#ef4444' },
  { id: '6', icon: 'stats-chart', route: '/stats', color: '#ec4899' },
];

export default function Sidebar() {
  const { isSidebarVisible } = useLayout();

  if (!isSidebarVisible) return null;

  return (
    <View className="w-20 bg-gray-900 border-r border-gray-800 flex-col items-center pt-12 pb-20">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 24, alignItems: 'center' }}>
        {DUMMY_NAV_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => router.push(item.route as any)}
            className="w-12 h-12 rounded-full items-center justify-center bg-gray-700 opacity-80"
          >
            <Ionicons name={item.icon as any} size={24} color="white" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
