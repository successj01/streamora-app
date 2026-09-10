import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  CheckCircle2,
  Users,
  Video,
  Edit3,
  Radio,
  Settings,
  Loader2,
} from "lucide-react";

import { useCreator } from "../state/CreatorState";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import streamService from "../../services/streamService";

const CreatorProfile = () => {
  const { creatorProfile, loading: creatorLoading } = useCreator();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [followerCount, setFollowerCount] = useState(0);
  const [streamCount, setStreamCount] = useState(0);

  useEffect(() => {
    if (!user?._id) return;

    let cancelled = false;

    Promise.all([
      userService.getUserStatus(user._id).catch(() => null),
      streamService.getUserStreams(user._id).catch(() => null),
    ]).then(([status, streams]) => {
      if (cancelled) return;
      setFollowerCount(Number(status?.subscriberCount) || 0);
      setStreamCount(
        (Array.isArray(streams) ? streams : streams?.streams || []).length
      );
    });

    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f10] text-white">
        <Loader2 size={32} className="animate-spin text-red-500" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (creatorLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f10] text-white">
        <Loader2 size={32} className="animate-spin text-red-500" />
      </main>
    );
  }

  if (!creatorProfile) {
    return <Navigate to="/creator/create" replace />;
  }

  const { name, username, bio, avatar, banner, verified } = creatorProfile;

  return (
    <main className="min-h-screen bg-[#0f0f10] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141416]">
          <div className="relative h-48 bg-[#1b1b1e] sm:h-64">
            {banner ? (
              <img
                src={banner}
                alt={`${name} banner`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-red-500/20 via-purple-500/10 to-transparent" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent" />

            <Link
              to="/settings"
              className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-xs font-medium backdrop-blur transition hover:bg-black/90"
            >
              <Edit3 size={15} />
              Edit profile
            </Link>
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex items-end justify-between">
              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#141416] bg-[#1b1b1e]">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500">
                    {name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  {name}
                </h1>

                {verified && (
                  <CheckCircle2
                    size={19}
                    className="fill-red-500 text-red-500"
                  />
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">@{username}</p>

              {bio && (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-400">
                  {bio}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-6 border-t border-white/10 pt-5">
              <div>
                <p className="text-lg font-semibold text-white">
                  {followerCount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Followers</p>
              </div>

              <div>
                <p className="text-lg font-semibold text-white">
                  {streamCount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Streams</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Settings size={16} />
                Settings
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Radio size={16} />
                Creator Studio
              </Link>

              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Users size={16} />
                Public profile
              </Link>

              <Link
                to="/browse"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-red-700"
              >
                <Video size={16} />
                Browse content
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default CreatorProfile;