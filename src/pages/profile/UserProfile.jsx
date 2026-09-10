import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Calendar,
  Radio,
  Users,
  Heart,
  Pencil,
  UserPlus,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import Avatar from "../../components/common/Avatar";
import StreamCard from "../../components/stream/StreamCard";

import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import streamService from "../../services/streamService";
import { normalizeStream } from "../../utils/streamData";
import { formatDate } from "../../utils/formatDate";
import { formatNumber } from "../../utils/formatNumber";

const UserProfile = () => {
  const { username } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followBusy, setFollowBusy] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!username) return;

    setLoading(true);

    try {
      const data = await userService.getUserByUsername(username);

      setProfile(data);
      setFollowerCount(Number(data?.subscriberCount) || 0);
      setFollowing(Boolean(data?.isFollowing));

      const streamData = await streamService
        .getUserStreams(data._id)
        .catch(() => null);

      setStreams(
        (Array.isArray(streamData) ? streamData : streamData?.streams || [])
          .map(normalizeStream)
          .filter(Boolean)
      );
    } catch (err) {
      // handled by the `!profile` not-found branch below
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleToggleFollow = async () => {
    if (!profile?._id || followBusy) return;

    setFollowBusy(true);

    try {
      const result = following
        ? await userService.unfollowUser(profile._id)
        : await userService.followUser(profile._id);

      setFollowing(Boolean(result?.following));
      setFollowerCount(Number(result?.subscriberCount) || followerCount);
    } catch {
      // ignore
    } finally {
      setFollowBusy(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f10] text-white">
        <Loader2 size={32} className="animate-spin text-red-500" />
      </main>
    );
  }

  if (user?.username?.toLowerCase() === String(username).toLowerCase()) {
    return <Navigate to="/profile" replace />;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f10] text-white">
        <Loader2 size={32} className="animate-spin text-red-500" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#0f0f10] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-16">
          <div className="rounded-2xl border border-white/10 bg-[#141416] p-12 text-center">
            <AlertCircle size={36} className="mx-auto text-gray-600" />

            <h1 className="mt-4 text-xl font-bold">Profile not found</h1>

            <p className="mt-2 text-sm text-gray-500">
              This user does not exist or is no longer available.
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

  const displayName = profile.name || profile.username;
  const totalLikes = streams.reduce((sum, stream) => sum + (stream.likeCount || 0), 0);
  const isOwnProfile = user?._id === profile._id;
  const joinedDate = profile.createdAt
    ? formatDate(new Date(profile.createdAt).toISOString())
    : "";

  return (
    <main className="min-h-screen bg-[#0f0f10] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/browse"
          className="mb-5 flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to browse
        </Link>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141416]">
          <div
            className="relative h-48 sm:h-64"
            style={
              profile.banner
                ? {
                    backgroundImage: `url(${profile.banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {
                    backgroundImage:
                      "linear-gradient(130deg, rgba(153,27,27,0.4), rgba(28,25,23,0.9) 55%, rgba(9,9,11,0.9))",
                  }
            }
          >
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:pb-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative h-28 w-28 shrink-0">
                  <Avatar
                    src={profile.avatar}
                    alt={displayName}
                    name={displayName}
                    size="xl"
                    className="h-28 w-28 text-3xl ring-4 ring-[#141416]"
                  />
                </div>

                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold">
                    {displayName}
                    {profile.verified && (
                      <span className="text-xs font-semibold text-blue-400">
                        ✓ Verified
                      </span>
                    )}
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">@{profile.username}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-red-700"
                  >
                    <Pencil size={16} />
                    Edit Profile
                  </Link>
                ) : (
                  isAuthenticated && (
                    <button
                      type="button"
                      onClick={handleToggleFollow}
                      disabled={followBusy}
                      className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-red-700 disabled:opacity-50"
                    >
                      {followBusy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <UserPlus size={16} />
                      )}
                      {following ? "Unfollow" : "Follow"}
                    </button>
                  )
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 max-w-2xl">
                <p className="text-sm leading-6 text-gray-400">{profile.bio}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
              {joinedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Joined {joinedDate}
                </span>
              )}

              {profile.isCreator && (
                <span className="flex items-center gap-1.5">
                  <Radio size={14} />
                  Creator
                </span>
              )}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="text-xs text-red-500 underline-offset-2 hover:underline"
                >
                  Sign in to follow
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#141416] p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <Users size={17} />
              <span className="text-xs">Followers</span>
            </div>

            <p className="mt-2 text-2xl font-bold">{formatNumber(followerCount)}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#141416] p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <Radio size={17} />
              <span className="text-xs">Streams</span>
            </div>

            <p className="mt-2 text-2xl font-bold">{formatNumber(streams.length)}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#141416] p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <Heart size={17} />
              <span className="text-xs">Stream likes</span>
            </div>

            <p className="mt-2 text-2xl font-bold">{formatNumber(totalLikes)}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#141416] p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <Users size={17} />
              <span className="text-xs">Following</span>
            </div>

            <p className="mt-2 text-2xl font-bold">
              {formatNumber(profile.followingCount || 0)}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">Streams</h2>

          {streams.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {streams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#141416] p-12 text-center">
              <Radio size={32} className="mx-auto text-gray-700" />

              <p className="mt-3 text-sm text-gray-500">
                No streams yet. Check back soon!
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default UserProfile;