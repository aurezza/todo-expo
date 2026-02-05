import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationEventMap,
    MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function HomeLayout() {
  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarStyle: { backgroundColor: 'black' },
        tabBarLabelStyle: { color: 'white', fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#2563eb' },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <MaterialTopTabs.Screen name="index" options={{ title: 'Tasks' }} />
      <MaterialTopTabs.Screen name="profile" options={{ title: 'Profile' }} />
    </MaterialTopTabs>
  );
}
