import { API_BASE_URL } from "./constants";

const UPLOAD_ROOT = API_BASE_URL.replace(/\/api$/, "");

/**
 * Resolves an asset path (http(s) url, absolute /uploads path, or empty)
 * to a usable URL.
 */
export function resolveAssetUrl(value) {
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${UPLOAD_ROOT}${value}`;
  return value;
}

/**
 * Convenience avatar resolver. Returns empty string when absent so UI can
 * fall back to initial-letter/icon avatars.
 */
export function avatarOf(user) {
  if (!user) return "";
  return resolveAssetUrl(user.avatar);
}

/**
 * Converts a Stream document (from the API) into the shape the UI expects.
 * Supports both the API shape and the legacy/UI shape so components stay
 * stable regardless of where data comes from.
 */
export function normalizeStream(raw) {
  if (!raw) return null;

  const user = raw.user || {};
  const id = raw._id || raw.id;

  return {
    id,
    title: raw.title || "Untitled Stream",
    description: raw.description || "",
    category: raw.category || "Entertainment",
    tags: raw.tags || [],
    thumbnail: resolveAssetUrl(raw.thumbnail),
    status: raw.status || (raw.live ? "live" : raw.isLive ? "live" : "scheduled"),
    live: raw.live === true || raw.isLive === true || raw.status === "live",
    scheduledAt: raw.scheduledAt || null,
    startedAt: raw.startedAt || null,
    endedAt: raw.endedAt || null,
    viewerCount: raw.viewerCount ?? raw.viewers ?? 0,
    viewers: raw.viewerCount ?? raw.viewers ?? 0,
    totalViews: raw.totalViews ?? 0,
    peakViewers: raw.peakViewers ?? 0,
    likeCount: raw.likeCount ?? raw.likes ?? 0,
    likes: raw.likeCount ?? raw.likes ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    // creator fields
    user: raw.user || raw.creatorUser || null,
    creator: user.username || raw.creator || raw.creatorName || "Unknown Creator",
    creatorName:
      user.name || user.username || raw.creatorName || raw.creator || "Unknown Creator",
    avatar: avatarOf(user),
    verified: Boolean(user.verified || raw.verified),
    isOwner: Boolean(raw.user && raw.currentUserId && raw.user._id === raw.currentUserId),
  };
}

/**
 * Converts a chat message document to the shape StreamChat expects.
 */
export function normalizeMessage(raw) {
  if (!raw) return null;

  const user = raw.user || {};
  const isSystem = raw.type === "system" || !raw.user;

  return {
    id: raw._id || raw.id || `msg-${Date.now()}-${Math.random()}`,
    type: isSystem ? "system" : "user",
    username: user.username || raw.username || "System",
    name: user.name || raw.name || "",
    avatar: resolveAssetUrl(user.avatar || raw.avatar),
    verified: Boolean(user.verified || raw.verified),
    badge: user.badge || raw.badge || "",
    message: raw.message || "",
    time: raw.createdAt || raw.time || "",
    createdAt: raw.createdAt || raw.time || "",
  };
}

/**
 * Converts a category doc to the shape CategoryCard expects.
 */
export function normalizeCategory(raw) {
  if (!raw) return null;
  return {
    id: raw.id || raw.name.toLowerCase().replace(/\s+/g, "-"),
    name: raw.name,
    viewers: raw.viewers ?? raw.viewerCount ?? 0,
    streamCount: raw.streamCount ?? 0,
    liveCount: raw.liveCount ?? 0,
    icon: raw.icon || null,
    image: resolveAssetUrl(raw.image) || "",
  };
}

/**
 * Converts a user doc to a profile-friendly shape.
 */
export function normalizeUser(raw) {
  if (!raw) return null;
  return {
    id: raw._id,
    username: raw.username,
    name: raw.name || raw.username,
    email: raw.email || "",
    bio: raw.bio || "",
    avatar: avatarOf(raw),
    banner: resolveAssetUrl(raw.banner),
    verified: Boolean(raw.verified),
    region: raw.region || "Nigeria",
    language: raw.language || "English",
    isCreator: Boolean(raw.isCreator),
    followerCount: raw.subscriberCount ?? raw.followerCount ?? raw.followers ?? 0,
    followingCount: raw.followingCount ?? 0,
    isFollowing: Boolean(raw.isFollowing),
    createdAt: raw.createdAt,
  };
}