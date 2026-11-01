# Devpost fields — DO NOT SUBMIT

**DO NOT SUBMIT** until the user says 「交」.

Do not create a submission, do not join again, and do not bind a card. Devpost account `er-s-an`, challenge **31742**, is already soft-done. Hub: https://twitchcon-codex.devpost.com/

Deadline to submit: about **2026-11-03 06:00 HKT** (2026-11-02 14:00 PT).

Paste the blocks below only after that nod, and only once a real Codex Session ID and a YouTube URL exist. The Session ID field in the product starts empty on purpose. **Never invent** a Session ID or Twitch credentials.

---

## Name

```
StreamOps Pair
```

## Tagline

```
Codex pair agent for live Twitch ops — mod drafts, highlights, scene cues, human confirm.
```

## Description (paste-ready)

```
Solo Twitch creators moderate chat, catch clip-worthy moments, and call scene changes while they are the person on camera. One missed toxic spike or one late scene switch costs the room. A full ops desk is unrealistic for a mid-size channel, and a bot that acts alone can timeout the wrong person.

StreamOps Pair is a Codex-built copilot for that desk. It watches a window of stream context and chat and proposes three kinds of action: a mod draft (timeout, delete, or warn), a highlight marker (clock time and a short label), and a scene-switch cue aimed at a mock OBS list. Every cue waits for Confirm, Edit, or Dismiss. Nothing in the demo calls Helix or changes a scene.

The sandbox is an honest recorded window from the fictional channel harborline when no Twitch token is loaded. The banner says so, and the page does not invent a viewer count. Change sensitivity, which action types are enabled, or whether confirm is required, then press Recompute cues. The same chat is scored again and the slips update. Presets only set those controls and run that pass — they are not a frozen deck.

Twitch connect is a real OAuth path (authorize, code exchange, Helix Get Users) with an EventSub subscription plan left unsubscribed until a token exists. The access token stays on the dev server. Confirm still does not fire a moderation call in this build.

Built with OpenAI Codex. In Codex, run /status and paste that Session ID into the product field and into Devpost. This page will not fill one in for you.

What we are not: a fully autonomous mod bot, or a generic chatbot with no Twitch wire.

Try the public demo: https://streamops-pair.vercel.app/
Public repo: https://github.com/er-s-an/streamops-pair
```

## Built with

```
OpenAI Codex
Twitch API (OAuth 2.0, Helix Get Users, EventSub subscription plan)
TypeScript
React
Vite
Mock OBS scene list (no obs-websocket connection)
Vercel
```

## Links (fill before 「交」 — leave blanks empty, do not invent)

| Field | Value | Status |
| --- | --- | --- |
| **Website / demo** | https://streamops-pair.vercel.app/ | LIVE |
| **GitHub repo** | https://github.com/er-s-an/streamops-pair | LIVE |
| **Codex Session ID** | `_PASTE FROM Codex /status — DO NOT INVENT_` | **GAP — user** |
| **YouTube demo (≤3 min)** | `_PASTE after upload — see YOUTUBE-UPLOAD.md_` | **GAP — user account** |
| **Internal review video** (not Devpost YouTube) | https://review-clips.vercel.app/v/streamops-pair-explainer | LIVE (review only) |

## Still required before a real submit

1. Codex Session ID from `/status` in the Codex thread that built this (paste into product + Devpost).
2. YouTube demo ≤3 minutes with Twitch surface + Codex usage visible (upload from `YOUTUBE-UPLOAD.md` materials; review-clips ≠ Devpost YouTube field).
3. Twitch `CLIENT_ID` / `CLIENT_SECRET` only if you want a live-token demo path for the video — sandbox alone is honest and already demoable.
4. The nod 「交」.

Video shared in chat or review goes out only as a `https://review-clips.vercel.app/v/<slug>` link. Do not attach an mp4.

---

**Reminder banner for agents:** Soft is DONE. Build polish is allowed. **Submit waits 「交」. No card.**
