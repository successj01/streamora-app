import { useCallback, useState } from "react";
import streamService from "../services/streamService";

/**
 * Hook for fetching, creating, and managing streams.
 * Wraps streamService with loading / error state management.
 */
export default function useStreams() {
  const [streams, setStreams] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [currentStream, setCurrentStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -------------------------------------------
  // Generic error extractor
  // -------------------------------------------
  const extractError = useCallback((err, fallback) => {
    return (
      err?.response?.data?.message || err?.message || fallback
    );
  }, []);

  // -------------------------------------------
  // Fetch all streams
  // -------------------------------------------
  const fetchStreams = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError("");

      try {
        const response = await streamService.getStreams(params);
        const data = response?.data || response;
        const list = Array.isArray(data) ? data : data?.streams || [];
        setStreams(list);
        return list;
      } catch (err) {
        const message = extractError(err, "Unable to load streams.");
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError]
  );

  // -------------------------------------------
  // Fetch live streams
  // -------------------------------------------
  const fetchLiveStreams = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError("");

      try {
        const response = await streamService.getLiveStreams(params);
        const data = response?.data || response;
        const list = Array.isArray(data) ? data : data?.streams || [];
        setLiveStreams(list);
        return list;
      } catch (err) {
        const message = extractError(err, "Unable to load live streams.");
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError]
  );

  // -------------------------------------------
  // Fetch a single stream by ID
  // -------------------------------------------
  const fetchStreamById = useCallback(
    async (streamId) => {
      setLoading(true);
      setError("");

      try {
        const response = await streamService.getStreamById(streamId);
        const data = response?.data || response;
        const stream = data?.stream || data;
        setCurrentStream(stream);
        return stream;
      } catch (err) {
        const message = extractError(err, "Unable to load stream.");
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError]
  );

  // -------------------------------------------
  // Create a new stream
  // -------------------------------------------
  const createStream = useCallback(
    async (streamData) => {
      setLoading(true);
      setError("");

      try {
        const response = await streamService.createStream(streamData);
        const data = response?.data || response;
        const stream = data?.stream || data;

        setStreams((prev) => [stream, ...prev]);
        setCurrentStream(stream);
        return stream;
      } catch (err) {
        const message = extractError(err, "Unable to create stream.");
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError]
  );

  // -------------------------------------------
  // Update a stream
  // -------------------------------------------
  const updateStream = useCallback(
    async (streamId, streamData) => {
      setLoading(true);
      setError("");

      try {
        const response = await streamService.updateStream(
          streamId,
          streamData
        );
        const data = response?.data || response;
        const updated = data?.stream || data;

        setStreams((prev) =>
          prev.map((s) => (s.id === streamId ? updated : s))
        );

        if (currentStream?.id === streamId) {
          setCurrentStream(updated);
        }

        return updated;
      } catch (err) {
        const message = extractError(err, "Unable to update stream.");
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentStream, extractError]
  );

  // -------------------------------------------
  // Delete a stream
  // -------------------------------------------
  const deleteStream = useCallback(
    async (streamId) => {
      setLoading(true);
      setError("");

      try {
        await streamService.deleteStream(streamId);
        setStreams((prev) => prev.filter((s) => s.id !== streamId));

        if (currentStream?.id === streamId) {
          setCurrentStream(null);
        }
      } catch (err) {
        const message = extractError(err, "Unable to delete stream.");
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentStream, extractError]
  );

  // -------------------------------------------
  // Start / stop stream
  // -------------------------------------------
  const startStream = useCallback(
    async (streamId) => {
      try {
        const response = await streamService.startStream(streamId);
        const data = response?.data || response;
        const updated = data?.stream || data;

        setStreams((prev) =>
          prev.map((s) => (s.id === streamId ? { ...s, isLive: true } : s))
        );

        if (currentStream?.id === streamId) {
          setCurrentStream((prev) => ({ ...prev, isLive: true }));
        }

        return updated;
      } catch (err) {
        const message = extractError(err, "Unable to start stream.");
        setError(message);
        throw err;
      }
    },
    [currentStream, extractError]
  );

  const stopStream = useCallback(
    async (streamId) => {
      try {
        const response = await streamService.stopStream(streamId);
        const data = response?.data || response;
        const updated = data?.stream || data;

        setStreams((prev) =>
          prev.map((s) =>
            s.id === streamId ? { ...s, isLive: false } : s
          )
        );

        if (currentStream?.id === streamId) {
          setCurrentStream((prev) => ({ ...prev, isLive: false }));
        }

        return updated;
      } catch (err) {
        const message = extractError(err, "Unable to stop stream.");
        setError(message);
        throw err;
      }
    },
    [currentStream, extractError]
  );

  // -------------------------------------------
  // Like a stream
  // -------------------------------------------
  const likeStream = useCallback(
    async (streamId) => {
      try {
        const response = await streamService.likeStream(streamId);
        const data = response?.data || response;

        setStreams((prev) =>
          prev.map((s) =>
            s.id === streamId
              ? { ...s, likes: (s.likes || 0) + 1 }
              : s
          )
        );

        if (currentStream?.id === streamId) {
          setCurrentStream((prev) => ({
            ...prev,
            likes: (prev.likes || 0) + 1,
          }));
        }

        return data;
      } catch (err) {
        const message = extractError(err, "Unable to like stream.");
        setError(message);
        throw err;
      }
    },
    [currentStream, extractError]
  );

  // -------------------------------------------
  // Chat messages
  // -------------------------------------------
  const fetchMessages = useCallback(
    async (streamId) => {
      try {
        const response = await streamService.getMessages(streamId);
        const data = response?.data || response;
        return Array.isArray(data) ? data : data?.messages || [];
      } catch (err) {
        const message = extractError(err, "Unable to load messages.");
        setError(message);
        throw err;
      }
    },
    [extractError]
  );

  const sendMessage = useCallback(
    async (streamId, message) => {
      try {
        const response = await streamService.sendMessage(
          streamId,
          message
        );
        const data = response?.data || response;
        return data?.message || data;
      } catch (err) {
        const message = extractError(err, "Unable to send message.");
        setError(message);
        throw err;
      }
    },
    [extractError]
  );

  // -------------------------------------------
  // Search streams
  // -------------------------------------------
  const searchStreams = useCallback(
    async (query) => {
      setLoading(true);
      setError("");

      try {
        const response = await streamService.searchStreams(query);
        const data = response?.data || response;
        const list = Array.isArray(data) ? data : data?.streams || [];
        setStreams(list);
        return list;
      } catch (err) {
        const message = extractError(err, "Unable to search streams.");
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError]
  );

  // -------------------------------------------
  // Clear error
  // -------------------------------------------
  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    streams,
    liveStreams,
    currentStream,
    loading,
    error,

    fetchStreams,
    fetchLiveStreams,
    fetchStreamById,
    createStream,
    updateStream,
    deleteStream,
    startStream,
    stopStream,
    likeStream,

    fetchMessages,
    sendMessage,

    searchStreams,

    setCurrentStream,
    clearError,
  };
}
