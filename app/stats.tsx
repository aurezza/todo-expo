import { Text, View } from 'react-native';

export default function StatsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className="text-white text-2xl font-bold">Statistics</Text>
      <Text className="text-gray-400 mt-2">Performance metrics and analytics</Text>
    </View>
  );
}
