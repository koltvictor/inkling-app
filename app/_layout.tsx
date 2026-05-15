import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../design/colors";
import { useAppStore } from "../lib/storage/store";

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    const unsub = useAppStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, [hydrated]);

  if (!hydrated) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: colors.light.paper }} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.light.paper },
          animation: "fade",
        }}
      />
    </SafeAreaProvider>
  );
}
