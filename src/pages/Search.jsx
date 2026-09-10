import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search as SearchIcon,
  X,
  Users,
  User,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

import StreamCard from "../components/stream/StreamCard";
import streamService from "../services/streamService";
import userService from "../services/userService";
import { normalizeStream, normalizeUser } from "../utils/streamData";
import { STREAM_CATEGORIES } from "../utils/constants";

const Search = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [showFilters, setShowFilters] = useState(false);
  const [streams, setStreams] = useState([]);
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const timeoutRef = useRef(null);

  const normalizedQuery = query.trim();

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!normalizedQuery) {
      setStreams([]);
      setUsers([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    setError("");

    timeoutRef.current = setTimeout(async () => {
      try {
        const [streamResults, userResults] = await Promise.all([
          streamService.searchStreams(normalizedQuery).catch(() => null),
          userService.searchUsers(normalizedQuery).catch(() => null),
        ]);

        const streamList = (
          Array.isArray(streamResults)
            ? streamResults
            : streamResults?.streams || []
        )
          .map(normalizeStream)
          .filter(Boolean);

        const userList = (
          Array.isArray(userResults) ? userResults : userResults?.users || []
        )
          .map(normalizeUser)
          .filter(Boolean);

        setStreams(streamList);
        setUsers(userList);
      } catch (err) {
        setError("Unable to complete your search. Please try again.");
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [normalizedQuery]);

  const visibleStreams = useMemo(() => {
    if (category === "All Categories") return streams;

    return streams.filter(
      (stream) => stream.category === category
    );
  }, [streams, category]);

  const totalResults = visibleStreams.length + users.length;

  const clearSearch = () => {
    setQuery("");
    setStreams([]);
    setUsers([]);
    setCategory("All Categories");
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("All Categories");
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-500">
            Streamora
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">Search</h1>

          <p className="mt-2 text-sm text-gray-400 sm:text-base">
            Find live streams, replays and creators across Streamora.
          </p>
        </section>

        <section className="mb-8">
          <div className="relative">
            <SearchIcon
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a stream or creator..."
              className="w-full rounded-2xl border border-white/10 bg-[#171719] py-5 pl-14 pr-14 text-base text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/50 focus:bg-[#1a1a1c]"
            />

            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-4 py-2.5 text-sm font-medium transition hover:bg-white/[0.09]"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>

            <p className="text-sm text-gray-500">
              {searching
                ? "Searching..."
                : normalizedQuery
                ? `${totalResults} ${totalResults === 1 ? "result" : "results"}`
                : "Type to search"}
            </p>
          </div>

          {showFilters && (
            <div className="mt-4 rounded-xl border border-white/10 bg-[#171719] p-5">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-red-500/50"
              >
                <option value="All Categories" className="bg-[#171719]">
                  All Categories
                </option>

                {STREAM_CATEGORIES.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-[#171719]"
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {error && (
          <section className="mb-8 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </section>
        )}

        {normalizedQuery ? (
          <>
            {users.length > 0 && (
              <section className="mb-10">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold sm:text-2xl">
                    Creators
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.username}`}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#171719] p-4 transition hover:border-purple-500/30 hover:bg-[#1a1a1c]"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-14 w-14 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">
                          <User size={24} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="truncate font-semibold group-hover:text-purple-400">
                            {user.name}
                          </h3>

                          {user.verified && (
                            <CheckCircle2
                              size={14}
                              className="shrink-0 text-purple-500"
                            />
                          )}
                        </div>

                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          @{user.username}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                          <Users size={13} />
                          {(user.followerCount || 0).toLocaleString()} followers
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {visibleStreams.length > 0 ? (
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-semibold sm:text-2xl">
                    Streams
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleStreams.map((stream) => (
                    <StreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              </section>
            ) : (
              !searching &&
              users.length === 0 && (
                <section className="rounded-2xl border border-white/10 bg-[#171719] px-6 py-20 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.05]">
                    <SearchIcon size={28} className="text-gray-600" />
                  </div>

                  <h2 className="mt-5 text-xl font-semibold">
                    No results found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    We couldn't find anything matching your search. Try another
                    title or creator name.
                  </p>

                  <button
                    onClick={resetFilters}
                    className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-700"
                  >
                    Clear Search
                  </button>
                </section>
              )
            )}
          </>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center">
            <SearchIcon size={36} className="mx-auto mb-4 text-gray-700" />

            <h2 className="text-xl font-semibold">Search Streamora</h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Find live streams and creators by title, category or username.
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default Search;