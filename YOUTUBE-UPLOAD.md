# YouTube upload pack — StreamOps Pair (≤3 min)

**Do not upload from this agent unless a YouTube account/credential is clearly available.** Prefer packaging; user (or 小可 with account) publishes.

Devpost Submit needs a **YouTube** URL. The review-clips deep link is for internal review / chat only — it does **not** replace the Devpost YouTube field.

**DO NOT Devpost Submit** until user 「交」.

---

## Source video (ready)

| Item | Path / URL |
| --- | --- |
| Remotion project | `/workspace/competitions/explainers/streamops-pair/` |
| Rendered EN VO (H.264 + AAC) | `/workspace/competitions/explainers/streamops-pair/out/streamops-pair-explainer.mp4` (~4.9 MB, ~115s) |
| Silent backup | `/workspace/competitions/explainers/streamops-pair/out/streamops-pair-explainer-silent.mp4` |
| Script / burn-in | `/workspace/competitions/explainers/streamops-pair/SCRIPT.md` |
| Review deep link (LIVE) | https://review-clips.vercel.app/v/streamops-pair-explainer |
| Public product demo | https://streamops-pair.vercel.app/ |

Length (~115s) is under the Devpost ≤3 min cap. English only (foreign contest).

---

## Suggested YouTube metadata (EN)

### Title
```
StreamOps Pair — Codex pair agent for live Twitch ops (demo)
```

### Description
```
StreamOps Pair is a Codex-built live-ops copilot for Twitch creators. It watches a window of stream context and chat, then proposes mod drafts, highlight markers, and scene-switch cues — always with human Confirm / Edit / Dismiss.

This explainer walks the honest sandbox (fictional channel harborline when no Twitch token is loaded), settings → Recompute cues, and the three action types.

Public demo: https://streamops-pair.vercel.app/
GitHub: https://github.com/er-s-an/streamops-pair

Built for Codex × TwitchCon. No invented viewer counts. Confirm does not call Helix in the demo.
```

### Tags
```
StreamOps Pair, Twitch, OpenAI Codex, TwitchCon, live ops, stream moderation, EventSub, OBS, human-in-the-loop, creator tools
```

### Visibility
Unlisted is fine for Devpost paste; Public optional.

### Thumbnail
Optional: grab a still from the Remotion composition or a screenshot of the desk at https://streamops-pair.vercel.app/ with the sandbox banner visible.

---

## What still blocks YouTube publish

1. **YouTube account / channel** — no authenticated YouTube credential is assumed available to this agent. Upload from a browser signed into the contest channel, or hand the mp4 to whoever owns that channel.
2. **Optional live proof cut** — judges may prefer a cut that also shows Codex Session ID UI (empty field is honest) and the live demo URL on screen. Current explainer already covers sandbox + recompute + three cues; a short screen-capture outro of the live site can be appended if desired (keep total ≤3 min).
3. **After upload** — paste the YouTube URL into `DEVPOST-FIELDS.md` Links table and into Devpost only after 「交」.

---

## Upload checklist (human)

- [ ] Sign into the YouTube channel that will own the contest video
- [ ] Upload `out/streamops-pair-explainer.mp4` (or a ≤3 min cut that includes it)
- [ ] Paste title / description / tags above
- [ ] Set Unlisted or Public
- [ ] Copy URL → hold for Devpost until 「交」
- [ ] Do **not** attach the mp4 in chat; use review-clips for reviews

---

## Gaps that are NOT YouTube’s job

- Codex Session ID — user pastes from Codex `/status`
- Twitch CLIENT_ID / CLIENT_SECRET — user env only; never invent
- Devpost Submit — waits 「交」
