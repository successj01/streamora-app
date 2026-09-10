import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Radio,
  Users,
  Search,
  Play,
  Heart,
  MoreHorizontal,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import useStreams from "../hooks/useStreams";

const FALLBACK_STREAMS = [
  {
    id: 1,
    title: "Streamora Live",
    creator: "Streamora Originals",
    category: "Entertainment",
    viewers: 24800,
    thumbnail:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 2,
    title: "Live Music Session",
    creator: "Music Lounge",
    category: "Music",
    viewers: 12400,
    thumbnail:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 3,
    title: "Championship Night",
    creator: "Sports Central",
    category: "Sports",
    viewers: 18700,
    thumbnail:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 4,
    title: "Gaming Arena",
    creator: "Pro Gaming",
    category: "Gaming",
    viewers: 9200,
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 5,
    title: "Late Night Comedy",
    creator: "Laugh Factory",
    category: "Entertainment",
    viewers: 7300,
    thumbnail:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 6,
    title: "DJ Set Live",
    creator: "Beat Street",
    category: "Music",
    viewers: 5600,
    thumbnail:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
];

const CATEGORIES = ["All", "Entertainment", "Music", "Sports", "Gaming"];

const formatViewers = (value) => {
  const number = Number(value) || 0;
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return number.toString();
};

const Live = () => {
  const navigate = useNavigate();
  const { liveStreams, error, fetchLiveStreams, clearError } = useStreams();

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState({});
  const [initialLoad, setInitialLoad] = useState(true);

  const streams = liveStreams.length > 0 ? liveStreams : FALLBACK_STREAMS;

  useEffect(() => {
    fetchLiveStreams()
      .catch(() => {})
      .finally(() => setInitialLoad(false));
  }, [fetchLiveStreams]);

  const filteredStreams = useMemo(() => {
    return streams.filter((stream) => {
      const categoryMatch =
        activeCategory === "All" || stream.category === activeCategory;
      const searchMatch =
        stream.title.toLowerCase().includes(search.toLowerCase()) ||
        stream.creator.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [streams, activeCategory, search]);

  const toggleLike = useCallback((id, event) => {
    event.stopPropagation();
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8 text-app-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full bg-red-600/10 px-3 py-1 text-xs font-semibold text-red-500">
                <Radio size={14} />
                LIVE NOW
              </span>
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Live Streams</h1>
            <p className="mt-2 text-sm text-app-muted sm:text-base">
              Watch live entertainment, sports, music and more.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search live streams..."
              className="w-full rounded-xl border border-app-border bg-surface-secondary py-3 pl-10 pr-4 text-sm text-app-text outline-none transition placeholder:text-app-muted focus:border-red-500/50"
            />
          </div>
        </header>

        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-red-600 text-white"
                  : "bg-surface-secondary text-app-muted hover:bg-surface-tertiary hover:text-app-text"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {error && !initialLoad && liveStreams.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            <AlertCircle size={18} className="shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              onClick={clearError}
              className="shrink-0 text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        <section>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold sm:text-2xl">Happening Now</h2>
                <span className="flex items-center gap-1.5 rounded-full bg-red-600/10 px-2.5 py-1 text-xs font-medium text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  LIVE
                </span>
              </div>

              <Link
                to="/browse"
                className="flex items-center gap-1 text-sm text-app-muted hover:text-app-text"
              >
                Explore
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStreams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  isLiked={!!liked[stream.id]}
                  onToggleLike={toggleLike}
                  onWatch={() => navigate(`/stream/${stream.id}`)}
                />
              ))}
            </div>

            {filteredStreams.length === 0 && (
              <div className="rounded-2xl border border-app-border bg-surface py-20 text-center">
                <Search size={32} className="mx-auto mb-3 text-app-muted opacity-40" />
                <h3 className="font-semibold">No live streams found</h3>
                <p className="mt-2 text-sm text-app-muted">
                  Try another category or search term.
                </p>
              </div>
            )}
          </section>

        <section className="mt-12 overflow-hidden rounded-2xl border border-app-border bg-gradient-to-r from-red-950/40 to-surface p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">Ready to go live?</h2>
              <p className="mt-2 text-sm text-app-muted">
                Share your content and connect with viewers on Streamora.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/create-stream")}
              className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Start Streaming
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

const StreamCard = ({ stream, isLiked, onToggleLike, onWatch }) => {
  const {
    id,
    title = "Untitled Stream",
    creator = "Unknown Creator",
    category = "General",
    viewers = 0,
    thumbnail,
    avatar,
  } = stream;

  return (
    <article className="group overflow-hidden rounded-2xl border border-app-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-950/20">
      <div
        role="button"
        tabIndex={0}
        onClick={onWatch}
        onKeyDown={(e) => e.key === "Enter" && onWatch()}
        className="cursor-pointer"
      >
        <div className="relative aspect-video overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-surface-secondary text-app-muted">
              <Radio size={32} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            LIVE
          </span>

          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white">
            <Users size={14} />
            {formatViewers(viewers)}
          </span>

          <button
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 opacity-0 backdrop-blur transition group-hover:opacity-100"
          >
            <MoreHorizontal size={18} className="text-white" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt={creator}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-app-muted text-xs font-bold">
              {creator.charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{title}</h3>
            <p className="mt-1 truncate text-xs text-app-muted">{creator}</p>
            <p className="mt-1 text-xs text-app-muted opacity-60">{category}</p>
          </div>

          <button
            onClick={(e) => onToggleLike(id, e)}
            className={`self-start transition ${isLiked ? "text-red-500" : "text-app-muted hover:text-red-500"}`}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        <button
          onClick={onWatch}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-surface-secondary py-2.5 text-sm font-medium text-app-text transition hover:bg-red-600 hover:text-white"
        >
          <Play size={15} fill="currentColor" />
          Watch Live
        </button>
      </div>
    </article>
  );
};

export default Live;
