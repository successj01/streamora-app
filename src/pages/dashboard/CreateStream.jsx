import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import {
  Radio,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  MonitorUp,
  Loader2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Upload,
  CalendarClock,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import useWebRTC from "../../hooks/useWebRTC";
import streamService from "../../services/streamService";
import { normalizeStream } from "../../utils/streamData";
import { STREAM_CATEGORIES } from "../../utils/constants";

const MAX_TAGS = 5;

const CreateStream = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const editId = searchParams.get("id");

  const [streamId, setStreamId] = useState(editId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(STREAM_CATEGORIES[0]);
  const [tagsText, setTagsText] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(Boolean(editId));
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [started, setStarted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [microphoneOn, setMicrophoneOn] = useState(true);
  const [streamKey, setStreamKey] = useState("");

  const { videoRef, localStream, isLive, connected, error: rtcError, startBroadcast, stopBroadcast } =
    useWebRTC({ streamId, role: "broadcaster" });

  // Load existing stream when editing.
  useEffect(() => {
    if (!editId) return;

    let cancelled = false;

    streamService
      .getStreamById(editId)
      .then(async (data) => {
        if (cancelled) return;

        const stream = normalizeStream(data);

        setTitle(stream.title || "");
        setDescription(stream.description || "");
        setCategory(stream.category || STREAM_CATEGORIES[0]);
        setTagsText((stream.tags || []).join(", "));
        setThumbnailPreview(stream.thumbnail || "");
        setStreamId(stream.id);

        if (stream.live || stream.status === "live") {
          setStarted(true);
        }

        try {
          const keyData = await streamService.getStreamKey(stream.id);
          setStreamKey(keyData?.streamKey || "");
        } catch {
          // not the owner — leave key empty
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Unable to load stream.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  // Attach the local camera feed to the preview.
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, videoRef]);

  // Stop broadcast when the component unmounts.
  useEffect(() => {
    return () => {
      stopBroadcast();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashNotice = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }, []);

  const buildFormData = useCallback(() => {
    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);

    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, MAX_TAGS);

    tags.forEach((tag) => formData.append("tags", tag));

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    return formData;
  }, [title, description, category, tagsText, thumbnailFile]);

  const handleThumbnailChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for the thumbnail.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Thumbnail must be smaller than 5MB.");
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setError("");
  };

  const saveStream = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      throw new Error("Title required");
    }
    if (!STREAM_CATEGORIES.includes(category)) {
      setError("Please choose a valid category.");
      throw new Error("Category required");
    }

    setError("");
    setSaving(true);

    try {
      const data = streamId
        ? await streamService.updateStream(streamId, buildFormData())
        : await streamService.createStream(buildFormData());

      const stream = normalizeStream(data);

      if (!streamId) {
        setStreamId(stream.id);
        setSearchParams({ id: stream.id }, { replace: true });
      }

      flashNotice(streamId ? "Stream updated." : "Stream created.");

      try {
        const keyData = await streamService.getStreamKey(stream.id);
        setStreamKey(keyData?.streamKey || "");
      } catch {
        // ignore
      }

      return stream;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveStream();
    } catch {
      /* error already displayed */
    }
  };

  const handleGoLive = async () => {
    setBusy(true);
    setError("");

    try {
      if (!streamId) {
        await saveStream();
        flashNotice("Stream created. Click Go Live to start broadcasting.");
        return;
      }

      await streamService.startStream(streamId);
      await startBroadcast({ video: cameraOn, audio: microphoneOn });
      setStarted(true);
      flashNotice("You are live!");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to go live. Check your camera and try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    setBusy(true);
    setError("");

    try {
      stopBroadcast();

      if (streamId) {
        await streamService.stopStream(streamId);
      }

      setStarted(false);
      flashNotice("Stream ended.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to stop the stream.");
    } finally {
      setBusy(false);
    }
  };

  const copyStreamKey = async () => {
    if (!streamKey) {
      try {
        const keyData = await streamService.getStreamKey(streamId);
        setStreamKey(keyData?.streamKey || "");
      } catch {
        setError("Unable to fetch your stream key.");
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(streamKey);
      flashNotice("Stream key copied to clipboard.");
    } catch {
      // ignore
    }
  };

  const toggleTrack = (kind, toggle) => {
    if (!localStream) return;
    toggle();

    localStream.getTracks().forEach((track) => {
      if (track.kind === kind) {
        track.enabled = !track.enabled;
      }
    });
  };

  const handleDelete = async () => {
    if (!streamId) return;

    if (!window.confirm("Delete this stream? This cannot be undone.")) {
      return;
    }

    setBusy(true);
    try {
      if (started) stopBroadcast();
      await streamService.deleteStream(streamId);
      navigate("/dashboard/streams");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete stream.");
      setBusy(false);
    }
  };

  const previewLabel = useMemo(() => {
    if (started) return "LIVE";
    if (streamId) return "PREVIEW";
    return "PREVIEW";
  }, [started, streamId]);

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

  const liveNow = started && isLive;

  return (
    <main className="min-h-screen bg-[#0f0f10] text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-red-500">
              Creator Studio
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              {streamId ? "Stream Studio" : "Go Live"}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Set up your stream details, then start broadcasting directly from
              your browser.
            </p>
          </div>

          {streamKey && (
            <button
              type="button"
              onClick={copyStreamKey}
              className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-[#141416] px-4 py-2.5 text-sm text-gray-300 transition hover:border-white/20 hover:text-white"
            >
              <Copy size={16} />
              Copy stream key
            </button>
          )}
        </div>

        {(error || notice) && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm ${
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

        {rtcError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
            <AlertCircle size={18} className="shrink-0" />
            <p className="flex-1">{rtcError}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#141416]">
              <div className="border-b border-white/10 p-5">
                <h2 className="font-semibold">Broadcast Preview</h2>

                <p className="mt-1 text-xs text-gray-500">
                  {loading
                    ? "Loading your stream..."
                    : streamId
                    ? "This is what viewers will see."
                    : "Fill in the details and go live to start broadcasting."}
                </p>
              </div>

              <div className="relative aspect-video bg-black">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-gray-600" />
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    muted
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />

                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                      liveNow
                        ? "bg-red-500/10 text-red-500"
                        : "bg-white/5 text-gray-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        liveNow ? "animate-pulse bg-red-500" : "bg-gray-600"
                      }`}
                    />
                    {liveNow ? "ON AIR" : previewLabel}
                  </span>

                  <span className="text-xs text-gray-600">
                    {connected ? "Signaling connected" : "Connecting..."}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTrack("audio", () => setMicrophoneOn((v) => !v))}
                    disabled={!localStream}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#202023] transition hover:border-white/20 disabled:opacity-40"
                    aria-label="Toggle microphone"
                  >
                    {microphoneOn ? (
                      <Mic size={17} />
                    ) : (
                      <MicOff size={17} className="text-red-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleTrack("video", () => setCameraOn((v) => !v))}
                    disabled={!localStream}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#202023] transition hover:border-white/20 disabled:opacity-40"
                    aria-label="Toggle camera"
                  >
                    {cameraOn ? (
                      <Camera size={17} />
                    ) : (
                      <CameraOff size={17} className="text-red-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {liveNow && (
              <div className="rounded-xl border border-red-500/20 bg-[#141416] p-5">
                <div className="flex items-start gap-3">
                  <Radio size={20} className="mt-0.5 shrink-0 text-red-500" />

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-500">
                      You are live
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Share your stream link with viewers to start watching and
                      chatting.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(window.location.origin + "/stream/" + streamId)
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/5 px-3.5 py-2 text-xs text-gray-300 hover:text-white"
                >
                  <Copy size={14} />
                  Copy stream link
                </button>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#141416]">
              <div className="border-b border-white/10 p-5">
                <h2 className="font-semibold">Stream Details</h2>

                <p className="mt-1 text-xs text-gray-500">
                  {streamId
                    ? "Update your stream information."
                    : "These details can be changed before you go live."}
                </p>
              </div>

              <div className="space-y-5 p-5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-gray-400">
                    Title <span className="text-red-500">*</span>
                  </span>

                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                    placeholder="e.g. Midnight Gaming Marathon with the community"
                    className="w-full rounded-lg border border-white/10 bg-[#202023] px-4 py-3 text-sm outline-none transition focus:border-red-500/50"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-gray-400">
                    Category <span className="text-red-500">*</span>
                  </span>

                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#202023] px-4 py-3 text-sm outline-none transition focus:border-red-500/50"
                  >
                    {STREAM_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-gray-400">
                    Description
                  </span>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Tell viewers about your stream..."
                    className="w-full resize-none rounded-lg border border-white/10 bg-[#202023] px-4 py-3 text-sm outline-none transition focus:border-red-500/50"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-gray-400">
                    Tags
                  </span>

                  <input
                    type="text"
                    value={tagsText}
                    onChange={(event) => setTagsText(event.target.value)}
                    placeholder="e.g. gaming, live, naira (comma separated)"
                    className="w-full rounded-lg border border-white/10 bg-[#202023] px-4 py-3 text-sm outline-none transition focus:border-red-500/50"
                  />
                </label>

                <div>
                  <span className="mb-1.5 block text-xs font-medium text-gray-400">
                    Thumbnail
                  </span>

                  <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4 transition hover:border-white/30">
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="h-16 w-24 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md bg-white/5 text-gray-500">
                        <MonitorUp size={20} />
                      </div>
                    )}

                    <div>
                      <span className="block text-sm font-medium text-gray-300">
                        {thumbnailPreview ? "Change thumbnail" : "Upload a thumbnail"}
                      </span>

                      <span className="mt-0.5 block text-xs text-gray-600">
                        PNG or JPG, up to 5MB
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || busy}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#202023] px-4 py-2.5 text-sm font-medium transition hover:border-white/20 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CalendarClock size={16} />
                    )}
                    {saving ? "Saving..." : streamId ? "Save changes" : "Save stream"}
                  </button>

                  {streamId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="min-w-0 space-y-6">
            <div className="rounded-xl border border-white/10 bg-[#141416] p-5">
              <h2 className="font-semibold">Stream Status</h2>

              <div className="mt-5 space-y-4">
                <StatusRow label="Stream key" value={streamKey ? "Ready" : "Not created"} />
                <StatusRow
                  label="Broadcast"
                  value={liveNow ? "Live" : started ? "Pending" : "Offline"}
                />
                <StatusRow
                  label="Viewers"
                  value={started ? "Connect via your stream link" : "—"}
                />
              </div>

              <div className="mt-6 space-y-3">
                {!liveNow ? (
                  <button
                    type="button"
                    onClick={handleGoLive}
                    disabled={busy || saving}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3.5 text-sm font-semibold transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Radio size={17} />
                    )}
                    {started ? "Retry broadcast" : "Go Live"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStop}
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Radio size={17} />
                    )}
                    Stop Stream
                  </button>
                )}

                {streamKey && (
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#202023] p-3">
                    <code className="flex-1 truncate text-[11px] text-purple-400">
                      {streamKey}
                    </code>

                    <button
                      type="button"
                      onClick={copyStreamKey}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-white/5 hover:text-white"
                      aria-label="Copy stream key"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}

                {!streamKey && (
                  <div className="rounded-lg border border-white/10 bg-[#202023] p-4 text-xs leading-5 text-gray-500">
                    <p>
                      Your <span className="text-purple-400">stream key</span> is created when
                      you save your stream. It lets professional software (like OBS) connect to
                      your broadcast.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#141416] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Upload size={16} className="text-gray-500" />
                Tips
              </div>

              <ul className="mt-4 space-y-3 text-xs leading-5 text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                  Make sure your camera and microphone are working before going live.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                  Preview your banner and title to attract more viewers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                  Share your stream link to bring your community over.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

const StatusRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-300">{value}</span>
  </div>
);

export default CreateStream;