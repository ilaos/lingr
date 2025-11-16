import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { PresenceStackNavigator } from "./PresenceStackNavigator";
import EvidenceScreen from "@/screens/EvidenceScreen";
import DetectorScreen from "@/screens/DetectorScreen";
import EpisodesScreen from "@/screens/EpisodesScreen";
import ControlScreen from "@/screens/ControlScreen";
import { useTheme } from "@/hooks/useTheme";
import { HeaderTitle } from "@/components/HeaderTitle";

export type MainTabParamList = {
  Presence: undefined;
  Evidence: undefined;
  Detector: undefined;
  Episodes: undefined;
  Control: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Presence"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: true,
        headerTransparent: true,
        headerTitleAlign: "center",
        headerTintColor: theme.text,
        headerStyle: {
          backgroundColor: Platform.select({
            ios: undefined,
            android: theme.backgroundRoot,
          }),
        },
      }}
    >
      <Tab.Screen
        name="Presence"
        component={PresenceStackNavigator}
        options={{
          headerTitle: () => <HeaderTitle title="LINGR" />,
          headerRight: () => null,
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Evidence"
        component={EvidenceScreen}
        options={{
          title: "EVIDENCE",
          tabBarIcon: ({ color, size }) => (
            <Feather name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Detector"
        component={DetectorScreen}
        options={{
          headerShown: false,
          title: "DETECT",
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Episodes"
        component={EpisodesScreen}
        options={{
          title: "HAUNTS",
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Control"
        component={ControlScreen}
        options={{
          title: "CONTROL",
          tabBarIcon: ({ color, size }) => (
            <Feather name="sliders" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
