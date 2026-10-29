export type Role = "broadcaster" | "mod" | "vip" | "sub" | "viewer";

export type Sensitivity = "low" | "medium" | "high";

export type Kind = "mod" | "highlight" | "scene";

export type ModAction = "timeout" | "delete" | "warn";

export type EventType =
  | "stream.online"
  | "channel.follow"
  | "channel.cheer"
  | "channel.subscribe"
  | "channel.raid"
  | "channel.update";

export interface ChatLine {
  id: string;
  tSec: number;
  user: string;
  role: Role;
  text: string;
}

export interface WireEvent {
  id: string;
  tSec: number;
  type: EventType;
  summary: string;
  meta: Record<string, string | number>;
}

export interface WireWindow {
  channel: string;
  title: string;
  messages: ChatLine[];
  events: WireEvent[];
}

export interface Settings {
  sensitivity: Sensitivity;
  confirmRequired: boolean;
  enabled: Record<Kind, boolean>;
}

export interface Proposal {
  id: string;
  kind: Kind;
  score: number;
  tSec: number;
  title: string;
  reason: string;
  draft: string;
  evidence: string[];
  gate: "held" | "armed";
  mod?: { action: ModAction; user: string; seconds: number };
  highlight?: { label: string; tSec: number };
  scene?: { target: string; from: string };
}

export interface PassResult {
  line: number;
  cues: Proposal[];
  below: Proposal[];
  heldBack: Proposal[];
  withheld: Record<Kind, number>;
  signalCount: number;
}

export interface CueEdit {
  title: string;
  draft: string;
  modAction?: ModAction;
  modSeconds?: number;
  highlightLabel?: string;
  highlightClock?: string;
  sceneTarget?: string;
}

export interface ClearedCue {
  id: string;
  title: string;
  draft: string;
  gate: "held" | "armed";
  at: string;
}

export interface TwitchStatus {
  mode: "sandbox" | "credentials" | "connected" | "offline";
  clientIdSet: boolean;
  secretSet: boolean;
  login: string | null;
  userId: string | null;
  eventsub: "not-subscribed";
  note: string;
}
