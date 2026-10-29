import { clockFrom, tSecFromClock } from "../format";
import type { ChatLine, CueEdit, Kind, PassResult, Proposal, Settings, WireWindow } from "../types";

/**
 * Scores are fixed. Sensitivity only moves the line:
 * low 76, medium 54, high 38.
 * With confirm off, a cue at 72 or above is marked armed.
 * The sandbox still does not send it.
 */
export const CUTOFF: Record<Settings["sensitivity"], number> = {
  low: 76,
  medium: 54,
  high: 38,
};

export const OPEN_GATE_SCORE = 72;

export const STANDARD_SETTINGS: Settings = {
  sensitivity: "medium",
  confirmRequired: true,
  enabled: { mod: true, highlight: true, scene: true },
};

export const TUTORIALS: { id: string; name: string; detail: string; settings: Settings }[] = [
  {
    id: "quiet",
    name: "Quiet desk",
    detail: "Line 76. Confirm required. Only the loudest cues stay.",
    settings: { sensitivity: "low", confirmRequired: true, enabled: { mod: true, highlight: true, scene: true } },
  },
  {
    id: "standard",
    name: "Standard pair",
    detail: "Line 54. Confirm required. The desk you land on.",
    settings: STANDARD_SETTINGS,
  },
  {
    id: "open",
    name: "Open gate",
    detail: "Line 38. Confirm off. Cues at 72 and above are marked armed.",
    settings: { sensitivity: "high", confirmRequired: false, enabled: { mod: true, highlight: true, scene: true } },
  },
];

const LINK = /discord\.gg|https?:\/\/|bit\.ly|free followers/i;
const SEVERE = /\b(kys|kill yourself)\b/i;
const HARD = /\b(uninstall|dogwater|trash streamer)\b/i;
const SOFT = /\b(ratio|you suck|garbage)\b/i;
const HYPE = /\b(clip|poggers?|insane|clutch|lets go|let's go|no way)\b/i;

function sceneForCategory(category: string): string {
  if (/just chatting/i.test(category)) return "Just Chatting";
  return "Gameplay";
}

function programGuess(window: WireWindow, tSec: number): string {
  let scene = "Just Chatting";
  const points: { t: number; scene: string }[] = [];
  for (const event of window.events) {
    if (event.tSec > tSec) continue;
    if (event.type === "channel.update") {
      points.push({ t: event.tSec, scene: sceneForCategory(String(event.meta.to ?? "")) });
    }
    if (event.type === "channel.raid") points.push({ t: event.tSec, scene: "Raid thanks" });
  }
  for (const message of window.messages) {
    if (message.role !== "broadcaster" || message.tSec > tSec) continue;
    if (/\bbrb\b/i.test(message.text)) points.push({ t: message.tSec, scene: "BRB" });
  }
  points.sort((a, b) => a.t - b.t);
  for (const point of points) scene = point.scene;
  return scene;
}

function blank(partial: Omit<Proposal, "gate">): Proposal {
  return { ...partial, gate: "held" };
}

function detectMods(window: WireWindow): Proposal[] {
  const out: Proposal[] = [];
  const chat = window.messages.filter((m) => m.role !== "broadcaster");

  const byUser = new Map<string, ChatLine[]>();
  for (const line of chat) {
    if (!LINK.test(line.text)) continue;
    const list = byUser.get(line.user) ?? [];
    list.push(line);
    byUser.set(line.user, list);
  }
  for (const [user, list] of byUser) {
    let best: ChatLine[] = [];
    for (const start of list) {
      const cluster = list.filter((line) => line.tSec >= start.tSec && line.tSec <= start.tSec + 150);
      if (cluster.length > best.length) best = cluster;
    }
    if (best.length < 3) continue;
    const score = 74 + Math.min(18, (best.length - 3) * 6);
    const last = best[best.length - 1];
    out.push(
      blank({
        id: `mod:spam:${user}`,
        kind: "mod",
        score,
        tSec: last.tSec,
        title: `Timeout ${user}`,
        reason: `${user} posted a link ${best.length} times in under three minutes.`,
        draft: `Timeout ${user} for 600 seconds. Delete the repeated promo. Note: unsolicited link in chat.`,
        evidence: best.map((line) => line.id),
        mod: { action: "timeout", user, seconds: 600 },
      }),
    );
  }

  for (const line of chat) {
    if (SEVERE.test(line.text)) {
      out.push(
        blank({
          id: `mod:severe:${line.id}`,
          kind: "mod",
          score: 96,
          tSec: line.tSec,
          title: `Timeout ${line.user} · kys`,
          reason: `${line.user} wrote "${line.text}".`,
          draft: `Timeout ${line.user} for 600 seconds. Reason: severe hostility. Quote: "${line.text}".`,
          evidence: [line.id],
          mod: { action: "timeout", user: line.user, seconds: 600 },
        }),
      );
      continue;
    }
    if (HARD.test(line.text)) {
      const hit = line.text.match(/\b(uninstall|dogwater|trash streamer)\b/i);
      out.push(
        blank({
          id: `mod:hard:${line.id}`,
          kind: "mod",
          score: 68,
          tSec: line.tSec,
          title: `Timeout ${line.user} · ${hit ? hit[1].toLowerCase() : "hostile"}`,
          reason: `${line.user} wrote "${line.text}".`,
          draft: `Timeout ${line.user} for 180 seconds. Reason: hostile line. Quote: "${line.text}".`,
          evidence: [line.id],
          mod: { action: "timeout", user: line.user, seconds: 180 },
        }),
      );
    }
    if (line.text.length >= 220 && !LINK.test(line.text)) {
      out.push(
        blank({
          id: `mod:pasta:${line.id}`,
          kind: "mod",
          score: 78,
          tSec: line.tSec,
          title: `Delete ${line.user}'s paste`,
          reason: `${line.user} dropped a ${line.text.length}-character paste.`,
          draft: `Delete the message from ${line.user}. It is a pasted block, not a conversation.`,
          evidence: [line.id],
          mod: { action: "delete", user: line.user, seconds: 0 },
        }),
      );
    }
  }

  const hostile = chat.filter((line) => SEVERE.test(line.text) || HARD.test(line.text) || SOFT.test(line.text));
  let bestPile: ChatLine[] = [];
  for (const start of hostile) {
    const cluster = hostile.filter((line) => line.tSec >= start.tSec && line.tSec <= start.tSec + 80);
    const users = new Set(cluster.map((line) => line.user));
    if (cluster.length >= 3 && users.size >= 2 && cluster.length > bestPile.length) bestPile = cluster;
  }
  if (bestPile.length >= 3) {
    const quotes = bestPile.map((line) => `${line.user}: "${line.text}"`).join(" ");
    const lead = bestPile.find((line) => HARD.test(line.text) || SEVERE.test(line.text)) ?? bestPile[0];
    out.push(
      blank({
        id: `mod:pile:${bestPile[0].id}`,
        kind: "mod",
        score: 46,
        tSec: bestPile[bestPile.length - 1].tSec,
        title: "Warn the pile",
        reason: `${bestPile.length} hostile lines landed close together. ${quotes}`,
        draft: `Post a warning in chat. Keep an eye on ${lead.user}. Do not time out the whole pile from this one cue.`,
        evidence: bestPile.map((line) => line.id),
        mod: { action: "warn", user: lead.user, seconds: 0 },
      }),
    );
  }

  return out;
}

function detectHighlights(window: WireWindow): Proposal[] {
  const out: Proposal[] = [];
  for (const event of window.events) {
    if (event.type === "channel.raid") {
      const viewers = Number(event.meta.viewers) || 0;
      const from = String(event.meta.from ?? "someone");
      const score = 58 + Math.min(28, Math.round(viewers / 4));
      out.push(
        blank({
          id: `highlight:raid:${event.id}`,
          kind: "highlight",
          score,
          tSec: event.tSec,
          title: `Mark ${clockFrom(event.tSec)} · Raid`,
          reason: `${from} raided with ${viewers} accounts.`,
          draft: `Drop a stream marker at ${clockFrom(event.tSec)}. Label: Raid arrival, ${from}, ${viewers} accounts.`,
          evidence: [event.id],
          highlight: { label: "Raid arrival", tSec: event.tSec },
        }),
      );
    }
    if (event.type === "channel.cheer") {
      const bits = Number(event.meta.bits) || 0;
      const user = String(event.meta.user ?? "someone");
      const note = event.meta.note ? ` Note: "${event.meta.note}".` : "";
      const score = 36 + Math.min(40, Math.round(bits / 20));
      out.push(
        blank({
          id: `highlight:cheer:${event.id}`,
          kind: "highlight",
          score,
          tSec: event.tSec,
          title: `Mark ${clockFrom(event.tSec)} · Cheer`,
          reason: `${user} cheered ${bits} bits.${note}`,
          draft: `Drop a stream marker at ${clockFrom(event.tSec)}. Label: ${bits} bits from ${user}.`,
          evidence: [event.id],
          highlight: { label: `${bits} bits from ${user}`, tSec: event.tSec },
        }),
      );
    }
    if (event.type === "channel.subscribe") {
      const gifts = Number(event.meta.gifts) || 0;
      if (gifts < 1) continue;
      const user = String(event.meta.user ?? "someone");
      const score = 32 + gifts * 6;
      out.push(
        blank({
          id: `highlight:gift:${event.id}`,
          kind: "highlight",
          score,
          tSec: event.tSec,
          title: `Mark ${clockFrom(event.tSec)} · Gift subs`,
          reason: `${user} gifted ${gifts} subs.`,
          draft: `Drop a stream marker at ${clockFrom(event.tSec)}. Label: ${gifts} gift subs from ${user}.`,
          evidence: [event.id],
          highlight: { label: `${gifts} gift subs`, tSec: event.tSec },
        }),
      );
    }
  }

  const hits = window.messages.filter((line) => HYPE.test(line.text));
  type Group = { ids: string[]; quotes: string[]; tSec: number; count: number };
  const groups: Group[] = [];
  for (const hit of hits) {
    const group = hits.filter((line) => line.tSec >= hit.tSec && line.tSec <= hit.tSec + 50);
    if (group.length < 3) continue;
    const mid = group[Math.floor(group.length / 2)];
    groups.push({
      ids: group.map((line) => line.id),
      quotes: group.map((line) => `${line.user}: "${line.text}"`),
      tSec: mid.tSec,
      count: group.length,
    });
  }
  groups.sort((a, b) => b.count - a.count || a.tSec - b.tSec);
  const used = new Set<string>();
  for (const group of groups) {
    if (group.ids.some((id) => used.has(id))) continue;
    group.ids.forEach((id) => used.add(id));
    const score = 22 + group.count * 10;
    const label = group.count >= 4 ? "Clutch chorus" : "Hype burst";
    out.push(
      blank({
        id: `highlight:chorus:${group.ids[0]}`,
        kind: "highlight",
        score,
        tSec: group.tSec,
        title: `Mark ${clockFrom(group.tSec)} · ${label}`,
        reason: `${group.count} lines hyped the same moment. ${group.quotes.join(" ")}`,
        draft: `Drop a stream marker at ${clockFrom(group.tSec)}. Label: ${label}.`,
        evidence: group.ids,
        highlight: { label, tSec: group.tSec },
      }),
    );
  }

  return out;
}

function detectScenes(window: WireWindow): Proposal[] {
  const out: Proposal[] = [];
  for (const event of window.events) {
    if (event.type === "channel.update") {
      const fromCat = String(event.meta.from ?? "the previous category");
      const toCat = String(event.meta.to ?? "the new category");
      const target = sceneForCategory(toCat);
      const from = programGuess(window, event.tSec - 1);
      out.push(
        blank({
          id: `scene:update:${event.id}`,
          kind: "scene",
          score: 92,
          tSec: event.tSec,
          title: `Switch to ${target}`,
          reason: `The category changed from ${fromCat} to ${toCat}.`,
          draft: `Cue the mock OBS scene "${target}". The guessed program before this was "${from}". OBS is not connected.`,
          evidence: [event.id],
          scene: { target, from },
        }),
      );
    }
    if (event.type === "channel.raid") {
      const fromUser = String(event.meta.from ?? "a channel");
      const viewers = Number(event.meta.viewers) || 0;
      const from = programGuess(window, event.tSec - 1);
      out.push(
        blank({
          id: `scene:raid:${event.id}`,
          kind: "scene",
          score: 83,
          tSec: event.tSec,
          title: "Switch to Raid thanks",
          reason: `${fromUser} raided with ${viewers} accounts.`,
          draft: `Cue the mock OBS scene "Raid thanks". The guessed program before this was "${from}". OBS is not connected.`,
          evidence: [event.id],
          scene: { target: "Raid thanks", from },
        }),
      );
    }
  }

  const brb = window.messages.find((line) => line.role === "broadcaster" && /\bbrb\b/i.test(line.text));
  if (brb) {
    const from = programGuess(window, brb.tSec - 1);
    out.push(
      blank({
        id: `scene:brb:${brb.id}`,
        kind: "scene",
        score: 81,
        tSec: brb.tSec,
        title: "Switch to BRB",
        reason: `${brb.user} said "${brb.text}".`,
        draft: `Cue the mock OBS scene "BRB". The guessed program before this was "${from}". OBS is not connected.`,
        evidence: [brb.id],
        scene: { target: "BRB", from },
      }),
    );
    const back = window.messages.find(
      (line) => line.role === "broadcaster" && line.tSec > brb.tSec && /\b(back|queue)\b/i.test(line.text),
    );
    if (back) {
      out.push(
        blank({
          id: `scene:return:${back.id}`,
          kind: "scene",
          score: 64,
          tSec: back.tSec,
          title: "Switch back to Gameplay",
          reason: `${back.user} said "${back.text}" after the break.`,
          draft: `Cue the mock OBS scene "Gameplay". The guessed program before this was "${programGuess(window, back.tSec - 1)}". OBS is not connected.`,
          evidence: [back.id],
          scene: { target: "Gameplay", from: programGuess(window, back.tSec - 1) },
        }),
      );
    }
  }

  const goals = window.messages.filter((line) => /sub goal/i.test(line.text));
  if (goals.length) {
    const first = goals[0];
    const from = programGuess(window, first.tSec - 1);
    out.push(
      blank({
        id: `scene:goal:${first.id}`,
        kind: "scene",
        score: 44,
        tSec: first.tSec,
        title: "Switch to Sub goal",
        reason: `Chat mentioned the sub goal ${goals.length === 1 ? "once" : `${goals.length} times`}.`,
        draft: `Cue the mock OBS scene "Sub goal". The guessed program before this was "${from}". OBS is not connected.`,
        evidence: goals.map((line) => line.id),
        scene: { target: "Sub goal", from },
      }),
    );
  }

  return out;
}

function withGate(proposal: Proposal, settings: Settings): Proposal {
  const armed = !settings.confirmRequired && proposal.score >= OPEN_GATE_SCORE;
  return { ...proposal, gate: armed ? "armed" : "held" };
}

export function runPass(window: WireWindow, settings: Settings): PassResult {
  const signals = [...detectMods(window), ...detectHighlights(window), ...detectScenes(window)].sort(
    (a, b) => a.tSec - b.tSec || b.score - a.score,
  );
  const line = CUTOFF[settings.sensitivity];
  const above = signals.filter((signal) => signal.score >= line);
  const cues = above.filter((signal) => settings.enabled[signal.kind]).map((signal) => withGate(signal, settings));
  const below = signals.filter((signal) => signal.score < line && settings.enabled[signal.kind]);
  const heldBack = above.filter((signal) => !settings.enabled[signal.kind]);
  const withheld: Record<Kind, number> = { mod: 0, highlight: 0, scene: 0 };
  for (const signal of heldBack) withheld[signal.kind] += 1;
  return { line, cues, below, heldBack, withheld, signalCount: signals.length };
}

export function parseSettings(input: unknown): Settings | null {
  if (!input || typeof input !== "object") return null;
  const body = input as Record<string, unknown>;
  const sensitivity = body.sensitivity;
  if (sensitivity !== "low" && sensitivity !== "medium" && sensitivity !== "high") return null;
  if (typeof body.confirmRequired !== "boolean") return null;
  const enabled = body.enabled;
  if (!enabled || typeof enabled !== "object") return null;
  const flags = enabled as Record<string, unknown>;
  if (typeof flags.mod !== "boolean" || typeof flags.highlight !== "boolean" || typeof flags.scene !== "boolean") {
    return null;
  }
  return {
    sensitivity,
    confirmRequired: body.confirmRequired,
    enabled: { mod: flags.mod, highlight: flags.highlight, scene: flags.scene },
  };
}

export function applyEdit(proposal: Proposal, edit?: CueEdit): Proposal {
  if (!edit) return proposal;
  const next: Proposal = { ...proposal, title: edit.title.trim() || proposal.title, draft: edit.draft };
  if (proposal.mod && edit.modAction) {
    const raw = edit.modSeconds ?? proposal.mod.seconds;
    const safe = Number.isFinite(raw) ? raw : proposal.mod.seconds;
    const seconds = edit.modAction === "timeout" ? Math.max(1, Math.round(safe)) : 0;
    next.mod = { ...proposal.mod, action: edit.modAction, seconds };
  }
  if (proposal.highlight && edit.highlightLabel) {
    const parsed = edit.highlightClock ? tSecFromClock(edit.highlightClock) : null;
    next.highlight = { label: edit.highlightLabel.trim() || proposal.highlight.label, tSec: parsed ?? proposal.highlight.tSec };
  }
  if (proposal.scene && edit.sceneTarget) {
    next.scene = { ...proposal.scene, target: edit.sceneTarget };
  }
  return next;
}

export function settingsKey(settings: Settings): string {
  return `${settings.sensitivity}|${settings.confirmRequired ? "confirm" : "open"}|${settings.enabled.mod ? "m" : ""}${settings.enabled.highlight ? "h" : ""}${settings.enabled.scene ? "s" : ""}`;
}
