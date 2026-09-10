import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Users, Eye, Radio } from "lucide-react";

const StreamInfo = ({
  stream = {},
  viewerCount = 0,
  isLive = true,
  isFollowing = false,
  following = false,
  followerCount = null,
  onToggleFollow,
  followDisabled = true,
}) => {
  const {
    title = "Untitled Stream",
    category = "Entertainment",
    description = "",
    user = null,
    creator = "Unknown Creator",
    creatorName = "",
    avatar = "",
    verified = false,
    totalViews = 0,
    peakViewers = 0,
  } = stream;

  const name = user?.name || creatorName || creator;
  const username = user?.username || creator;
  const displayAvatar = user?.avatar || avatar;
  const displayVerified = Boolean(user?.verified || verified);
  const displayFollowerCount =
    followerCount ??
    user?.subscriberCount ??
    user?.followerCount ??
    0;
  const isFollowingNow = following ?? isFollowing;

  return (
    <section className="py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-red-500">
                <Radio size={12} />
                Live
              </span>
            )}

            <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[11px] font-medium text-gray-400">
              {category}
            </span>
          </div>

          <h1 className="mt-3 text-xl font-bold leading-tight text-white sm:text-2xl">
            {title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Eye size={14} />
              {viewerCount.toLocaleString()} watching
            </span>

            <span className="inline-flex items-center gap-1.5">
              {isLive ? (
                <>
                  <Radio size={14} />
                  Live audience
                </>
              ) : (
                <>
                  <Eye size={14} />
                  {(totalViews || 0).toLocaleString()} total views
                </>
              )}
            </span>

            {peakViewers > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Users size={14} />
                {(peakViewers || 0).toLocaleString()} peak viewers
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/profile/${username}`}
            className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#1d1d20]"
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-semibold text-gray-400">
                {(name || "S").charAt(0).toUpperCase()}
              </div>
            )}
          </Link>

          <div>
            <Link
              to={`/profile/${username}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-red-500"
            >
              {name}

              {displayVerified && (
                <CheckCircle2
                  size={15}
                  className="fill-red-500 text-red-500"
                />
              )}
            </Link>

            <p className="text-xs text-gray-500">
              @{username}

              {displayFollowerCount > 0 && (
                <>
                  {" - "}
                  {displayFollowerCount.toLocaleString()}{" "}
                  {displayFollowerCount === 1 ? "follower" : "followers"}
                </>
              )}
            </p>
          </div>

          {!followDisabled && (
            <button
              type="button"
              onClick={onToggleFollow}
              className={`ml-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                isFollowingNow
                  ? "border border-white/10 text-gray-300 hover:bg-white/[0.05]"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isFollowingNow ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>

      {description && (
        <div className="mt-5 rounded-xl bg-white/[0.03] p-4">
          <p className="text-sm leading-6 text-gray-400">{description}</p>
        </div>
      )}
    </section>
  );
};

export default StreamInfo;