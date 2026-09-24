import React from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiUsers,
  FiUser,
} from "react-icons/fi";
import { compactNumber } from "../../utils/formatNumber";

const CreatorCard = ({ creator }) => {
  if (!creator) return null;

  const {
    username = "",
    name = username || "Creator",
    followers = 0,
    avatar,
    verified = false,
    online = false,
  } = creator;

  const profileUrl = username ? `/profile/${encodeURIComponent(username)}` : "/profile";

  return (
    <article className="group rounded-2xl border border-white/10 bg-[#18181b] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-[#1c1c20] hover:shadow-xl hover:shadow-purple-950/20">
      <div className="flex flex-col items-center text-center">
        <Link to={profileUrl} className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              loading="lazy"
              className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10 transition duration-300 group-hover:ring-purple-500/60"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 ring-2 ring-white/10">
              <FiUser size={30} />
            </div>
          )}

          {online && (
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#18181b] bg-green-500" />
          )}
        </Link>

        <Link
          to={profileUrl}
          className="mt-4 flex items-center gap-1"
        >
          <h3 className="font-bold text-white transition hover:text-purple-400">
            {name}
          </h3>

          {verified && (
            <FiCheckCircle
              size={15}
              className="text-purple-500"
            />
          )}
        </Link>

        <p className="mt-1 text-sm text-gray-500">
          @{username}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-400">
          <FiUsers size={15} />
          <span>{formatFollowers(followers)} followers</span>
        </div>

        <Link
          to={profileUrl}
          className="mt-5 flex w-full items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-semibold text-purple-400 transition hover:border-purple-500 hover:bg-purple-600 hover:text-white"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
};

const formatFollowers = (value) => compactNumber(value);

export default CreatorCard;