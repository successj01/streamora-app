import api from "./api";

const authService = {
  /**
   * Register a new Streamora user.
   */
  register: async (userData) => {
    const response = await api.post(
      "/auth/register",
      userData
    );

    return response.data;
  },

  /**
   * Login an existing user.
   */
  login: async (credentials) => {
    const response = await api.post(
      "/auth/login",
      credentials
    );

    return response.data;
  },

  /**
   * Exchange a verified Firebase ID token (Google or Phone) for a
   * Streamora session.
   */
  firebaseLogin: async (idToken) => {
    const response = await api.post("/auth/firebase", {
      idToken,
    });

    return response.data;
  },

  /**
   * Get the currently authenticated user.
   */
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");

    return response.data;
  },

  /**
   * Request password reset email.
   */
  forgotPassword: async (email) => {
    const response = await api.post(
      "/auth/forgot-password",
      { email }
    );

    return response.data;
  },

  /**
   * Reset password.
   */
  resetPassword: async (token, password) => {
    const response = await api.post(
      `/auth/reset-password/${token}`,
      { password }
    );

    return response.data;
  },

  /**
   * Verify email address.
   */
  verifyEmail: async (token) => {
    const response = await api.get(
      `/auth/verify-email/${token}`
    );

    return response.data;
  },

  /**
   * Change the authenticated user's password.
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/auth/password", {
      currentPassword,
      newPassword,
    });

    return response.data;
  },
};

export default authService;