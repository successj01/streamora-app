import { useState, useCallback } from "react";
import { useAuth as useAuthContext } from "../context/AuthContext";
import authService from "../services/authService";
import userService from "../services/userService";

/**
 * Convenience hook that wraps the AuthContext with
 * additional helpers for common auth workflows.
 */
export default function useAuth() {
  const ctx = useAuthContext();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  // -------------------------------------------
  // Forgot password wrapper
  // -------------------------------------------
  const forgotPassword = useCallback(async (email) => {
    setLocalLoading(true);
    setLocalError("");

    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to send reset email.";
      setLocalError(message);
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // -------------------------------------------
  // Reset password wrapper
  // -------------------------------------------
  const resetPassword = useCallback(async (token, password) => {
    setLocalLoading(true);
    setLocalError("");

    try {
      const response = await authService.resetPassword(
        token,
        password
      );
      return response;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to reset password.";
      setLocalError(message);
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // -------------------------------------------
  // Upload avatar
  // -------------------------------------------
  const uploadAvatar = useCallback(async (file) => {
    setLocalLoading(true);
    setLocalError("");

    try {
      const response = await userService.uploadAvatar(file);
      const data = response?.data || response;
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to upload avatar.";
      setLocalError(message);
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // -------------------------------------------
  // Upload banner
  // -------------------------------------------
  const uploadBanner = useCallback(async (file) => {
    setLocalLoading(true);
    setLocalError("");

    try {
      const response = await userService.uploadBanner(file);
      const data = response?.data || response;
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to upload banner.";
      setLocalError(message);
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // -------------------------------------------
  // Follow / unfollow
  // -------------------------------------------
  const followUser = useCallback(async (userId) => {
    try {
      return await userService.followUser(userId);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to follow user.";
      setLocalError(message);
      throw err;
    }
  }, []);

  const unfollowUser = useCallback(async (userId) => {
    try {
      return await userService.unfollowUser(userId);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to unfollow user.";
      setLocalError(message);
      throw err;
    }
  }, []);

  // -------------------------------------------
  // Clear local error
  // -------------------------------------------
  const clearLocalError = useCallback(() => {
    setLocalError("");
  }, []);

  return {
    // From context
    user: ctx.user,
    token: ctx.token,
    isAuthenticated: ctx.isAuthenticated,
    loading: ctx.loading || localLoading,
    error: ctx.error || localError,

    // From context
    login: ctx.login,
    register: ctx.register,
    logout: ctx.logout,
    updateUser: ctx.updateUser,
    refreshUser: ctx.refreshUser,
    clearError: ctx.clearError,

    // Local helpers
    forgotPassword,
    resetPassword,
    uploadAvatar,
    uploadBanner,
    followUser,
    unfollowUser,
    clearLocalError,
  };
}
