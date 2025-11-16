import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PresenceScreen from "@/screens/PresenceScreen";
import { SummonScreen } from "@/screens/SummonScreen";
import { useTheme } from "@/hooks/useTheme";
import { Platform } from "react-native";

export type PresenceStackParamList = {
  PresenceHome: undefined;
  Summon: undefined;
};

const Stack = createNativeStackNavigator<PresenceStackParamList>();

export function PresenceStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTintColor: theme.text,
        headerStyle: {
          backgroundColor: Platform.select({
            ios: undefined,
            android: theme.backgroundRoot,
          }),
        },
      }}
    >
      <Stack.Screen
        name="PresenceHome"
        component={PresenceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Summon"
        component={SummonScreen}
        options={{
          title: "",
          presentation: "card",
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
}
