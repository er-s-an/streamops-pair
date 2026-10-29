const START_SEC = 19 * 3600 + 2 * 60;

export function pad2(n: number): string {
  const v = Math.floor(Math.abs(n));
  return v < 10 ? `0${v}` : String(v);
}

/** Wall clock for the sandbox, which starts at 19:02:00. */
export function clockFrom(tSec: number): string {
  const total = START_SEC + Math.max(0, Math.floor(tSec));
  const h = Math.floor(total / 3600) % 24;
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

export function tSecFromClock(label: string): number | null {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  const s = match[3] ? Number(match[3]) : 0;
  if (h > 23 || m > 59 || s > 59) return null;
  const total = h * 3600 + m * 60 + s;
  const delta = total - START_SEC;
  if (delta < 0 || delta > 6 * 3600) return null;
  return delta;
}

export function kindLabel(kind: "mod" | "highlight" | "scene"): string {
  if (kind === "mod") return "mod drafts";
  if (kind === "highlight") return "highlight markers";
  return "scene cues";
}

export function roleLabel(role: "broadcaster" | "mod" | "vip" | "sub" | "viewer"): string | null {
  if (role === "viewer") return null;
  return role;
}
