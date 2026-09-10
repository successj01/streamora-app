import { useCallback, useEffect, useRef, useState } from "react";
import useSocket from "./useSocket";

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * WebRTC hook with two modes:
 *
 *  - role="broadcaster": captures local media, opens a peer connection per
 *    viewer (peer-to-peer fan-out via the socket.io signaling server).
 *  - role="viewer": discovers the broadcaster, answers the offer, plays the
 *    remote stream in an attached <video> element.
 *
 * Usage:
 *   const { localStream, remoteStream, videoRef, startBroadcast, stopBroadcast,
 *           isLive, error } = useWebRTC({ streamId, role });
 *
 *   <video ref={videoRef} autoPlay playsInline muted={role !== 'viewer'} />
 */
export default function useWebRTC({ streamId, role = "viewer" }) {
  const socket = useSocket(streamId, role);
  const peersRef = useRef(new Map());
  const streamRef = useRef(null);

  const connected = socket.connected;
  const [isLive, setIsLive] = useState(role === "broadcaster" ? false : null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);
  const [error, setError] = useState("");
  const [broadcasterOnline, setBroadcasterOnline] = useState(false);

  const videoRef = useRef(null);

  // Attach remote stream to the video element.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (remoteStreamReady && video.srcObject === null) {
      video.srcObject = null;
    }
  }, [remoteStreamReady]);

  const ensurePeer = useCallback(
    (peerId) => {
      let peer = peersRef.current.get(peerId);
      if (peer) return peer;

      peer = new RTCPeerConnection(RTC_CONFIG);
      peersRef.current.set(peerId, peer);

      if (streamRef.current && role === "broadcaster") {
        streamRef.current.getTracks().forEach((track) => {
          peer.addTrack(track, streamRef.current);
        });
      }

      peer.onicecandidate = (event) => {
        if (event.candidate && connected) {
          socket.emit("rtc:ice", { to: peerId, candidate: event.candidate.toJSON() });
        }
      };

      if (role === "viewer") {
        peer.ontrack = (event) => {
          const streams = event.streams || [event.stream];
          const media = streams[0];
          if (media && videoRef.current) {
            videoRef.current.srcObject = media;
            setRemoteStreamReady(true);
          }
        };
      }

      return peer;
    },
    [connected, role, socket]
  );

  // Viewer: discover broadcaster and answer the offer.
  useEffect(() => {
    if (role !== "viewer" || !socket.connected || !streamId) return;

    const cancelDiscovery = () => socket.emit("broadcaster:discover", streamId);

    const unsubscribeFound = socket.on("broadcaster:found", ({ broadcasterSocketId }) => {
      setBroadcasterOnline(true);
      socket.emit("rtc:viewer-join", { to: broadcasterSocketId });
    });

    const unsubscribeOffer = socket.on("rtc:offer", async ({ from, sdp }) => {
      try {
        const peer = ensurePeer(from);
        await peer.setRemoteDescription(sdp);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("rtc:answer", { to: from, sdp: peer.localDescription });
      } catch (err) {
        setError("Unable to connect to the broadcast.");
      }
    });

    const unsubscribeIce = socket.on("rtc:ice", ({ from, candidate }) => {
      const peer = peersRef.current.get(from);
      if (peer && candidate) {
        try {
          peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          /* ignore invalid candidate */
        }
      }
    });

    const unsubscribeEnded = socket.on("stream:ended", () => {
      setBroadcasterOnline(false);
      setRemoteStreamReady(false);
      if (videoRef.current) videoRef.current.srcObject = null;
    });

    cancelDiscovery();

    return () => {
      unsubscribeFound();
      unsubscribeOffer();
      unsubscribeIce();
      unsubscribeEnded();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, socket.connected, streamId]);

  // Broadcaster: handle viewer joins, create offers.
  useEffect(() => {
    if (role !== "broadcaster" || !socket.connected || !streamId) return;

    const unsubscribeJoin = socket.on("rtc:viewer-join", async ({ from }) => {
      try {
        const peer = ensurePeer(from);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("rtc:offer", { to: from, sdp: peer.localDescription });
      } catch (err) {
        setError("Unable to start the broadcast connection.");
      }
    });

    const unsubscribeAnswer = socket.on("rtc:answer", async ({ from, sdp }) => {
      const peer = peersRef.current.get(from);
      if (peer && sdp) {
        try {
          await peer.setRemoteDescription(sdp);
        } catch {
          /* ignore */
        }
      }
    });

    const unsubscribeIce = socket.on("rtc:ice", ({ from, candidate }) => {
      const peer = peersRef.current.get(from);
      if (peer && candidate) {
        try {
          peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          /* ignore */
        }
      }
    });

    return () => {
      unsubscribeJoin();
      unsubscribeAnswer();
      unsubscribeIce();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, socket.connected, streamId]);

  const startBroadcast = useCallback(
    async ({ audio = true, video = true }) => {
      if (role !== "broadcaster") return;

      setError("");
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          audio,
          video: video
            ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
            : false,
        });

        streamRef.current = media;
        setLocalStream(media);
        socket.emit("broadcaster:start", { streamId });
        setIsLive(true);
        return media;
      } catch (err) {
        const message =
          err?.name === "NotAllowedError"
            ? "Camera or microphone access was denied. Allow access and try again."
            : err?.name === "NotFoundError"
            ? "No camera or microphone was found on this device."
            : "Unable to access camera or microphone.";
        setError(message);
        throw err;
      }
    },
    [role, socket, streamId]
  );

  const stopBroadcast = useCallback(() => {
    if (role !== "broadcaster") return;

    peersRef.current.forEach((peer) => {
      try {
        peer.close();
      } catch {
        /* ignore */
      }
    });
    peersRef.current.clear();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setLocalStream(null);
    setIsLive(false);
    socket.emit("broadcaster:stop", { streamId });
  }, [role, socket, streamId]);

  // Cleanup everything on unmount.
  useEffect(() => {
    const peerMap = peersRef.current;
    const mediaRef = streamRef;

    return () => {
      peerMap.forEach((peer) => {
        try {
          peer.close();
        } catch {
          /* ignore */
        }
      });
      peerMap.clear();

      if (mediaRef.current) {
        mediaRef.current.getTracks().forEach((track) => track.stop());
        mediaRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    localStream,
    isLive,
    connected: socket.connected,
    remoteStreamReady,
    broadcasterOnline,
    error,
    startBroadcast,
    stopBroadcast,
    sendChatMessage: socket.sendChatMessage,
    on: socket.on,
    emit: socket.emit,
    socket: socket.socket,
  };
}