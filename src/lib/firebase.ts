import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey:
    (extra.firebaseApiKey as string | undefined) ||
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    (extra.firebaseAuthDomain as string | undefined) ||
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:
    (extra.firebaseProjectId as string | undefined) ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId:
    (extra.firebaseAppId as string | undefined) ||
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function requireConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env: ${missing.join(", ")}. Set EXPO_PUBLIC_FIREBASE_* in .env`
    );
  }
}

requireConfig();

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
