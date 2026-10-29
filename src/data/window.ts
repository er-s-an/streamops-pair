import type { ChatLine, WireEvent, WireWindow } from "../types";

export const OBS_SCENES = [
  "Starting soon",
  "Just Chatting",
  "Gameplay",
  "Raid thanks",
  "BRB",
  "Sub goal",
  "Ending",
] as const;

const PASTA =
  "Okay so hear me out. The ranked system is a social experiment, and if you lose three in a row you have to narrate it like a nature documentary or you owe chat a story about your worst queue. I will be taking notes for the VOD chapter markers. Please and thank you. This is not a bit, it is a policy proposal, and I expect it written on the overlay before the next queue pops.";

const messages: ChatLine[] = [
  { id: "line-moss", tSec: 18, user: "moss", role: "viewer", text: "harbor in chat, first time on this channel" },
  { id: "line-june-desk", tSec: 36, user: "june", role: "sub", text: "the desk looks different tonight. I like it." },
  { id: "line-harbor-jc", tSec: 72, user: "harborline", role: "broadcaster", text: "Just chatting until the queue opens. Ask me anything except my rank." },
  { id: "line-pebble-rank", tSec: 98, user: "pebble", role: "viewer", text: "what rank though" },
  { id: "line-harbor-gold", tSec: 118, user: "harborline", role: "broadcaster", text: "Gold something. We do not say it out loud." },
  { id: "line-clip-early", tSec: 142, user: "clipit", role: "viewer", text: "CLIP THAT" },
  { id: "line-nova-noclip", tSec: 158, user: "nova", role: "mod", text: "there was no clip. let them land a round first." },
  { id: "line-cooked", tSec: 176, user: "saltpile", role: "viewer", text: "this is cooked already" },
  { id: "line-drop-1", tSec: 198, user: "drop_shop", role: "viewer", text: "free coaching discord.gg/harbor-drop" },
  { id: "line-drop-2", tSec: 214, user: "drop_shop", role: "viewer", text: "free coaching discord.gg/harbor-drop" },
  { id: "line-drop-3", tSec: 232, user: "drop_shop", role: "viewer", text: "free coaching discord.gg/harbor-drop" },
  { id: "line-drop-4", tSec: 248, user: "drop_shop", role: "viewer", text: "free coaching discord.gg/harbor-drop last call" },
  { id: "line-kys", tSec: 268, user: "saltpile", role: "viewer", text: "kys if you queue tonight" },
  { id: "line-vera-hey", tSec: 286, user: "vera", role: "viewer", text: "hey. not that." },
  { id: "line-mica-seeing", tSec: 304, user: "mica", role: "sub", text: "nova, you seeing this?" },
  { id: "line-nova-see", tSec: 318, user: "nova", role: "mod", text: "I see it. waiting on harbor." },
  { id: "line-lumen-bits", tSec: 352, user: "lumen", role: "vip", text: "five hundred bits for staying kind. ignore the link guy." },
  { id: "line-pasta", tSec: 378, user: "copypasta", role: "viewer", text: PASTA },
  { id: "line-harbor-ranked", tSec: 438, user: "harborline", role: "broadcaster", text: "Okay. Ranked. One game." },
  { id: "line-reed-lets", tSec: 456, user: "reed", role: "viewer", text: "lets go" },
  { id: "line-reed-welcome", tSec: 484, user: "reed", role: "viewer", text: "WELCOME NORTHWALL" },
  { id: "line-june-unreal", tSec: 498, user: "june", role: "sub", text: "the raid timing is unreal" },
  { id: "line-nova-clip", tSec: 512, user: "nova", role: "mod", text: "CLIP THE REACTION" },
  { id: "line-pebble-insane", tSec: 526, user: "pebble", role: "viewer", text: "insane timing" },
  { id: "line-reed-pog", tSec: 540, user: "reed", role: "viewer", text: "poggers welcome" },
  { id: "line-mica-gifts", tSec: 566, user: "mica", role: "sub", text: "gift subs for the raid, five of them" },
  { id: "line-harbor-brb", tSec: 590, user: "harborline", role: "broadcaster", text: "brb water, do not let them unionize" },
  { id: "line-vera-goal", tSec: 612, user: "vera", role: "viewer", text: "we are 40 from the sub goal" },
  { id: "line-june-goal", tSec: 634, user: "june", role: "sub", text: "sub goal after the raid?" },
  { id: "line-uninstall", tSec: 656, user: "saltpile", role: "viewer", text: "uninstall" },
  { id: "line-ratio", tSec: 672, user: "ratio_kid", role: "viewer", text: "ratio" },
  { id: "line-dogwater", tSec: 688, user: "dogged", role: "viewer", text: "dogwater aim" },
  { id: "line-june-not", tSec: 710, user: "june", role: "sub", text: "can we not" },
  { id: "line-harbor-back", tSec: 736, user: "harborline", role: "broadcaster", text: "back. queue." },
  { id: "line-reed-clutch", tSec: 758, user: "reed", role: "viewer", text: "CLUTCH incoming I can feel it" },
  { id: "line-nova-clutch", tSec: 776, user: "nova", role: "mod", text: "that clutch better be real" },
  { id: "line-june-clip", tSec: 792, user: "june", role: "sub", text: "CLIP THAT" },
  { id: "line-pebble-noway", tSec: 808, user: "pebble", role: "viewer", text: "no way" },
  { id: "line-lumen-lets", tSec: 824, user: "lumen", role: "vip", text: "lets go" },
];

const events: WireEvent[] = [
  {
    id: "ev-online",
    tSec: 0,
    type: "stream.online",
    summary: "stream.online. harborline went online. Title: Ranked climb, no tilt.",
    meta: { title: "Ranked climb, no tilt" },
  },
  {
    id: "ev-follow",
    tSec: 48,
    type: "channel.follow",
    summary: "channel.follow. june followed.",
    meta: { user: "june" },
  },
  {
    id: "ev-cheer",
    tSec: 340,
    type: "channel.cheer",
    summary: "channel.cheer. lumen cheered 500 bits. Note: for staying kind.",
    meta: { user: "lumen", bits: 500, note: "for staying kind" },
  },
  {
    id: "ev-update",
    tSec: 420,
    type: "channel.update",
    summary: "channel.update. Category changed from Just Chatting to VALORANT.",
    meta: { from: "Just Chatting", to: "VALORANT" },
  },
  {
    id: "ev-raid",
    tSec: 468,
    type: "channel.raid",
    summary: "channel.raid. northwall raided with 86 accounts.",
    meta: { from: "northwall", viewers: 86 },
  },
  {
    id: "ev-gift",
    tSec: 548,
    type: "channel.subscribe",
    summary: "channel.subscribe. mica gifted 5 subs.",
    meta: { user: "mica", gifts: 5 },
  },
];

if (PASTA.length < 220) {
  throw new Error("Sandbox paste is too short for the delete detector.");
}

export const SANDBOX_WINDOW: WireWindow = {
  channel: "harborline",
  title: "Ranked climb, no tilt",
  messages,
  events,
};

export const WINDOW_END = messages.reduce((max, line) => Math.max(max, line.tSec), 0);
