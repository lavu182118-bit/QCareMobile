import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';

import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <Stack>

        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="role-section"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="admin-login"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="admin-dashboard"
          options={{ headerShown: false }}
        />

      </Stack>
    </ThemeProvider>
  );
}