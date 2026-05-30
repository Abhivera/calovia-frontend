import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import * as authApi from "../api/auth";
import { auth, googleProvider } from "../lib/firebase";
import { resolveBackendUser, sessionPayloadFromFirebaseUser } from "../lib/backendUser";
import { getApiErrorMessage } from "../lib/apiErrors";
import { getFirebaseErrorMessage } from "../lib/firebaseErrors";

let authListenerStarted = false;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    loading: false,
    error: null,
    authReady: false,
  },
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setAuthReady(state, action) {
      state.authReady = action.payload;
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.authReady = true;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.loading = false;
        state.error = null;
      });
  },
});

const { setToken, setUser, setAuthReady, clearSession } = authSlice.actions;

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  (_, { dispatch }) => {
    if (authListenerStarted) return;
    authListenerStarted = true;

    return new Promise((resolve) => {
      let firstEvent = true;

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            dispatch(setToken(token));
            const profile = await resolveBackendUser(
              sessionPayloadFromFirebaseUser(firebaseUser)
            );
            dispatch(setUser(profile));
          } catch {
            dispatch(setUser(null));
          }
        } else {
          dispatch(clearSession());
        }

        if (firstEvent) {
          firstEvent = false;
          dispatch(setAuthReady(true));
          resolve();
        }
      });
    });
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      dispatch(setToken(token));
      const user = await resolveBackendUser();
      return { token, user };
    } catch (e) {
      if (e?.response) {
        return rejectWithValue(getApiErrorMessage(e));
      }
      return rejectWithValue(getFirebaseErrorMessage(e));
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      dispatch(setToken(token));
      const user = await resolveBackendUser(
        sessionPayloadFromFirebaseUser(cred.user)
      );
      return { token, user };
    } catch (e) {
      if (e?.response) {
        return rejectWithValue(getApiErrorMessage(e));
      }
      return rejectWithValue(getFirebaseErrorMessage(e));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ email, password, full_name }, { rejectWithValue, dispatch }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (full_name?.trim()) {
        await updateProfile(cred.user, { displayName: full_name.trim() });
      }
      const token = await cred.user.getIdToken();
      dispatch(setToken(token));
      const payload = full_name?.trim() ? { full_name: full_name.trim() } : {};
      const user = await authApi.syncSession(payload);
      return { token, user };
    } catch (e) {
      if (e?.response) {
        return rejectWithValue(getApiErrorMessage(e));
      }
      return rejectWithValue(getFirebaseErrorMessage(e));
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await resolveBackendUser();
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, { dispatch }) => {
  await signOut(auth);
  dispatch(clearSession());
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
