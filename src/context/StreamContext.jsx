import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import streamService from "../services/streamService";
import { normalizeStream, normalizeMessage } from "../utils/streamData";
import useSocket from "../hooks/useSocket";

const StreamContext = createContext(null);

const extractError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

/**
 * Global store for stream listing, the active viewing session (real-time
 * chat + viewer counts via socket.io), and stream management actions.
 */
const StreamProvider = ({ children }) => {
  const [streams, setStreams] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentStream, setCurrentStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [error, setError] = useState("");

  const activeStreamIdRef = useRef(null);

  const socket = useSocket(activeStreamIdRef.current, "viewer");

  // Load all streams (browse/discover).
  const loadStreams = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await streamService.getStreams(params);
      const list = Array.isArray(data) ? data : data?.streams || [];
      setStreams(list.map(normalizeStream).filter(Boolean));
      return list;
    } catch (err) {
      setError(extractError(err, "Unable to load streams."));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load only live streams (the Live page).
  const loadLiveStreams = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await streamService.getLiveStreams(params);
      const list = Array.isArray(data) ? data : data?.streams || [];
      setLiveStreams(list.map(normalizeStream).filter(Boolean));
      return list;
    } catch (err) {
      setError(extractError(err, "Unable to load live streams."));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load category overview with counts.
  const loadCategories = useCallback(async () => {
    try {
      const data = await streamService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const message = extractError(err, "Unable to load categories.");
      setError(message);
      throw err;
    }
  }, []);

  // Open a stream: fetch it + its chat history, join the socket room.
  const openStream = useCallback(
    async (streamId) => {
      if (!streamId) return null;
      activeStreamIdRef.current = streamId;
      setStreamLoading(true);
      setMessages([]);
      setError("");
      try {
        const stream = await streamService.getStreamById(streamId);
        const normalized = normalizeStream(stream);

        try {
          const history = await streamService.getMessages(streamId);
          const list = (Array.isArray(history) ? history : history?.messages || [])
            .map(normalizeMessage)
            .filter(Boolean);
          setMessages(list);
        } catch {
          /* history is best effort */
        }

        setCurrentStream(normalized);
        return normalized;
      } catch (err) {
        const message = extractError(err, "Unable to load stream.");
        setError(message);
        throw err;
      } finally {
        setStreamLoading(false);
      }
    },
    []
  );

  // Close the active session.
  const closeStream = useCallback(() => {
    activeStreamIdRef.current = null;
    setCurrentStream(null);
    setMessages([]);
    setViewerCount(0);
  }, []);

  // Send a chat message (optimistic + socket broadcast).
  const sendChatMessage = useCallback(
    async (message) => {
      const streamId = activeStreamIdRef.current;
      if (!streamId) return;

      const text = String(message || "").trim();
      if (!text) return;

      socket.emit("chat:message", { message: text });

      try {
        await streamService.sendMessage(streamId, text);
      } catch {
        /* the socket already delivered it; persistence is best effort */
      }
    },
    [socket]
  );

  // Toggle like on the active stream.
  const toggleLike = useCallback(async () => {
    const streamId = activeStreamIdRef.current;
    if (!streamId) return null;

    try {
      const result = await streamService.likeStream(streamId);
      setCurrentStream((prev) =>
        prev ? { ...prev, likeCount: result.likeCount, likes: result.likeCount } : prev
      );
      return result;
    } catch (err) {
      setError(extractError(err, "Unable to like stream."));
      throw err;
    }
  }, []);

  // Real-time: chat + viewer count via socket events.
  useEffect(() => {
    const unsubMessage = socket.on("chat:message", (payload) => {
      if (activeStreamIdRef.current && payload?.streamId !== undefined) return;
      const normalized = normalizeMessage(payload);
      if (normalized) setMessages((prev) => [...prev, normalized]);
    });

    const unsubSystem = socket.on("system", (payload) => {
      const normalized = normalizeMessage(payload);
      if (normalized) setMessages((prev) => [...prev, normalized]);
    });

    const unsubViewer = socket.on("viewer:update", (count) => {
      setViewerCount(Number(count) || 0);
    });

    const unsubEnded = socket.on("stream:ended", () => {
      setCurrentStream((prev) => (prev ? { ...prev, live: false, status: "ended" } : prev));
    });

    return () => {
      unsubMessage();
      unsubSystem();
      unsubViewer();
      unsubEnded();
    };
  }, [socket]);

  const value = useMemo(
    () => ({
      streams,
      liveStreams,
      categories,
      currentStream,
      messages,
      viewerCount,
      loading,
      streamLoading,
      error,
      loadStreams,
      loadLiveStreams,
      loadCategories,
      openStream,
      closeStream,
      sendChatMessage,
      toggleLike,
      setError,
      setCurrentStream,
    }),
    [
      streams,
      liveStreams,
      categories,
      currentStream,
      messages,
      viewerCount,
      loading,
      streamLoading,
      error,
      loadStreams,
      loadLiveStreams,
      loadCategories,
      openStream,
      closeStream,
      sendChatMessage,
      toggleLike,
    ]
  );

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};

export const useStream = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error("useStream must be used inside a StreamProvider.");
  }
  return context;
};

export { StreamProvider };
export default StreamContext;