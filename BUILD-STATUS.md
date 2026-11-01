# BUILD-STATUS

Written last, after `npm run build` passed on 2026-10-29.

**Do not Devpost-submit.** Waiting on the user 「交」. No card. No second Join.

## Paths

| What | Path |
| --- | --- |
| App | `/workspace/competitions/twitchcon-codex/streamops-pair/` |
| Dev entry | `/workspace/competitions/twitchcon-codex/streamops-pair/index.html` |
| Desk UI | `/workspace/competitions/twitchcon-codex/streamops-pair/src/App.tsx` |
| Scorer | `/workspace/competitions/twitchcon-codex/streamops-pair/src/engine/propose.ts` |
| Sandbox window | `/workspace/competitions/twitchcon-codex/streamops-pair/src/data/window.ts` |
| Dev API (Vite only) | `/workspace/competitions/twitchcon-codex/streamops-pair/src/server/devApi.ts` |
| Env template | `/workspace/competitions/twitchcon-codex/streamops-pair/.env.example` |
| Judge README | `/workspace/competitions/twitchcon-codex/streamops-pair/README.md` |
| Devpost paste stubs | `/workspace/competitions/twitchcon-codex/streamops-pair/DEVPOST-FIELDS.md` |
| Photos | `/workspace/competitions/twitchcon-codex/streamops-pair/public/media/` |

## Run

Node verified: **v20.19.2**. `engines` is `>=20`. Node 22 is fine. This build did not use a Node 22-only API.

```bash
cd /workspace/competitions/twitchcon-codex/streamops-pair
npm install
npm run dev
```

Open http://127.0.0.1:5173/.

`npm run build` (`tsc --noEmit` then Vite) succeeded after the last source edit. Output is `dist/`. `npm run preview` serves that static build on http://127.0.0.1:4173/ and does **not** mount the Twitch or `/api/proposals` routes. Use `npm run dev` for those.

## Checked

- Sandbox banner with no token. No viewer count.
- Low sensitivity, then Recompute cues: line moved from 54 to 76 and cues dropped. Same chat window, no reload.
- Confirm writes a local log line: “No Helix request was sent.”
- Edit survives a later pass. Dismiss stays off the desk.
- Open gate: Armed at 72 and above, the rest Held. Release is still local.
- Codex Session ID field starts empty.
- Connect Twitch with no credentials returns the missing-credentials note and stays on the sandbox.
- `POST /api/proposals` at low sensitivity returns `source: dev-server`, line 76, 7 cues.
- Design lint on `src/` and `index.html`: 0 FAIL, 0 WARN.
- Design inspect on http://127.0.0.1:5173/ at 1440, 768, and 390: 0 FAIL. One WARN, `no-footage`, is left as-is: there is no honest stream clip to loop, and a fake live room is out of scope. A second WARN, `card-rows` at 390, came from the FAQ boxes. Those resting fills were removed after that run and were not re-measured.

## Gaps (need the user)

- **Codex Session ID.** Run `/status` in the Codex thread that built this and paste the id. The field is empty. None was invented.
- **Twitch app.** `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` are not set. OAuth, Helix `Get Users`, and the EventSub plan are implemented and idle. The socket is not opened, and confirm does not call Helix.
- **YouTube.** The ≤3 minute Devpost video is not recorded.
- **Devpost.** Not submitted. Stubs are in `DEVPOST-FIELDS.md`.

## Deploy (public)

Written 2026-10-29 23:42 Asia/Shanghai (HKT). **Do not Devpost-submit.** No card. No invented Codex Session ID.

| What | URL / note |
| --- | --- |
| Public GitHub | https://github.com/er-s-an/streamops-pair |
| Vercel production (alias) | https://streamops-pair.vercel.app/ |
| Vercel project | `201122catsavetheworld-4924/streamops-pair` |
| Deploy command | `npx vercel --prod --yes` from app dir |
| Deploy time | 2026-10-29 23:42 Asia/Shanghai (HKT) |

curl: `GET https://streamops-pair.vercel.app/` → **200**. Single-deployment hostname returns 302 Vercel Authentication (use the alias). GitHub ↔ Vercel auto-link skipped (no Login Connection); push deploys are not wired.


## Explainer (2026-10-30 08:23 Asia/Shanghai)

- Remotion EN burn-in ~115s rendered: /workspace/competitions/explainers/streamops-pair/out/streamops-pair-explainer.mp4 (3.7MB)
- Staged under /workspace/video-share/videos/streamops-pair-explainer.mp4 + v/streamops-pair-explainer.html + videos.json
- Live review deep link (2026-10-30 ~09:19 HKT, 小可 --prod, curl 200): https://review-clips.vercel.app/v/streamops-pair-explainer
- Do not Devpost submit without 「交」. Session ID / Twitch / YouTube still open.


## Polish pass (2026-11-02 ~02:38 Asia/Shanghai / HKT)

- Frontend UX polish for contest desk (mode chip, dirty recompute, kind badges, receipt flash, wire/EventSub clarity). See `POLISH-STATUS.md`.
- Devpost paste pack strengthened in `DEVPOST-FIELDS.md` — **DO NOT SUBMIT**.
- YouTube packaging in `YOUTUBE-UPLOAD.md` (source mp4 + review-clips; account still blocks publish).
- `npm run build` passed after polish.
- Gaps unchanged: Codex Session ID, Twitch CLIENT_ID/SECRET, YouTube URL, user 「交」.

### Polish deploy 2026-11-02 ~02:39 Asia/Shanghai (HKT)

- `npx vercel --prod --yes` → READY, aliased https://streamops-pair.vercel.app/
- GitHub `main` at `5bc735f` (+ follow-up docs if any)
- curl alias → 200 with polished title meta
