import api from "./api";

const streamService = {
  /**
   * Get all streams.
   */
  getStreams: async (params = {}) => {
    const response = await api.get("/streams", {
      params,
    });

    return response.data;
  },

  /**
   * Get live streams.
   */
  getLiveStreams: async (params = {}) => {
    const response = await api.get("/streams/live", {
      params,
    });

    return response.data;
  },

  /**
   * Get one stream by ID.
   */
  getStreamById: async (streamId) => {
    const response = await api.get(
      `/streams/${streamId}`
    );

    return response.data;
  },

  /**
   * Create a new stream.
   */
  createStream: async (streamData) => {
    const response = await api.post(
      "/streams",
      streamData
    );

    return response.data;
  },

  /**
   * Update stream information.
   */
  updateStream: async (streamId, streamData) => {
    const response = await api.put(
      `/streams/${streamId}`,
      streamData
    );

    return response.data;
  },

  /**
   * Delete a stream.
   */
  deleteStream: async (streamId) => {
    const response = await api.delete(
      `/streams/${streamId}`
    );

    return response.data;
  },

  /**
   * Start a stream.
   */
  startStream: async (streamId) => {
    const response = await api.patch(
      `/streams/${streamId}/start`
    );

    return response.data;
  },

  /**
   * Stop a stream.
   */
  stopStream: async (streamId) => {
    const response = await api.patch(
      `/streams/${streamId}/stop`
    );

    return response.data;
  },

  /**
   * Like a stream.
   */
  likeStream: async (streamId) => {
    const response = await api.post(
      `/streams/${streamId}/like`
    );

    return response.data;
  },

  /**
   * Get stream chat messages.
   */
  getMessages: async (streamId) => {
    const response = await api.get(
      `/streams/${streamId}/messages`
    );

    return response.data;
  },

  /**
   * Send a chat message.
   */
  sendMessage: async (streamId, message) => {
    const response = await api.post(
      `/streams/${streamId}/messages`,
      { message }
    );

    return response.data;
  },

  /**
   * Search streams.
   */
  searchStreams: async (query) => {
    const response = await api.get("/streams/search", {
      params: {
        q: query,
      },
    });

    return response.data;
  },

  /**
   * Get list of categories with stream counts.
   */
  getCategories: async () => {
    const response = await api.get("/streams/categories");

    return response.data;
  },

  /**
   * Get current user's streams.
   */
  getUserStreams: async (userId) => {
    const response = await api.get(
      `/users/${userId}/streams`
    );

    return response.data;
  },

  /**
   * Get like status for the current user on a stream.
   */
  getLikeStatus: async (streamId) => {
    const response = await api.get(
      `/streams/${streamId}/like-status`
    );

    return response.data;
  },

  /**
   * Get a stream's private stream key (broadcaster only).
   */
  getStreamKey: async (streamId) => {
    const response = await api.get(
      `/streams/${streamId}/stream-key`
    );

    return response.data;
  },
};

export default streamService;