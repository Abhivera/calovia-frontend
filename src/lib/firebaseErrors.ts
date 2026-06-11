import type { FirebaseError } from "firebase/app";

const MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Invalid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/email-already-in-use": "An account already exists with this email.",
  "auth/weak-password": "Password is too weak.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/popup-closed-by-user": "Sign-in popup was closed.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
};

export function getFirebaseErrorMessage(error: unknown): string {
  const code = (error as FirebaseError)?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  return (error as Error)?.message || "Authentication failed";
}
