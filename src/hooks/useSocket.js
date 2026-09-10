import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../utils/constants";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE_URL.replace(/\/api$/, "");

function readToken() {
  try {
    const raw = localStorage.getItem("streamora_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

/**
 * Hook that manages a socket.io connection for real-time features:
 * live chat (chat:message), viewer counts (viewer:update), system events,
 * and WebRTC signaling (rtc:* / broadcaster:*).
 *
 * @param {string|null} streamId - the stream's room to join
 * @param {"viewer"|"broadcaster"} [role] - socket role in the room
 */
export default function useSocket(streamId, role = "viewer") {
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());
  const streamIdRef = useRef(streamId);
  const roleRef = useRef(role);

  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  streamIdRef.current = streamId;
  roleRef.current = role;

  // Register an event listener. Returns an unsubscribe function.
  const on = useCallback((eventType, callback) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType).add(callback);

    return () => {
      const set = listenersRef.current.get(eventType);
      if (set) {
        set.delete(callback);
        if (set.size === 0) listenersRef.current.delete(eventType);
      }
    };
  }, []);

  const dispatch = useCallback((eventType, payload) => {
    const set = listenersRef.current.get(eventType);
    if (set) set.forEach((cb) => cb(payload));
  }, []);

  // Emit an event to the server.
  const emit = useCallback((eventType, payload) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      console.warn("Socket is not connected.");
      return false;
    }
    socket.emit(eventType, payload);
    return true;
  }, []);

  useEffect(() => {
    if (!streamId) return;

    const token = readToken();
    const socket = io(SOCKET_URL, {
      auth: { token },
      query: { streamId, role },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("stream:join", { streamId, role });
      dispatch("connect", { socket });
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      dispatch("disconnect", { reason });
    });

    const passthrough = (event) => (payload) => {
      setLastEvent({ type: event, payload });
      dispatch(event, payload);
    };

    const events = [
      "chat:message",
      "viewer:update",
      "system",
      "stream:ended",
      "broadcaster:status",
      "broadcaster:found",
      "broadcaster:not-found",
      "rtc:offer",
      "rtc:answer",
      "rtc:ice",
      "rtc:viewer-join",
    ];

    events.forEach((event) => socket.on(event, passthrough(event)));

    return () => {
      events.forEach((event) => socket.off(event));
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamId]);

  return {
    socket: socketRef.current,
    connected,
    lastEvent,
    on,
    emit,
    sendChatMessage: (message) => emit("chat:message", { message }),
  };
}