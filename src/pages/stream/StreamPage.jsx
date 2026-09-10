import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  LogIn,
} from "lucide-react";

import StreamPlayer from "../../components/stream/StreamPlayer";
import StreamControls from "../../components/stream/StreamControls";
import StreamInfo from "../../components/stream/StreamInfo";
import StreamChat from "../../components/stream/StreamChat";
import { useStream } from "../../context/StreamContext";
import { useAuth } from "../../context/AuthContext";
import useWebRTC from "../../hooks/useWebRTC";
import streamService from "../../services/streamService";
import userService from "../../services/userService";

const StreamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const {
    currentStream,
    messages,
    viewerCount,
    streamLoading,
    openStream,
    closeStream,
    sendChatMessage,
    toggleLike,
  } = useStream();

  const [liked, setLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [followCount, setFollowCount] = useState(0);

  const isLive = Boolean(currentStream?.live);
  const streamStatus = currentStream?.status || "";

  const { videoRef, remoteStreamReady, connected, error: rtcError } = useWebRTC({
    streamId: id,
    role: "viewer",
  });

  const creatorId = currentStream?.user?._id;

  useEffect(() => {
    if (!id) return;

    openStream(id).catch(() => {});
    setLiked(false);
    setSaved(false);

    return () => {
      closeStream();
    };
  }, [id, openStream, closeStream]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    streamService
      .getLikeStatus(id)
      .then((result) => {
        if (cancelled) return;
        setLiked(Boolean(result?.liked));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!id || !creatorId) return;

    let cancelled = false;

    userService
      .getUserStatus(creatorId)
      .then((result) => {
        if (cancelled) return;
        setFollowing(Boolean(result?.following));
        setFollowCount(Number(result?.subscriberCount) || 0);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, creatorId]);

  const handleToggleLike = useCallback(async () => {
    if (likeBusy) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setLikeBusy(true);

    const previous = liked;
    setLiked(!previous);

    try {
      const result = await toggleLike();
      setLiked(Boolean(result?.liked));
    } catch {
      setLiked(previous);
    } finally {
      setLikeBusy(false);
    }
  }, [likeBusy, isAuthenticated, liked, toggleLike, navigate]);

  const handleToggleFollow = useCallback(async () => {
    if (followBusy || !creatorId) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?._id === creatorId) return;

    setFollowBusy(true);

    const previous = following;

    try {
      const method = following
        ? userService.unfollowUser
        : userService.followUser;

      const result = await method(creatorId);

      setFollowing(Boolean(result?.following));
      setFollowCount(Number(result?.subscriberCount) || followCount);
    } catch {
      setFollowing(previous);
    } finally {
      setFollowBusy(false);
    }
  }, [
    followBusy,
    creatorId,
    isAuthenticated,
    user,
    following,
    followCount,
    navigate,
  ]);

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: currentStream?.title || "Streamora Live",
          text: "Watch this stream on Streamora",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Stream link copied to clipboard.");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleMore = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const playerTitle = currentStream?.title || "Streamora Live";
  const poster = currentStream?.thumbnail || "";

  const offlineMessage = useMemo(() => {
    if (streamStatus === "scheduled") {
      return "This stream is scheduled. Check the creator's profile for updates.";
    }

    return "This stream has ended. Check the creator's profile for the next stream.";
  }, [streamStatus]);

  const connecting =
    isLive && connected && !remoteStreamReady;

  const loadingPage = streamLoading && !currentStream;

  if (loadingPage) {
    return (
      <main className="min-h-screen bg-[#0f0f10] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-red-500" />
        </div>
      </main>
    );
  }

  if (!currentStream) {
    return (
      <main className="min-h-screen bg-[#0f0f10] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-16">
          <div className="rounded-2xl border border-white/10 bg-[#141416] p-12 text-center">
            <AlertCircle size={36} className="mx-auto text-gray-600" />

            <h1 className="mt-4 text-xl font-bold">Stream unavailable</h1>

            <p className="mt-2 text-sm text-gray-500">
              This stream could not be found or is no longer available.
            </p>

            <Link
              to="/browse"
              className="mt-6 inline-flex rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-700"
            >
              Browse streams
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f10] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0">
            <StreamPlayer
              videoRef={videoRef}
              title={playerTitle}
              poster={poster}
              isLive={isLive}
              connecting={connecting}
              ready={remoteStreamReady}
              offlineMessage={offlineMessage}
            />

            {rtcError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                <AlertCircle size={15} className="shrink-0" />
                {rtcError}
              </div>
            )}

            <StreamControls
              liked={liked}
              saved={saved}
              likeCount={currentStream.likeCount || 0}
              onLike={handleToggleLike}
              onSave={() => setSaved((previous) => !previous)}
              onShare={handleShare}
              onMore={handleMore}
            />

            <StreamInfo
              stream={currentStream}
              viewerCount={viewerCount || currentStream.viewerCount || 0}
              isLive={isLive}
              following={following}
              followerCount={followCount}
              onToggleFollow={handleToggleFollow}
              followDisabled={!creatorId || !isAuthenticated}
            />
          </section>

          <section className="min-w-0">
            <StreamChat
              messages={messages}
              currentUser={isAuthenticated ? user : null}
              viewerCount={viewerCount || currentStream.viewerCount || 0}
              onSendMessage={sendChatMessage}
            />

            {!isAuthenticated && (
              <Link
                to="/login"
                className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#141416] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.05]"
              >
                <LogIn size={15} />
                Sign in to chat
              </Link>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default StreamPage;