import api from "./api";

const userService = {
  /**
   * Get current user's profile.
   */
  getProfile: async () => {
    const response = await api.get("/users/profile");

    return response.data;
  },

  /**
   * Get user by ID.
   */
  getUserById: async (userId) => {
    const response = await api.get(
      `/users/${userId}`
    );

    return response.data;
  },

  /**
   * Get user by username.
   */
  getUserByUsername: async (username) => {
    const normalized = String(username).trim().toLowerCase().replace(/^@/, "");
    const response = await api.get(`/users/@${normalized}`);

    return response.data;
  },

  /**
   * Update profile.
   */
  updateProfile: async (profileData) => {
    const response = await api.put(
      "/users/profile",
      profileData
    );

    return response.data;
  },

  /**
   * Upload profile avatar.
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();

    formData.append("avatar", file);

    const response = await api.put("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Upload profile banner.
   */
  uploadBanner: async (file) => {
    const formData = new FormData();

    formData.append("banner", file);

    const response = await api.put("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Update profile including optional avatar and banner files.
   */
  updateProfileWithFiles: async (profileData, files = {}) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(profileData)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }

    if (files.avatar) formData.append("avatar", files.avatar);
    if (files.banner) formData.append("banner", files.banner);

    const response = await api.put("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Follow a user.
   */
  followUser: async (userId) => {
    const response = await api.post(
      `/users/${userId}/follow`
    );

    return response.data;
  },

  /**
   * Unfollow a user.
   */
  unfollowUser: async (userId) => {
    const response = await api.delete(
      `/users/${userId}/follow`
    );

    return response.data;
  },

  /**
   * Get follow status for a user (optional auth).
   */
  getUserStatus: async (userId) => {
    const response = await api.get(
      `/users/${userId}/status`
    );

    return response.data;
  },

  /**
   * Get followers.
   */
  getFollowers: async (userId) => {
    const response = await api.get(
      `/users/${userId}/followers`
    );

    return response.data;
  },

  /**
   * Get following.
   */
  getFollowing: async (userId) => {
    const response = await api.get(
      `/users/${userId}/following`
    );

    return response.data;
  },

  /**
   * Search users.
   */
  searchUsers: async (query) => {
    const response = await api.get("/users/search", {
      params: {
        q: query,
      },
    });

    return response.data;
  },
};

export default userService;