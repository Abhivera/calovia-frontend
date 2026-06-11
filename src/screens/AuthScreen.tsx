import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link, usePathname, useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store";
import { ArrowUpRight } from "lucide-react-native";
import CaloviaLogo from "@/components/layout/CaloviaLogo";
import { Card, PrimaryButton } from "@/components/ui/Common";
import {
  clearError,
  login,
  loginWithGoogle,
  register,
} from "@/slices/authSlice";
import { colors } from "@/theme/colors";
import { TextInput } from "react-native";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
});

const registerSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  full_name: Yup.string().max(100, "Name is too long"),
  password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters").max(128),
});

function FormField({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
        }}
      />
      {error ? <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { token, loading, error } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState(pathname === "/register" ? "register" : "login");

  useEffect(() => {
    setMode(pathname === "/register" ? "register" : "login");
  }, [pathname]);

  useEffect(() => {
    dispatch(clearError());
    if (token) router.replace("/");
  }, [token, dispatch, router]);

  const isLogin = mode === "login";

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.pageBg,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <CaloviaLogo href="/" showText={false} size={120} />
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text, marginTop: 12 }}>Calovia</Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
          Track meals, steps, and calories
        </Text>
      </View>

      <Card style={{ width: "100%", maxWidth: 420 }}>
        <View style={{ flexDirection: "row", borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 4, marginBottom: 24 }}>
          {(["login", "register"] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                dispatch(clearError());
                router.replace(m === "login" ? "/login" : "/register");
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 6,
                backgroundColor: mode === m ? colors.brand : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 14, color: mode === m ? "#fff" : colors.textMuted }}>
                {m === "login" ? "Sign in" : "Create account"}
              </Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton
          label={loading ? "Signing in…" : "Continue with Google"}
          onPress={() => {
            dispatch(clearError());
            dispatch(loginWithGoogle());
          }}
          disabled={loading}
          loading={loading}
        />

        {error ? (
          <Text style={{ fontSize: 14, color: colors.danger, backgroundColor: colors.dangerBg, padding: 12, borderRadius: 8, marginTop: 16 }}>
            {error}
          </Text>
        ) : null}

        <Text style={{ textAlign: "center", color: colors.textLight, fontSize: 12, marginVertical: 20 }}>
          or continue with email
        </Text>

        {isLogin ? (
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={(values) => {
              dispatch(clearError());
              dispatch(login(values));
            }}
          >
            {({ handleSubmit, values, setFieldValue, errors, touched }) => (
              <View>
                <FormField
                  label="Email"
                  value={values.email}
                  onChangeText={(v) => setFieldValue("email", v)}
                  error={touched.email && errors.email ? errors.email : undefined}
                  placeholder="you@example.com"
                />
                <FormField
                  label="Password"
                  value={values.password}
                  onChangeText={(v) => setFieldValue("password", v)}
                  error={touched.password && errors.password ? errors.password : undefined}
                  secureTextEntry
                />
                <PrimaryButton label="Sign in with email" onPress={() => handleSubmit()} disabled={loading} loading={loading} />
              </View>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ email: "", full_name: "", password: "" }}
            validationSchema={registerSchema}
            onSubmit={(values) => {
              dispatch(clearError());
              const payload: { email: string; password: string; full_name?: string } = {
                email: values.email,
                password: values.password,
              };
              if (values.full_name?.trim()) payload.full_name = values.full_name.trim();
              dispatch(register(payload));
            }}
          >
            {({ handleSubmit, values, setFieldValue, errors, touched }) => (
              <View>
                <FormField
                  label="Email"
                  value={values.email}
                  onChangeText={(v) => setFieldValue("email", v)}
                  error={touched.email && errors.email ? errors.email : undefined}
                  placeholder="you@example.com"
                />
                <FormField
                  label="Full name (optional)"
                  value={values.full_name}
                  onChangeText={(v) => setFieldValue("full_name", v)}
                  placeholder="Jane Doe"
                />
                <FormField
                  label="Password"
                  value={values.password}
                  onChangeText={(v) => setFieldValue("password", v)}
                  error={touched.password && errors.password ? errors.password : undefined}
                  secureTextEntry
                  placeholder="At least 8 characters"
                />
                <PrimaryButton label="Create account with email" onPress={() => handleSubmit()} disabled={loading} loading={loading} />
              </View>
            )}
          </Formik>
        )}

        <Text style={{ textAlign: "center", fontSize: 12, color: colors.textLight, marginTop: 20 }}>
          Google or email · No credit card required
        </Text>
      </Card>

      <Text style={{ marginTop: 32, fontSize: 14, color: colors.textMuted, textAlign: "center" }}>
        Or try without an account →{" "}
        <Link href="/" style={{ color: colors.brand, fontWeight: "500" }}>analyze a meal</Link>
      </Text>
    </ScrollView>
  );
}
