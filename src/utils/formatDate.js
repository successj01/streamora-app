/**
 * Formats a date into a human-readable string.
 * @param {string | number | Date} date - Input date
 * @param {Intl.DateTimeFormatOptions} [options] - Optional Intl formatting overrides
 * @returns {string} Formatted date, or "Invalid date" if input can't be parsed
 */
export function formatDate(date, options = {}) {
  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) return "Invalid date";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return parsed.toLocaleDateString("en-NG", { ...defaultOptions, ...options });
}

/**
 * Formats a date as relative time (e.g. "3 hours ago").
 * @param {string | number | Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "Invalid date";

  const diffInSeconds = Math.floor((Date.now() - parsed.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const { label, seconds } of intervals) {
    const count = Math.floor(diffInSeconds / seconds);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }

  return "just now";
}