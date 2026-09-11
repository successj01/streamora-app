import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import api from "../services/api";
import authService from "../services/authService";
import streamService from "../services/streamService";
import userService from "../services/userService";

const AuthContext = createContext(null);

const STORAGE_KEY = "streamora_auth";

// ==========================================
// Reducer
// ==========================================
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // true until initial session restore completes
  error: "",
};

function authReducer(state, action) {
  switch (action.type) {
    case "RESTORE_START":
      return { ...state, loading: true };

    case "RESTORE_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: "",
      };

    case "RESTORE_EMPTY":
      return { ...initialState, loading: false };

    case "AUTH_START":
      return { ...state, loading: true, error: "" };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: "",
      };

    case "AUTH_FAILURE":
      return { ...state, loading: false, error: action.payload };

    case "USER_UPDATED":
      return { ...state, user: action.payload, loading: false };

    case "LOGOUT":
      return { ...initialState, loading: false };

    case "CLEAR_ERROR":
      return { ...state, error: "" };

    default:
      return state;
  }
}

// ==========================================
// Storage helpers
// ==========================================
function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeStoredAuth(user, token) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

function extractErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

// ==========================================
// Provider
// ==========================================
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ------------------------------------------
  // Restore session on mount
  // ------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const stored = readStoredAuth();

      if (!stored?.token) {
        dispatch({ type: "RESTORE_EMPTY" });
        return;
      }

      dispatch({ type: "RESTORE_START" });

      try {
        const response = await authService.getCurrentUser();
        const data = response?.data || response;
        const user = data?.user || stored.user || null;

        if (!cancelled) {
          dispatch({
            type: "RESTORE_SUCCESS",
            payload: { user, token: stored.token },
          });
        }
      } catch (err) {
        // Server unreachable or token invalid — fall back to
        // the cached user if we have one, otherwise log out.
        if (cancelled) return;

        if (stored.user) {
          dispatch({
            type: "RESTORE_SUCCESS",
            payload: { user: stored.user, token: stored.token },
          });
        } else {
          clearStoredAuth();
          dispatch({ type: "RESTORE_EMPTY" });
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------
  // Auto-logout on 401 from any API call
  // ------------------------------------------
  const logout = useCallback(() => {
    clearStoredAuth();

    if (api?.defaults?.headers?.common) {
      delete api.defaults.headers.common.Authorization;
    }

    dispatch({ type: "LOGOUT" });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();

    window.addEventListener(
      "streamora:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "streamora:unauthorized",
        handleUnauthorized
      );
    };
  }, [logout]);

  // ------------------------------------------
  // Login
  // ------------------------------------------
  const login = useCallback(async (credentials) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authService.login(credentials);
      const data = response?.data || response;
      const user = data?.user || null;
      const token = data?.token || data?.accessToken;

      if (!token) {
        throw new Error(
          "Authentication token was not returned by the server."
        );
      }

      writeStoredAuth(user, token);
      dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });

      return { user, token };
    } catch (err) {
      const message = extractErrorMessage(err, "Unable to sign in.");
      dispatch({ type: "AUTH_FAILURE", payload: message });
      throw err;
    }
  }, []);

  // ------------------------------------------
  // Social login (Google / phone via Firebase)
  // ------------------------------------------
  const socialLogin = useCallback(async (idToken) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authService.firebaseLogin(idToken);
      const data = response?.data || response;
      const user = data?.user || null;
      const token = data?.token || data?.accessToken;

      if (!token) {
        throw new Error(
          "Authentication token was not returned by the server."
        );
      }

      writeStoredAuth(user, token);
      dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });

      return { user, token };
    } catch (err) {
      const message = extractErrorMessage(
        err,
        "Unable to sign in with that method."
      );
      dispatch({ type: "AUTH_FAILURE", payload: message });
      throw err;
    }
  }, []);

  // ------------------------------------------
  // Register
  // ------------------------------------------
  const register = useCallback(async (userData) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authService.register(userData);
      const data = response?.data || response;
      const user = data?.user || null;
      const token = data?.token || data?.accessToken;

      if (token) {
        writeStoredAuth(user, token);
        dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });
      } else {
        // Some flows require email verification before a token is issued.
        dispatch({ type: "RESTORE_EMPTY" });
      }

      return data;
    } catch (err) {
      const message = extractErrorMessage(
        err,
        "Unable to create your account."
      );
      dispatch({ type: "AUTH_FAILURE", payload: message });
      throw err;
    }
  }, []);

  // ------------------------------------------
  // Update profile
  // ------------------------------------------
  const updateUser = useCallback(async (updates) => {
    try {
      const response = await userService.updateProfile(updates);
      const data = response?.data || response;
      const updatedUser = data?.user || data;

      dispatch({ type: "USER_UPDATED", payload: updatedUser });

      const stored = readStoredAuth();
      if (stored) {
        writeStoredAuth(updatedUser, stored.token);
      }

      return updatedUser;
    } catch (err) {
      const message = extractErrorMessage(
        err,
        "Unable to update your profile."
      );
      dispatch({ type: "AUTH_FAILURE", payload: message });
      throw err;
    }
  }, []);

  // ------------------------------------------
  // Refresh user
  // ------------------------------------------
  const refreshUser = useCallback(async () => {
    try {
      const response = await userService.getProfile();
      const data = response?.data || response;
      const user = data?.user || data;

      dispatch({ type: "USER_UPDATED", payload: user });
      return user;
    } catch (err) {
      const message = extractErrorMessage(
        err,
        "Unable to refresh your profile."
      );
      dispatch({ type: "AUTH_FAILURE", payload: message });
      throw err;
    }
  }, []);

  // ------------------------------------------
  // User's streams
  // ------------------------------------------
  const getUserStreams = useCallback(async () => {
    try {
      return await streamService.getStreams();
    } catch (err) {
      const message = extractErrorMessage(
        err,
        "Unable to load streams."
      );
      dispatch({ type: "AUTH_FAILURE", payload: message });
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // ------------------------------------------
  // Context value
  // ------------------------------------------
  const value = useMemo(
    () => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      error: state.error,

      login,
      register,
      socialLogin,
      logout,
      updateUser,
      refreshUser,
      getUserStreams,
      clearError,
    }),
    [
      state.user,
      state.token,
      state.isAuthenticated,
      state.loading,
      state.error,
      login,
      register,
      socialLogin,
      logout,
      updateUser,
      refreshUser,
      getUserStreams,
      clearError,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

// ==========================================
// Hook
// ==========================================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
};

export default AuthContext;