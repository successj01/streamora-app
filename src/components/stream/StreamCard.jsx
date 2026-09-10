import React from "react";
import { Link } from "react-router-dom";
import {
  FiEye,
  FiRadio,
  FiUser,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

/**
 * Canonical stream card. Works with any normalized stream shape
 * (normalizeStream from utils/streamData).
 */
const StreamCard = ({ stream }) => {
  if (!stream) return null;

  const {
    id,
    title = "Untitled Stream",
    creator = "Unknown Creator",
    category = "General",
    viewers = 0,
    thumbnail,
    avatar,
    live = false,
    status = "",
    scheduledAt = null,
    verified = false,
  } = stream;

  if (!id) return null;

  const streamUrl = `/stream/${id}`;
  const creatorUrl = creator ? `/profile/${creator}` : null;
  const showLive = live || status === "live";

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-950/20">
      <Link to={streamUrl} className="block">
        <div className="relative aspect-video overflow-hidden bg-[#27272a]">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-600">
              <FiRadio size={32} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

          {showLive ? (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live
            </div>
          ) : (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-300 backdrop-blur-sm">
              <FiClock size={11} />
              {status === "scheduled"
                ? "Scheduled"
                : "Ended"}
            </span>
          )}

          {scheduledAt && status === "scheduled" && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-[11px] text-gray-300 backdrop-blur-sm">
              <FiClock size={12} />
              {formatScheduled(scheduledAt)}
            </span>
          )}

          {showLive && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
              <FiEye size={13} />
              <span>{formatViewers(viewers)}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={streamUrl}>
          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-white transition hover:text-purple-400">
            {title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-3">
          <Link to={creatorUrl} className="shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={creator}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-transparent transition group-hover:ring-purple-500/30"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">
                <FiUser size={16} />
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              to={creatorUrl}
              className="flex items-center gap-1"
            >
              <span className="truncate text-sm font-medium text-gray-300 hover:text-white">
                {creator}
              </span>

              {verified && (
                <FiCheckCircle
                  size={14}
                  className="shrink-0 text-purple-500"
                />
              )}
            </Link>

            <p className="mt-0.5 truncate text-xs text-gray-500">
              {category}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

const formatViewers = (value) => {
  const number = Number(value) || 0;

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return number.toString();
};

const formatScheduled = (value) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
};

export default StreamCard;