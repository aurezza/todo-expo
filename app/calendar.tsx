import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function CalendarScreen() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token ?? ''));

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user interaction with the notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing Fields", "Please enter both a title and description.");
      return;
    }

    try {
      await schedulePushNotification(title, description);
      Alert.alert("Success", "Notification scheduled successfully! It will appear in 2 seconds.");
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to schedule notification.");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold mb-2">Calendar</Text>
          <Text className="text-gray-400">Schedule a Reminder</Text>
        </View>

        <View className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-6">
          <View className="flex-row items-center border-b border-gray-800 pb-4 mb-2">
            <Ionicons name="notifications-outline" size={24} color="#60a5fa" />
            <Text className="text-white text-xl font-bold ml-3">New Reminder</Text>
          </View>

          <View>
            <Text className="text-gray-400 mb-2 font-medium">Notification Title</Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500"
              placeholder="e.g. Meeting with Team"
              placeholderTextColor="#6b7280"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View>
            <Text className="text-gray-400 mb-2 font-medium">Description</Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500 h-32"
              placeholder="e.g. Discuss quarterly goals and roadmap..."
              placeholderTextColor="#6b7280"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-600 p-4 rounded-xl items-center flex-row justify-center active:bg-blue-700"
          >
            <Ionicons name="send" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-lg">Send Notification</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <Text className="text-gray-500 text-xs font-mono mb-2">DEVICE TOKEN</Text>
          <Text className="text-gray-400 text-xs" selectable>{expoPushToken || 'Waiting for token...'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

async function schedulePushNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
    },
    trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
    },
  });
}

async function registerForPushNotificationsAsync() {
  let token;



  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    Alert.alert('Permission needed', 'Failed to get push token for push notification!');
    return;
  }

  if (Device.isDevice) {
    // Project ID is needed for Expo Push Notifications
    try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
             console.log("Project ID not found in Constants. Skipping token fetch.");
             return;
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
            projectId,
        })).data;
        console.log("Push Token:", token);
    } catch (e) {
        console.error("Error getting token (Device likely doesn't support Push):", e);
    }
  } else {
    console.log('Running on Simulator: Push Token generation skipped, but local notifications will work.');
  }

  return token;
}
