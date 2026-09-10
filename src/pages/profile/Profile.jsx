import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Settings,
  Edit3,
  Camera,
  Mail,
  Calendar,
  Heart,
  Radio,
  Users,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Avatar from "../../components/common/Avatar";
import StreamCard from "../../components/stream/StreamCard";

import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import streamService from "../../services/streamService";
import { normalizeStream } from "../../utils/streamData";
import { formatDate } from "../../utils/formatDate";
import { formatNumber } from "../../utils/formatNumber";

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();

  const [streams, setStreams] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!user?._id) return;

    setLoading(true);
    setError("");

    try {
      const [streamData, statusData, followingData] = await Promise.all([
        streamService.getUserStreams(user._id).catch(() => null),
        userService.getUserStatus(user._id).catch(() => null),
        userService.getFollowing(user._id).catch(() => null),
      ]);

      setStreams(
        (Array.isArray(streamData) ? streamData : streamData?.streams || [])
          .map(normalizeStream)
          .filter(Boolean)
      );

      setFollowerCount(Number(statusData?.subscriberCount) || 0);
      setFollowingCount(Array.isArray(followingData) ? followingData.length : 0);
    } catch {
      setError("Unable to load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (isAuthenticated) loadProfile();
  }, [isAuthenticated, loadProfile]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditBio(user.bio || "");
    }
  }, [user, showModal]);

  const totalLikes = useMemo(
    () => streams.reduce((sum, stream) => sum + (stream.likeCount || 0), 0),
    [streams]
  );

  const openEditor = () => {
    setEditError("");
    setAvatarFile(null);
    setBannerFile(null);
    setEditName(user?.name || "");
    setEditBio(user?.bio || "");
    setShowModal(true);
  };

  const handleFile = (event, setter) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setEditError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEditError("Images must be smaller than 5MB.");
      return;
    }
    setter(file);
    setEditError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setEditError("");

    try {
      const data = await userService.updateProfileWithFiles(
        {
          name: editName,
          bio: editBio,
        },
        { avatar: avatarFile, banner: bannerFile }
      );

      const updated = data?.user || data;
      if (updated) await updateUser(updated);

      setShowModal(false);
      setNotice("Profile updated.");
      loadProfile();
    } catch (err) {
      setEditError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f10] text-white">
        <Loader2 size={32} className="animate-spin text-red-500" />
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const displayName = user.name || user.username;
  const joinedDate = user.createdAt
    ? formatDate(new Date(user.createdAt).toISOString())
    : "";

  return (
    <main className="min-h-screen bg-[#0f0f10] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {(error || notice) && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-500/20 bg-red-500/5 text-red-400"
                : "border-green-500/20 bg-green-500/5 text-green-400"
            }`}
          >
            {error ? (
              <AlertCircle size={18} className="shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0" />
            )}

            <p className="flex-1">{error || notice}</p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setNotice("");
              }}
              className="shrink-0 hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141416]">
          <div
            className="relative h-48 sm:h-64"
            style={
              user.banner
                ? {
                    backgroundImage: `url(${user.banner})`,
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

            <button
              type="button"
              onClick={openEditor}
              className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-black/80"
            >
              <Camera size={16} />
              Change cover
            </button>
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:pb-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative h-28 w-28 shrink-0">
                  <Avatar
                    src={user.avatar}
                    alt={displayName}
                    name={displayName}
                    size="xl"
                    className="h-28 w-28 text-3xl ring-4 ring-[#141416]"
                  />
                </div>

                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold">
                    {displayName}
                    {user.verified && (
                      <span className="text-xs font-semibold text-blue-400">
                        ✓ Verified
                      </span>
                    )}
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/settings"
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Settings size={16} />
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={openEditor}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-red-700"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
            </div>

            {user.bio && (
              <div className="mt-6 max-w-2xl">
                <p className="text-sm leading-6 text-gray-400">{user.bio}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                {user.email}
              </span>

              {joinedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Joined {joinedDate}
                </span>
              )}

              {user.isCreator && (
                <span className="flex items-center gap-1.5">
                  <Radio size={14} />
                  Creator
                </span>
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

            <p className="mt-2 text-2xl font-bold">
              {formatNumber(followerCount)}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#141416] p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <Users size={17} />
              <span className="text-xs">Following</span>
            </div>

            <p className="mt-2 text-2xl font-bold">
              {formatNumber(followingCount)}
            </p>
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
              <Radio size={17} />
              <span className="text-xs">Streams</span>
            </div>

            <p className="mt-2 text-2xl font-bold">{formatNumber(streams.length)}</p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Recent Streams</h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest streaming activity.
              </p>
            </div>

            <Link
              to="/dashboard/streams"
              className="text-sm font-medium text-red-500 hover:text-red-400"
            >
              Manage streams
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-red-500" />
            </div>
          ) : streams.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {streams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#141416] p-12 text-center">
              <Radio size={32} className="mx-auto text-gray-700" />

              <p className="mt-3 text-sm font-medium">No streams yet</p>

              <p className="mt-1 text-xs text-gray-600">
                Create your first stream from the Dashboard.
              </p>

              <Link
                to="/dashboard/create-stream"
                className="mt-5 inline-flex rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold hover:bg-red-700"
              >
                Go Live
              </Link>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModal(false)}
          />

          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold">Edit Profile</h2>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {editError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                  <AlertCircle size={15} className="shrink-0" />
                  <p>{editError}</p>
                </div>
              )}

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-400">
                  Display name
                </span>

                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#202023] px-4 py-3 text-sm outline-none transition focus:border-red-500/50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-400">
                  Bio
                </span>

                <textarea
                  value={editBio}
                  onChange={(event) => setEditBio(event.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Tell your audience about yourself..."
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#202023] px-4 py-3 text-sm outline-none transition focus:border-red-500/50"
                />
              </label>

              <div>
                <span className="mb-1.5 block text-xs font-medium text-gray-400">
                  Profile picture
                </span>

                <div className="flex items-center gap-4">
                  <Avatar
                    src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar}
                    alt={displayName}
                    name={displayName}
                    size="xl"
                  />

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#202023] px-3.5 py-2 text-xs text-gray-300 transition hover:border-white/25">
                    {avatarFile ? "Selected" : "Upload"}
                    <Camera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleFile(event, setAvatarFile)}
                    />
                  </label>
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-medium text-gray-400">
                  Cover banner
                </span>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#202023] px-3.5 py-2 text-xs text-gray-300 transition hover:border-white/25">
                  {bannerFile ? "Selected" : "Upload banner"}
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleFile(event, setBannerFile)}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-700 disabled:opacity-50"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;