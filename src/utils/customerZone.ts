/**
 * Shared helpers for the Customer Zone.
 */

/** Below this weekly download volume we hide the usage section entirely. */
export const LAST_WEEK_MIN_GB = 2;

/** Human-readable data volume (GB, rolling up to TB). */
export function formatGb(gb: number | undefined | null): string {
  const value = gb ?? 0;
  if (value >= 1024) return `${(value / 1024).toFixed(2)} TB`;
  if (value < 0.01 && value > 0) return '< 0.01 GB';
  return `${value.toFixed(2)} GB`;
}

/** Locale-aware date (e.g. "10 Jul 2026" / "١٠ يوليو ٢٠٢٦"). Falls back to the raw value. */
export function formatDate(value: string | null | undefined, language: string): string {
  if (!value) return '—';
  let ms = Date.parse(value);
  if (Number.isNaN(ms)) ms = Date.parse(String(value).replace(' ', 'T'));
  if (Number.isNaN(ms)) {
    // numeric epoch (seconds or ms)
    const n = Number(value);
    if (!Number.isNaN(n)) ms = n < 1e12 ? n * 1000 : n;
  }
  if (Number.isNaN(ms)) return String(value);
  try {
    // Localize month names but always use Western/Latin digits (en numbers).
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      numberingSystem: 'latn',
    }).format(new Date(ms));
  } catch {
    return String(value);
  }
}

/** Mask a mobile number, keeping only the last 4 digits (e.g. "******3456"). */
export function maskMobile(value: string | null | undefined): string {
  if (!value) return '—';
  const s = String(value).trim();
  if (s.length <= 4) return s;
  return '*'.repeat(s.length - 4) + s.slice(-4);
}

/** Numeric date in YYYY-MM-DD with Western digits (e.g. "2026-07-10"). */
export function formatDateNumeric(value: string | null | undefined): string {
  if (!value) return '—';
  const s = String(value).trim();
  // Already a Y-m-d string — take the date part verbatim (avoids timezone shifts).
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  let ms = Date.parse(s);
  if (Number.isNaN(ms)) ms = Date.parse(s.replace(' ', 'T'));
  if (Number.isNaN(ms)) {
    const n = Number(s);
    if (!Number.isNaN(n)) ms = n < 1e12 ? n * 1000 : n;
  }
  if (Number.isNaN(ms)) return s;
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

/** A line is expired when paid_till is strictly before the start of today. */
export function isExpired(paidTill: string | null | undefined): boolean {
  if (!paidTill) return false;
  const t = Date.parse(paidTill);
  if (Number.isNaN(t)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return t < today.getTime();
}

/** Whether the usage section should be shown (>= LAST_WEEK_MIN_GB downloaded last week). */
export function shouldShowUsage(lastWeekDownloadGb: number | undefined | null): boolean {
  return (lastWeekDownloadGb ?? 0) >= LAST_WEEK_MIN_GB;
}
