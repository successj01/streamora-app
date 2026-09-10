import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronRight,
  FiEye,
  FiHeadphones,
  FiMessageCircle,
  FiPlay,
  FiRadio,
  FiTrendingUp,
  FiUsers,
  FiVideo,
} from "react-icons/fi";

import StreamCard from "../components/stream/StreamCard";
import CreatorCard from "../components/creator/CreatorCard";
import CategoryCard from "../components/categories/CategoryCard";
import { useStream } from "../context/StreamContext";
import { STREAM_CATEGORIES } from "../utils/constants";
import { normalizeCategory } from "../utils/streamData";

const CATEGORY_IMAGES = {
  Gaming:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
  Music:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
  Entertainment:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  Sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
  Technology:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  Esports:
    "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=900&q=80",
  Education:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  Comedy:
    "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=900&q=80",
  Lifestyle:
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80",
  News:
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
  "Just Chatting":
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80";

const Home = () => {
  const { liveStreams, categories, loadLiveStreams, loadCategories } = useStream();

  useEffect(() => {
    loadLiveStreams().catch(() => {});
    loadCategories().catch(() => {});
  }, [loadLiveStreams, loadCategories]);

  const topCreators = useMemo(() => {
    const seen = new Set();
    const creators = [];

    for (const stream of liveStreams) {
      const username = stream.creator;
      if (!username || seen.has(username)) continue;
      seen.add(username);

      creators.push({
        id: stream._id || stream.id,
        name: stream.creatorName || username,
        username: `@${username}`,
        avatar: stream.avatar,
        verified: stream.verified,
      });
    }

    return creators.slice(0, 8);
  }, [liveStreams]);

  const categoryCards = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories
        .map((raw) => {
          const normalized = normalizeCategory(raw);
          if (!normalized) return null;

          return {
            ...normalized,
            viewers: normalized.viewers || normalized.liveCount || 0,
            image: CATEGORY_IMAGES[normalized.name] || FALLBACK_IMAGE,
          };
        })
        .filter(Boolean)
        .slice(0, 8);
    }

    return STREAM_CATEGORIES.slice(0, 8).map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      viewers: 0,
      image: CATEGORY_IMAGES[name] || FALLBACK_IMAGE,
    }));
  }, [categories]);

  const featured = liveStreams[0] || null;

  const stats = useMemo(() => {
    const totalCreators = topCreators.length || 0;
    return {
      viewers:
        liveStreams.reduce((sum, s) => sum + (s.viewerCount || 0), 0) || 0,
      creators: totalCreators,
      streams: liveStreams.length,
    };
  }, [liveStreams, topCreators.length]);

  const formatNumber = (number) => {
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return number.toString();
  };

  return (
    <main className="min-h-screen bg-[#0f0f10] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.20),_transparent_40%)]" />

        <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-sm text-purple-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
                </span>
                {stats.streams > 0
                  ? `${stats.streams} ${stats.streams === 1 ? "stream" : "streams"} live right now`
                  : "Creators are going live"}
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Watch.
                <span className="text-purple-500"> Connect.</span>
                <br />
                Create.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
                Discover live streams, connect with creators, and
                build communities around the things you love.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/live"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 font-semibold transition hover:bg-purple-500"
                >
                  <FiPlay size={18} fill="currentColor" />
                  Watch Live
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold transition hover:bg-white/10"
                >
                  Start Streaming
                  <FiArrowRight size={18} />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-7">
                <div>
                  <p className="text-xl font-bold">
                    {stats.viewers > 0 ? formatNumber(stats.viewers) : "—"}
                  </p>
                  <p className="text-sm text-gray-500">Watching now</p>
                </div>

                <div>
                  <p className="text-xl font-bold">
                    {stats.creators > 0 ? formatNumber(stats.creators) : "—"}
                  </p>
                  <p className="text-sm text-gray-500">Creators live</p>
                </div>

                <div>
                  <p className="text-xl font-bold">
                    {stats.streams > 0 ? formatNumber(stats.streams) : "—"}
                  </p>
                  <p className="text-sm text-gray-500">Live streams</p>
                </div>
              </div>
            </div>

            {featured && (
              <div className="relative hidden lg:block">
                <Link
                  to={`/stream/${featured.id}`}
                  className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-[#18181b] shadow-2xl"
                >
                  {featured.thumbnail ? (
                    <img
                      src={featured.thumbnail}
                      alt={featured.title}
                      className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-[420px] items-center justify-center bg-[#18181b] text-gray-600">
                      <FiRadio size={48} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold uppercase">
                    <FiRadio size={14} />
                    Live
                  </div>

                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="mb-2 text-sm text-purple-300">
                      {featured.category}
                    </p>

                    <h3 className="text-2xl font-bold">{featured.title}</h3>

                    <div className="mt-3 flex items-center gap-3">
                      {featured.avatar ? (
                        <img
                          src={featured.avatar}
                          alt={featured.creator}
                          className="h-9 w-9 rounded-full border-2 border-purple-500 object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-purple-500 bg-purple-600/30 text-sm font-bold">
                          {featured.creator?.charAt(0)?.toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold">
                          {featured.creator}
                        </p>

                        <p className="text-xs text-gray-400">
                          {formatNumber(featured.viewerCount)} watching
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <h2 className="text-2xl font-bold">Live Now</h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Watch what's happening right now
            </p>
          </div>

          <Link
            to="/live"
            className="hidden items-center gap-1 text-sm font-medium text-purple-400 transition hover:text-purple-300 sm:flex"
          >
            View all
            <FiChevronRight size={18} />
          </Link>
        </div>

        {liveStreams.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {liveStreams.slice(0, 4).map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <FiRadio size={32} className="mx-auto text-gray-700" />
            <h3 className="mt-4 font-semibold">No one is live yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Be the first to start streaming on Streamora.
            </p>
            <Link
              to="/live"
              className="mt-5 inline-flex rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-700"
            >
              Explore streams
            </Link>
          </div>
        )}
      </section>

      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FiTrendingUp size={20} className="text-purple-500" />
                <h2 className="text-2xl font-bold">Trending Categories</h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Explore what everyone is watching
              </p>
            </div>

            <Link
              to="/categories"
              className="hidden items-center gap-1 text-sm font-medium text-purple-400 sm:flex"
            >
              Explore all
              <FiChevronRight size={18} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FiUsers size={20} className="text-purple-500" />
              <h2 className="text-2xl font-bold">Live Creators</h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Follow creators you don't want to miss
            </p>
          </div>

          <Link
            to="/browse"
            className="hidden items-center gap-1 text-sm font-medium text-purple-400 sm:flex"
          >
            Discover more
            <FiChevronRight size={18} />
          </Link>
        </div>

        {topCreators.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {topCreators.map((creator, index) => (
              <CreatorCard key={creator.username || index} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <FiUsers size={32} className="mx-auto text-gray-700" />
            <h3 className="mt-4 font-semibold">No creators live right now</h3>
            <p className="mt-2 text-sm text-gray-500">
              Check back soon or start your own stream.
            </p>
            <Link
              to="/dashboard/create-stream"
              className="mt-5 inline-flex rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-purple-500"
            >
              Start streaming
            </Link>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<FiEye size={22} />}
            title="Watch Everything"
            description="Discover live gaming, music, technology, entertainment, esports and more."
          />

          <FeatureCard
            icon={<FiMessageCircle size={22} />}
            title="Connect With People"
            description="Chat with communities, follow creators, and become part of the conversation."
          />

          <FeatureCard
            icon={<FiVideo size={22} />}
            title="Become a Creator"
            description="Start your own stream, build an audience, and grow your community on Streamora."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 via-purple-900/20 to-transparent p-8 sm:p-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-purple-400">
                <FiHeadphones size={19} />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Your community is waiting
                </span>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                Ready to experience Streamora?
              </h2>

              <p className="mt-3 text-gray-400">
                Join thousands of viewers and creators building the next
                generation of live communities.
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 font-semibold transition hover:bg-purple-500"
            >
              Get Started
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-200 hover:border-purple-500/30 hover:bg-white/[0.04]">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
        {icon}
      </div>

      <h3 className="text-lg font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
};

export default Home;