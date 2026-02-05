import { View } from 'react-native';
import Checklist from '../../components/Checklist';

export default function TasksScreen() {
  return (
    <View className="flex-1 bg-black pt-4">
       <Checklist />
    </View>
  );
}
