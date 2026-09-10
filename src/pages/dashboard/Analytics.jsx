import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Eye,
  Users,
  Heart,
  Radio,
  TrendingUp,
  Loader2,
  BarChart3,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import streamService from "../../services/streamService";
import { normalizeStream } from "../../utils/streamData";
import { formatNumber } from "../../utils/formatNumber";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Analytics = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    let cancelled = false;

    streamService
      .getUserStreams(user._id)
      .then((data) => {
        if (cancelled) return;
        setStreams(
          (Array.isArray(data) ? data : data?.streams || [])
            .map(normalizeStream)
            .filter(Boolean)
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const metrics = useMemo(() => {
    const totalViews = streams.reduce(
      (sum, stream) => sum + (stream.totalViews || 0),
      0
    );

    const totalLikes = streams.reduce(
      (sum, stream) => sum + (stream.likeCount || 0),
      0
    );

    const peakTotal = streams.reduce(
      (sum, stream) => sum + (stream.peakViewers || 0),
      0
    );

    const avgPeak = streams.length > 0 ? peakTotal / streams.length : 0;

    return {
      totalViews,
      totalLikes,
      avgPeak,
      streamCount: streams.length,
    };
  }, [streams]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map();

    for (const stream of streams) {
      const views = stream.totalViews || 0;

      map.set(stream.category, (map.get(stream.category) || 0) + views);
    }

    const max = Math.max(0, ...Array.from(map.values()));

    return Array.from(map.entries())
      .map(([name, views]) => ({
        name,
        views,
        percentage: max > 0 ? Math.round((views / max) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [streams]);

  const weeklyActivity = useMemo(() => {
    const days = WEEK_DAYS.map((name) => ({ name, count: 0 }));

    for (const stream of streams) {
      const start = new Date(stream.startedAt || stream.createdAt);
      if (isNaN(start.getTime())) continue;

      const day = start.getDay();
      days[day].count += stream.totalViews || 0;
    }

    const max = Math.max(1, ...days.map((day) => day.count));

    return days.map((day) => ({
      ...day,
      height: Math.max(4, Math.round((day.count / max) * 100)),
    }));
  }, [streams]);

  const bestStream = useMemo(() => {
    let best = streams[0] || null;

    for (const stream of streams) {
      if ((stream.totalViews || 0) > (best?.totalViews || 0)) best = stream;
    }

    return best && best.totalViews > 0 ? best : null;
  }, [streams]);

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f10] text-white">
        <Loader2 size={32} className="animate-spin text-red-500" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasData = streams.length > 0;

  return (
    <main className="min-h-screen bg-[#0f0f10] text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-red-500">
            Creator Studio
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Understand your audience and track your stream performance.
          </p>
        </div>

        {!hasData ? (
          <div className="rounded-2xl border border-white/10 bg-[#141416] px-6 py-20 text-center">
            <BarChart3 size={36} className="mx-auto text-gray-700" />

            <h2 className="mt-5 text-lg font-semibold">No data yet</h2>

            <p className="mt-2 text-sm text-gray-500">
              Start streaming to unlock your analytics dashboard.
            </p>

            <Link
              to="/dashboard/create-stream"
              className="mt-6 inline-flex rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-700"
            >
              Create a stream
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={Eye}
                label="Total Views"
                value={formatNumber(metrics.totalViews)}
                accent="bg-red-500/10 text-red-500"
              />

              <MetricCard
                icon={Users}
                label="Avg. Peak Viewers"
                value={formatNumber(Math.round(metrics.avgPeak))}
                accent="bg-purple-500/10 text-purple-500"
              />

              <MetricCard
                icon={Heart}
                label="Total Likes"
                value={formatNumber(metrics.totalLikes)}
                accent="bg-pink-500/10 text-pink-500"
              />

              <MetricCard
                icon={Radio}
                label="Streams"
                value={formatNumber(metrics.streamCount)}
                accent="bg-cyan-500/10 text-cyan-500"
              />
            </div>

            <section className="mt-6 rounded-xl border border-white/10 bg-[#141416]">
              <div className="border-b border-white/10 p-5">
                <h2 className="font-semibold">Views by weekday</h2>

                <p className="mt-1 text-xs text-gray-500">
                  Total views from all your streams by the day they started.
                </p>
              </div>

              <div className="p-5">
                <div className="flex h-64 items-end gap-2 sm:gap-4">
                  {weeklyActivity.map((day, index) => (
                    <div
                      key={day.name}
                      className="group flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="relative flex flex-1 items-end justify-center">
                        <div
                          className="w-full max-w-12 rounded-t-md bg-red-600/70 transition group-hover:bg-red-500"
                          style={{ height: `${day.height}%` }}
                        />
                      </div>

                      <span className="mt-3 text-center text-[10px] text-gray-600">
                        {day.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-[#141416]">
                <div className="border-b border-white/10 p-5">
                  <h2 className="font-semibold">Top Categories</h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Categories generating the most views.
                  </p>
                </div>

                {categoryBreakdown.length > 0 ? (
                  <div className="space-y-5 p-5">
                    {categoryBreakdown.map((category) => (
                      <div key={category.name}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-300">
                            {category.name}
                          </span>

                          <span className="text-gray-600">
                            {formatNumber(category.views)} views
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-red-600"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-6 text-sm text-gray-500">
                    No category data available yet.
                  </p>
                )}
              </section>

              <section className="rounded-xl border border-white/10 bg-[#141416]">
                <div className="border-b border-white/10 p-5">
                  <h2 className="font-semibold">Stream Performance</h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Key performance indicators.
                  </p>
                </div>

                <div className="divide-y divide-white/10">
                  <PerformanceRow
                    icon={Radio}
                    label="Streams created"
                    value={formatNumber(metrics.streamCount)}
                  />

                  <PerformanceRow
                    icon={Eye}
                    label="Total views"
                    value={formatNumber(metrics.totalViews)}
                  />

                  <PerformanceRow
                    icon={Users}
                    label="Average peak viewers"
                    value={formatNumber(Math.round(metrics.avgPeak))}
                  />

                  <PerformanceRow
                    icon={Heart}
                    label="Total likes"
                    value={formatNumber(metrics.totalLikes)}
                  />
                </div>
              </section>
            </div>

            {bestStream && (
              <section className="mt-6 overflow-hidden rounded-xl border border-red-500/15 bg-gradient-to-r from-red-950/30 to-[#141416]">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                      <TrendingUp size={18} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Most popular stream
                      </p>

                      <Link
                        to={`/stream/${bestStream.id}`}
                        className="mt-0.5 block truncate text-sm font-semibold hover:text-red-500"
                      >
                        {bestStream.title}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-xs text-gray-500">
                      <strong className="mr-1 text-white">
                        {formatNumber(bestStream.totalViews)}
                      </strong>
                      views
                    </span>

                    <span className="text-xs text-gray-500">
                      <strong className="mr-1 text-white">
                        {formatNumber(bestStream.peakViewers)}
                      </strong>
                      peak
                    </span>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
};

const MetricCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-xl border border-white/10 bg-[#141416] p-5">
    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
      <Icon size={18} />
    </div>

    <p className="mt-5 text-2xl font-bold">{value}</p>

    <p className="mt-1 text-xs text-gray-500">{label}</p>
  </div>
);

const PerformanceRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-5">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05]">
      <Icon size={17} className="text-gray-400" />
    </div>

    <span className="flex-1 text-sm text-gray-400">{label}</span>

    <span className="text-sm font-semibold">{value}</span>
  </div>
);

export default Analytics;