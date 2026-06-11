import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { colors } from "@/theme/colors";

export default function ProtectedScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading, authReady } = useSelector(
    (state: RootState) => state.auth
  );

  if (!authReady || loading) {
    return (
      <View
        style={{
          flex: 1,
          minHeight: 200,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}

export function useAuthInit(
  dispatch: (action: unknown) => void,
  initializeAuth: () => unknown,
  getCurrentUser: () => unknown
) {
  const { token, user, authReady } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch, initializeAuth]);

  useEffect(() => {
    if (authReady && token && !user) {
      dispatch(getCurrentUser());
    }
  }, [authReady, token, user, dispatch, getCurrentUser]);
}
