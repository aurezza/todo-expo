import { Ionicons } from '@expo/vector-icons';
import { FlatList, Text, View } from 'react-native';

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Task Assignment',
    message: 'You have been assigned to "Design System Review"',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    title: 'Project Update',
    message: 'Mobile App Project status changed to "In Progress"',
    time: '1h ago',
    read: false,
  },
  {
    id: '3',
    title: 'Meeting Reminder',
    message: 'Team Standup starts in 15 minutes',
    time: '3h ago',
    read: true,
  },
  {
    id: '4',
    title: 'Task Completed',
    message: 'John completed "API Integration"',
    time: 'Yesterday',
    read: true,
  },
];

export default function NotificationsScreen() {
  const renderItem = ({ item }: { item: Notification }) => (
    <View className={`p-4 border-b border-gray-800 ${item.read ? 'bg-transparent' : 'bg-gray-900/50'}`}>
      <View className="flex-row justify-between mb-1">
        <Text className={`text-base font-bold ${item.read ? 'text-gray-300' : 'text-white'}`}>
          {item.title}
        </Text>
        <Text className="text-xs text-gray-500">{item.time}</Text>
      </View>
      <Text className="text-gray-400 leading-5">{item.message}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <View className="p-4 border-b border-gray-800">
        <Text className="text-2xl font-bold text-white">Notifications</Text>
      </View>
      <FlatList
        data={DUMMY_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Ionicons name="notifications-off-outline" size={48} color="#4b5563" />
            <Text className="text-gray-500 mt-4">No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}
