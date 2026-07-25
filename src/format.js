// Formats a database timestamp into a friendly Greek date + time.
// e.g. "2026-07-28T18:30:00" -> "Τρι 28 Ιουλ, 18:30"
export function formatDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleString("el-GR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
