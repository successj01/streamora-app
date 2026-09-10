import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Radio,
  Eye,
  Users,
  Plus,
  BarChart3,
  ListVideo,
  Loader2,
  AlertCircle,
  ArrowRight,
  CalendarClock,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import streamService from "../../services/streamService";
import userService from "../../services/userService";
import { normalizeStream } from "../../utils/streamData";
import { formatRelativeTime } from "../../utils/formatDate";
import { formatNumber } from "../../utils/formatNumber";

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [streams, setStreams] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [streamData, statusData] = await Promise.all([
          streamService.getUserStreams(user._id).catch(() => null),
          userService.getUserStatus(user._id).catch(() => null),
        ]);

        if (cancelled) return;

        const list = (
          Array.isArray(streamData)
            ? streamData
            : streamData?.streams || []
        )
          .map(normalizeStream)
          .filter(Boolean);

        setStreams(list);
        setFollowerCount(Number(statusData?.subscriberCount) || 0);
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load your dashboard. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?._id]);

  const stats = useMemo(() => {
    const live = streams.filter(
      (stream) => stream.live || stream.status === "live"
    ).length;

    const totalViews = streams.reduce(
      (sum, stream) => sum + (stream.totalViews || 0),
      0
    );

    const totalLikes = streams.reduce(
      (sum, stream) => sum + (stream.likeCount || 0),
      0
    );

    return { live, totalViews, totalLikes };
  }, [streams]);

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

  const recentStreams = streams.slice(0, 4);
  const displayName = user?.name || user?.username || "Creator";

  return (
    <main className="min-h-screen bg-[#0f0f10] text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-red-500">
              Creator Studio
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Welcome back, {displayName}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Here's what's happening with your streams today.
            </p>
          </div>

          <Link
            to="/dashboard/create-stream"
            className="flex w-fit items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-red-700"
          >
            <Plus size={17} />
            Go Live
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            <AlertCircle size={18} className="shrink-0" />

            <p className="flex-1">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl bg-white/[0.04]"
              />
            ))}
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Radio}
                label="Live right now"
                value={stats.live}
                accent="bg-red-500/10 text-red-500"
              />

              <StatCard
                icon={Eye}
                label="Total views"
                value={formatNumber(stats.totalViews)}
                accent="bg-purple-500/10 text-purple-500"
              />

              <StatCard
                icon={Users}
                label="Followers"
                value={formatNumber(followerCount)}
                accent="bg-blue-500/10 text-blue-500"
              />

              <StatCard
                icon={BarChart3}
                label="Streams created"
                value={formatNumber(streams.length)}
                accent="bg-green-500/10 text-green-500"
              />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#141416]">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                  <div>
                    <h2 className="font-semibold">Recent Streams</h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Your latest streaming activity.
                    </p>
                  </div>

                  <Link
                    to="/dashboard/streams"
                    className="flex items-center gap-1 text-sm text-red-500 transition hover:text-red-400"
                  >
                    Manage
                    <ArrowRight size={15} />
                  </Link>
                </div>

                {recentStreams.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {recentStreams.map((stream) => (
                      <div
                        key={stream.id}
                        className="flex items-center gap-4 p-4"
                      >
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            stream.live
                              ? "bg-red-500"
                              : stream.status === "scheduled"
                              ? "bg-yellow-500"
                              : "bg-gray-600"
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/stream/${stream.id}`}
                            className="block truncate text-sm font-medium text-gray-200 transition hover:text-red-500"
                          >
                            {stream.title}
                          </Link>

                          <p className="mt-0.5 text-xs text-gray-600">
                            {stream.category}
                            {stream.scheduledAt && stream.status === "scheduled"
                              ? ` - ${formatRelativeTime(stream.scheduledAt)}`
                              : ""}
                          </p>
                        </div>

                        <span className="text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Eye size={13} />
                            {(stream.totalViews || 0).toLocaleString()}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Radio size={32} className="mx-auto text-gray-700" />

                    <p className="mt-3 text-sm font-medium">
                      No streams yet
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      Create your first stream and go live.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <QuickAction
                  to="/dashboard/create-stream"
                  icon={Plus}
                  title="Go Live"
                  description="Start a new broadcast"
                  accent="bg-red-600"
                />

                <QuickAction
                  to="/dashboard/streams"
                  icon={ListVideo}
                  title="My Streams"
                  description={streams.length === 0
                    ? "Manage your streams"
                    : `${streams.length} stream${streams.length === 1 ? "" : "s"} created`}
                  accent="bg-purple-600"
                />

                <QuickAction
                  to="/dashboard/analytics"
                  icon={BarChart3}
                  title="Analytics"
                  description="Track performance & audience"
                  accent="bg-cyan-600"
                />

                {(stats.live > 0 || stats.totalViews > 0) && (
                  <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <CalendarClock size={17} />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold">
                          {stats.live > 0
                            ? `${stats.live} ${stats.live === 1 ? "stream is" : "streams are"} live`
                            : "Great streaming history"}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {stats.totalViews > 0
                            ? `${formatNumber(stats.totalViews)} total views across all your streams so far.`
                            : "Keep creating — every stream grows your audience."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }) => {
  if (typeof value !== "string") {
    value = formatNumber(Number(value) || 0);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#141416] p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
};

const QuickAction = ({ to, icon: Icon, title, description, accent }) => {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-[#141416] p-5 transition hover:border-white/20"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white ${accent}`}>
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold group-hover:text-red-500">
          {title}
        </h3>

        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>

      <ArrowRight
        size={16}
        className="shrink-0 text-gray-600 transition group-hover:translate-x-1 group-hover:text-white"
      />
    </Link>
  );
};

export default Dashboard;