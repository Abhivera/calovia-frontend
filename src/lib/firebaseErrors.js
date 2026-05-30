/** @param {unknown} error */
export function getFirebaseErrorMessage(error) {
  const code = error && typeof error === "object" && "code" in error ? error.code : null;
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password";
    case "auth/weak-password":
      return "Password is too weak (use at least 8 characters)";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in cancelled";
    case "auth/popup-blocked":
      return "Pop-up blocked. Allow pop-ups for this site and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method";
    case "auth/cancelled-popup-request":
      return "Sign-in cancelled";
    default:
      if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
      }
      return "Authentication failed";
  }
}
