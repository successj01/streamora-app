// App-wide constants — single source of truth
// Avoid magic strings and numbers throughout the application.

export const APP_NAME = "Streamora";

export const DEFAULT_AVATAR = "/images/default-avatar.png";

export const STREAM_CATEGORIES = [
  "Gaming",
  "Music",
  "Entertainment",
  "Sports",
  "Just Chatting",
  "Technology",
  "Education",
  "Comedy",
  "Lifestyle",
  "News",
  "Esports",
];

export const CURRENCY = {
  CODE: "NGN",
  SYMBOL: "₦",
  LOCALE: "en-NG",
};

export const DATE_FORMATS = {
  SHORT: "DD/MM/YYYY",
  LONG: "MMMM D, YYYY",
  TIME: "HH:mm",
};

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  BROWSE: "/browse",
  SETTINGS: "/settings",
};