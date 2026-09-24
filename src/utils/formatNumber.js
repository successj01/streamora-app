import { CURRENCY } from "./constants";

/**
 * Formats a number as currency (defaults to NGN).
 * @param {number} amount
 * @param {string} [currencyCode] - ISO currency code, defaults to CURRENCY.CODE
 * @returns {string}
 */
export function formatCurrency(amount, currencyCode = CURRENCY.CODE) {
  if (typeof amount !== "number" || isNaN(amount)) return "—";

  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

/**
 * Formats a compact count (1.2K / 3.4M) for viewer/follower numbers.
 * Passes through non-numeric strings (e.g. "—", "1.2K" already formatted).
 * @param {number|string} value
 * @returns {string}
 */
export function compactNumber(value) {
  if (typeof value === "string" && value.trim() !== "") return value;

  const number = Number(value);

  if (typeof number !== "number" || isNaN(number)) return "—";

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return number.toString();
}

/**
 * Formats a plain number with thousands separators.
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (typeof num !== "number" || isNaN(num)) return "—";
  return new Intl.NumberFormat(CURRENCY.LOCALE).format(num);
}

/**
 * Formats a number as a percentage.
 * @param {number} value - e.g. 0.256 -> "25.6%"
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (typeof value !== "number" || isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}