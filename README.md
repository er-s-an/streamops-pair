# StreamOps Pair

A live-ops copilot for a solo Twitch creator. It reads one window of stream context and chat, then puts three kinds of cue on the desk: a mod draft, a highlight marker, and a scene switch. Nothing fires until a person confirms, edits, or dismisses it.

## Problem

A solo creator is the mod, the producer, and the person on camera at the same time. A toxic line, a clip-worthy burst, and a late scene change all arrive while they are talking. Hiring a second person for the desk is unrealistic for a mid-size channel. A bot that acts on its own is worse: one bad timeout is the creator's name on it.

## Product

StreamOps Pair keeps the pause a human desk used to have. The pair scores the window and writes the cue. The creator clears it.

The desk shows two panes:

- Left: the channel surface. Without a Twitch token this is a recorded sandbox for the fictional channel `harborline` (39 chat lines and 6 mock EventSub rows, 19:02:00 to 19:15:44). The banner says so. Viewer counts are omitted on purpose.
- Right: the cue slips. Each slip is a mod draft, a highlight marker, or a scene cue, with Confirm, Edit, and Dismiss.

Settings sit above the desk: sensitivity (low / medium / high), which action types are on, and whether confirm is required. **Recompute cues** runs the same window through the scorer again. The slip list changes. Presets (Quiet desk, Standard pair, Open gate) only set those controls and run that same pass. They are not a frozen deck of cards.

Confirm and Release write a line in the cleared log on this page. The demo does not call Helix, and it does not open an OBS socket. Edit keeps your wording across later passes. Dismiss hides that cue until you restore it.

## Result

On the sandbox window a judge can:

1. Read the banner and see that the feed is not a live room.
2. Change sensitivity or turn an action type off, then press Recompute cues, and watch cues leave or return.
3. Confirm a mod draft, edit a scene cue, and dismiss a highlight. The log says no Helix request was sent.
4. Open the gate. Cues scored 72 or above are stamped Armed. Lower cues stay Held. Release still only writes the local log.
5. Leave the Codex Session ID field empty, or paste the id from the Codex thread that built this. The page does not invent one.

## How a pass decides

The scorer is deterministic and runs in the browser. `POST /api/proposals` on the dev server calls the same function, so a judge can recompute without the UI. No paid model API is required.

Sensitivity moves the cutoff. It does not reskin a preset.

| Sensitivity | Line | What stays |
| --- | --- | --- |
| Low | 76 | The loudest cues only |
| Medium | 54 | The default desk |
| High | 38 | Soft signals included, including a short hostile pile and a smaller hype burst |

Confirm required holds every cue. Confirm open marks a cue Armed when its score is 72 or above. Armed still waits for Release.

Action types that are off do not appear as slips. The receipt says they were held back.

Scores come from the window itself: repeated promo links, a severe line, a long paste, a cheer, gift subs, a raid, a category change, a broadcaster BRB and the return after it, a sub-goal mention, and a hype chorus. A lone "CLIP THAT" does not score. A chorus does.

## Twitch

The integration path is real OAuth plus a written EventSub plan. The sandbox runs when credentials are missing.

1. Create an app at https://dev.twitch.tv/console/apps.
2. Set the OAuth redirect URL to `http://127.0.0.1:5173/oauth/callback`.
3. Copy `.env.example` to `.env` and set `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`. Do not prefix the secret with `VITE_`. It stays on the dev server.
4. Restart `npm run dev`. Connect Twitch sends the browser to `https://id.twitch.tv/oauth2/authorize`.

Scopes requested:

- `user:read:chat`
- `user:write:chat`
- `moderator:manage:chat_messages`
- `moderator:manage:banned_users`
- `channel:manage:broadcast`

The callback `GET /oauth/callback` checks the `state` cookie, exchanges the code at `https://id.twitch.tv/oauth2/token`, then reads the user from `GET https://api.twitch.tv/helix/users`. The access token stays in the dev server's memory. The browser receives an httpOnly `pair_sid` cookie, not the token.

What the demo does **not** do, even after connect:

- It does not open `wss://eventsub.wss.twitch.tv/ws`.
- `GET /api/twitch/eventsub-plan` returns the subscription bodies a later socket would POST to Helix EventSub, and `subscribed` is false. Types: `channel.chat.message`, `channel.cheer`, `channel.raid`, `channel.subscribe`, `channel.update` (version 2), `stream.online`.
- It does not delete chat, time anyone out, post a warning, or drop a stream marker.
- It does not show a viewer count.

Without credentials, `GET /api/twitch/oauth/start` returns HTTP 400 and `missing_credentials`. The feed stays on the sandbox. `npm run preview` and a static build do not mount these routes. The page still recomputes on its own.

To wire a live room later: subscribe with the plan above, replace `SANDBOX_WINDOW` with EventSub and chat messages as they arrive, and call Helix only from the confirm handler. That last step is intentionally not built.

Scene cues name a target from a mock OBS list: Starting soon, Just Chatting, Gameplay, Raid thanks, BRB, Sub goal, Ending. `obs-websocket` is not connected.

## Codex

This project was built with OpenAI Codex: the scorer, the sandbox window, the confirm gate, the desk, and the Twitch path on the dev server.

The contest submission needs the Session ID from that work.

1. In the Codex thread that built StreamOps Pair, run `/status`.
2. Copy the Session ID.
3. Paste it into the field on this page, and into the Devpost form when you submit.

The field starts empty. A value you type is stored in this browser only (`localStorage` key `streamops-pair.codex-session`). It is not sent to a server. Do not type a placeholder.

## Run

Node 20 or newer. Verified with Node v20.19.2. The code does not use APIs that exist only in Node 22.

```bash
cd /workspace/competitions/twitchcon-codex/streamops-pair
npm install
npm run dev
```

Open http://127.0.0.1:5173/.

```bash
npm run build
npm run preview
```

Preview serves the static desk at http://127.0.0.1:4173/. The Twitch routes and `POST /api/proposals` exist only under `npm run dev`.

Example pass from another terminal while `npm run dev` is running:

```bash
curl -sS -X POST http://127.0.0.1:5173/api/proposals \
  -H 'content-type: application/json' \
  -d '{"sensitivity":"low","confirmRequired":true,"enabled":{"mod":true,"highlight":true,"scene":true}}'
```

Low returns line 76 and 7 cues. Medium returns line 54 and 13. High returns line 38 and 16.

## Originality

StreamOps Pair is a confirm-gated ops desk, not a chatbot with a Twitch logo. The window, the cutoff, and the three cue types are specific to how a solo creator already works: mod note, highlight, scene change. The scorer is local and repeatable so a judge can change a setting and see a new pass on the same chat, without a paid API and without a recording of one frozen result.

The photographs are of broadcast control rooms, not of this product. Credits are on the page. The files are unmodified. CSS only darkens them.

## What this is not

- Not an autonomous mod bot.
- Not a live viewer counter.
- Not OBS remote control.
- Not a filled-in Codex Session ID.
- Not a Devpost submission. See `DEVPOST-FIELDS.md`.
