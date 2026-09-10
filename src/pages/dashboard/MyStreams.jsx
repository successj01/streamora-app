import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Plus,
  Play,
  Eye,
  Calendar,
  Radio,
  Pencil,
  Trash2,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import streamService from "../../services/streamService";
import { normalizeStream } from "../../utils/streamData";
import { formatDate } from "../../utils/formatDate";

const FILTERS = ["All", "Live", "Scheduled", "Ended"];

const MyStreams = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState("All");
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadStreams = useCallback(async () => {
    if (!user?._id) return;

    setLoading(true);
    setError("");

    try {
      const data = await streamService.getUserStreams(user._id);
      const list = (
        Array.isArray(data) ? data : data?.streams || []
      )
        .map(normalizeStream)
        .filter(Boolean);

      setStreams(list);
    } catch {
      setError("Unable to load your streams. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (isAuthenticated) loadStreams();
  }, [isAuthenticated, loadStreams]);

  const flashNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const filteredStreams = useMemo(() => {
    if (filter === "All") return streams;

    return streams.filter((stream) => {
      if (filter === "Live") {
        return stream.live || stream.status === "live";
      }

      return stream.status.toLowerCase() === filter.toLowerCase();
    });
  }, [streams, filter]);

  const statusOf = (stream) => {
    if (stream.live || stream.status === "live") return "Live";
    if (stream.status === "scheduled" || (stream.scheduledAt && new Date(stream.scheduledAt) > new Date())) {
      return "Scheduled";
    }
    return "Ended";
  };

  const handleStart = async (stream) => {
    setBusyId(stream.id);
    try {
      await streamService.startStream(stream.id);
      await loadStreams();
      flashNotice("Stream marked as live.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to start stream.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCopyKey = async (stream) => {
    setBusyId(stream.id);
    try {
      const data = await streamService.getStreamKey(stream.id);
      const key = data?.streamKey || data?.key || "";

      if (!key) throw new Error("No stream key returned");

      await navigator.clipboard.writeText(key);
      flashNotice("Stream key copied to clipboard.");
    } catch (err) {
      setError(err?.message || "Unable to fetch stream key.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (stream) => {
    if (!window.confirm(`Delete "${stream.title}"? This cannot be undone.`)) {
      return;
    }

    setBusyId(stream.id);
    try {
      await streamService.deleteStream(stream.id);
      await loadStreams();
      flashNotice("Stream deleted.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete stream.");
    } finally {
      setBusyId(null);
    }
  };

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

  const statusBadgeClass = (status) => {
    switch (status) {
      case "Live":
        return "bg-red-500/10 text-red-500";
      case "Scheduled":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-white/5 text-gray-500";
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f10] text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-red-500">
              Creator Studio
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              My Streams
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage and monitor all your streams.
            </p>
          </div>

          <Link
            to="/dashboard/create-stream"
            className="flex w-fit items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold hover:bg-red-700"
          >
            <Plus size={17} />
            Create Stream
          </Link>
        </div>

        {(error || notice) && (
          <div
            className={`mt-6 flex items-center gap-3 rounded-xl border p-4 text-sm ${
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

        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                filter === item
                  ? "bg-red-600 text-white"
                  : "border border-white/10 bg-[#141416] text-gray-500 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#141416]">
          <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] gap-4 border-b border-white/10 px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-600 md:grid">
            <span>Stream</span>
            <span>Status</span>
            <span>Views</span>
            <span>Date</span>
            <span />
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <Loader2 size={28} className="mx-auto animate-spin text-red-500" />
              <p className="mt-3 text-sm text-gray-500">Loading streams...</p>
            </div>
          ) : filteredStreams.length > 0 ? (
            filteredStreams.map((stream) => {
              const status = statusOf(stream);
              const busy = busyId === stream.id;

              return (
                <div
                  key={stream.id}
                  className="grid gap-4 border-b border-white/10 p-5 last:border-b-0 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#202023]">
                      {stream.thumbnail ? (
                        <img
                          src={stream.thumbnail}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Radio size={18} className="text-gray-600" />
                      )}

                      {status === "Live" && (
                        <span className="absolute left-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <Link
                        to={`/stream/${stream.id}`}
                        className="block truncate text-sm font-medium hover:text-red-500"
                      >
                        {stream.title}
                      </Link>

                      <p className="mt-1 text-xs text-gray-600">
                        {stream.category}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${statusBadgeClass(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Eye size={14} />
                    {(stream.totalViews || 0).toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    {formatDate(stream.createdAt || stream.scheduledAt)}
                  </div>

                  <div className="flex gap-2">
                    {status !== "Live" && status !== "Ended" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleStart(stream)}
                        className="rounded-lg p-2 text-green-500 hover:bg-green-500/10"
                        aria-label="Start stream"
                        title="Start stream"
                      >
                        <Play size={16} />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleCopyKey(stream)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"
                      aria-label="Copy stream key"
                      title="Copy stream key"
                    >
                      {busy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <KeyRound size={16} />
                      )}
                    </button>

                    <Link
                      to={`/dashboard/create-stream?id=${stream.id}`}
                      className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"
                      aria-label="Edit stream"
                    >
                      <Pencil size={16} />
                    </Link>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(stream)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-500"
                      aria-label="Delete stream"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <Radio size={32} className="mx-auto text-gray-700" />

              <p className="mt-3 text-sm font-medium">No streams found</p>

              <p className="mt-1 text-xs text-gray-600">
                Try another filter or create a new stream.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MyStreams;