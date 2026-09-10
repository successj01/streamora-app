import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize,
  Play,
  Volume2,
  VolumeX,
  Loader2,
  WifiOff,
} from "lucide-react";

/**
 * Stream player that supports both regular media URLs and WebRTC MediaStreams.
 *
 * When a `videoRef` is provided (from useWebRTC) the hook attaches the live
 * MediaStream to it via srcObject. Set `ready` once the stream is attached.
 */
const StreamPlayer = ({
  videoRef: externalRef,
  streamUrl = "",
  poster = "",
  title = "Streamora Live",
  isLive = false,
  connecting = false,
  ready = false,
  offlineMessage = "This stream is currently offline.",
}) => {
  const internalRef = useRef(null);
  const videoRef = externalRef || internalRef;

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(!!streamUrl);
  const [hasMedia, setHasMedia] = useState(!!streamUrl);

  const hasStream = Boolean(streamUrl) || hasMedia;

  const handlePlay = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.play();
      setPlaying(true);
    } catch (error) {
      console.error("Unable to play stream:", error);
    }
  }, [videoRef]);

  const handlePause = useCallback(() => {
    if (!videoRef.current) return;

    videoRef.current.pause();
    setPlaying(false);
  }, [videoRef]);

  const togglePlay = () => {
    if (playing) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setMuted(nextMuted);
  };

  const handleFullscreen = async () => {
    const element = videoRef.current;

    if (!element) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // Wire up media events for both <video src> and srcObject playback.
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleLoaded = () => {
      setLoading(false);
      setHasMedia(true);
    };

    const handlePlaying = () => {
      setLoading(false);
      setHasMedia(true);
      setPlaying(true);
    };

    const handlePauseEvent = () => setPlaying(false);

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePauseEvent);

    return () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePauseEvent);
    };
  }, [videoRef]);

  // Once the WebRTC stream is attached, autoplay it.
  useEffect(() => {
    if (ready && videoRef.current?.srcObject) {
      setHasMedia(true);
      setLoading(false);
      handlePlay();
    }
  }, [ready, videoRef, handlePlay]);

  // Regular URL stream.
  useEffect(() => {
    if (streamUrl) {
      setHasMedia(true);
      setLoading(false);
      handlePlay();
    }
  }, [streamUrl, handlePlay]);

  const isOffline = !isLive && !streamUrl && !connecting;

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
      <video
        ref={videoRef}
        src={streamUrl || undefined}
        poster={poster}
        autoPlay={!!streamUrl}
        playsInline
        muted={muted}
        onClick={togglePlay}
        className="h-full w-full object-contain"
      />

      {!hasStream && isOffline && (
        <div
          className="absolute inset-0 flex h-full w-full items-center justify-center bg-cover bg-center"
          style={poster ? { backgroundImage: `url(${poster})` } : undefined}
        >
          <div className="absolute inset-0 bg-black/70" />

          <div className="relative z-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <WifiOff size={28} className="text-gray-400" />
            </div>

            <p className="mt-4 text-sm font-medium text-white">{title}</p>

            <p className="mt-1 text-xs text-gray-400">{offlineMessage}</p>
          </div>
        </div>
      )}

      {connecting && !ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
          <Loader2 size={32} className="animate-spin text-white" />
          <p className="mt-4 text-sm font-medium text-white">
            Connecting to broadcast...
          </p>
        </div>
      )}

      {loading && hasStream && !ready && !playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      )}

      {isLive && (
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Live
        </div>
      )}

      {hasStream && (
        <div className="absolute bottom-0 left-0 right-0 translate-y-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-4 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause stream" : "Play stream"}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10"
              >
                {playing ? (
                  <span className="text-sm font-bold">Ⅱ</span>
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute stream" : "Mute stream"}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10"
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleFullscreen}
              aria-label="Fullscreen"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamPlayer;