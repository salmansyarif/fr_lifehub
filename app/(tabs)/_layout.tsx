import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';      
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Entypo, Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#f59e0b',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#111827',
          },
          default: {
            backgroundColor: '#111827',
          },
        }),
      }}>
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather size={28} name="activity" color={color} />,
        }}
      />
    <Tabs.Screen
        name="Mood"
        options={{
          title: 'Mood',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="mood" color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <Entypo size={28} name="new" color={color} />,
        }}
      />

        <Tabs.Screen
        name="public"
        options={{
          title: 'Cat',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="cat" color={color} />,
        }}
      />
    </Tabs>
  );
}