import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import Toast from "react-native-toast-message";
import { store, useAppDispatch, useAppSelector } from "@/store";
import {
  getCurrentUser,
  initializeAuth,
} from "@/slices/authSlice";
import { colors } from "@/theme/colors";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { authReady, token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (authReady && token && !user) {
      dispatch(getCurrentUser());
    }
  }, [authReady, token, user, dispatch]);

  if (!authReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.pageBg }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthBootstrap>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="meal-log" />
          <Stack.Screen name="activity" />
          <Stack.Screen name="progress" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="legal/index" />
          <Stack.Screen name="legal/[slug]" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast />
      </AuthBootstrap>
    </Provider>
  );
}
