import { Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { TimerProvider } from "../utils/TimerContext";

const convex = new ConvexReactClient("https://useful-pelican-285.convex.cloud", {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <TimerProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0d0d0d" },
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </TimerProvider>
    </ConvexProvider>
  );
}
