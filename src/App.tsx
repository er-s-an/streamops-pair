import { useEffect, useMemo, useState } from "react";
import { Cues } from "./components/Cues";
import { SettingsBar } from "./components/SettingsBar";
import { Wire } from "./components/Wire";
import { applyEdit, runPass, settingsKey, STANDARD_SETTINGS } from "./engine/propose";
import { SANDBOX_WINDOW } from "./data/window";
import { Band, Close, CodexPanel, CueGuide, Questions, Story } from "./sections";
import type { ClearedCue, CueEdit, Proposal, Settings, TwitchStatus } from "./types";

const SESSION_KEY = "streamops-pair.codex-session";

const OFFLINE: TwitchStatus = {
  mode: "offline",
  clientIdSet: false,
  secretSet: false,
  login: null,
  userId: null,
  eventsub: "not-subscribed",
  note: "Sandbox feed. The Twitch status route is not running in this preview, and no token is loaded. The window is a recording of harborline, not a live room.",
};

export function App() {
  const [settings, setSettings] = useState<Settings>(STANDARD_SETTINGS);
  const [committed, setCommitted] = useState<Settings>(STANDARD_SETTINGS);
  const [passN, setPassN] = useState(1);
  const [prior, setPrior] = useState<Proposal[] | null>(null);
  const [edits, setEdits] = useState<Record<string, CueEdit>>({});
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [log, setLog] = useState<ClearedCue[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [twitch, setTwitch] = useState<TwitchStatus | null>(null);
  const [apiUp, setApiUp] = useState(false);
  const [connectNote, setConnectNote] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [flash, setFlash] = useState(false);

  const result = useMemo(
    () => runPass(SANDBOX_WINDOW, committed),
    [committed.sensitivity, committed.confirmRequired, committed.enabled.mod, committed.enabled.highlight, committed.enabled.scene],
  );

  const edited = result.cues.map((cue) => applyEdit(cue, edits[cue.id]));
  const cleared = new Set(log.map((item) => item.id));
  const active = edited.filter((cue) => !cleared.has(cue.id) && !dismissed.includes(cue.id));
  const dropped = prior ? prior.filter((cue) => !result.cues.some((next) => next.id === cue.id)) : [];
  const added = prior ? result.cues.filter((cue) => !prior.some((prev) => prev.id === cue.id)) : [];
  const dirty = settingsKey(settings) !== settingsKey(committed);
  const focused = result.cues.find((cue) => cue.id === focusId);
  const evidence = focused ? focused.evidence : [];

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) setSessionId(saved);
    const params = new URLSearchParams(window.location.search);
    if (params.get("twitch") === "error") {
      setConnectNote("Twitch did not return a token. The sandbox is still on.");
    }
    if (params.has("twitch")) {
      params.delete("twitch");
      const next = params.toString();
      window.history.replaceState({}, "", next ? `/?${next}` : "/");
    }
    let cancelled = false;
    fetch("/api/health")
      .then((res) => setApiUp(res.ok))
      .catch(() => setApiUp(false));
    fetch("/api/twitch/status")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("status"))))
      .then((body: TwitchStatus) => {
        if (!cancelled) setTwitch(body);
      })
      .catch(() => {
        if (!cancelled) setTwitch(OFFLINE);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const reveal = (node: HTMLElement) => node.classList.add("is-in");
    if (reduce) {
      nodes.forEach(reveal);
      return;
    }
    const pending = new Set(nodes);
    const seen = (node: HTMLElement) => {
      if (!pending.has(node)) return;
      pending.delete(node);
      reveal(node);
    };
    const inView = (node: HTMLElement) => {
      const rect = node.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight && rect.height > 0;
    };
    nodes.forEach((node) => {
      if (inView(node)) seen(node);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          seen(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    pending.forEach((node) => observer.observe(node));
    const safety = window.setTimeout(() => pending.forEach(seen), 900);
    return () => {
      window.clearTimeout(safety);
      observer.disconnect();
    };
  }, []);

  function recompute(next: Settings) {
    setSettings(next);
    setPrior(result.cues);
    setCommitted({
      sensitivity: next.sensitivity,
      confirmRequired: next.confirmRequired,
      enabled: { ...next.enabled },
    });
    setPassN((n) => n + 1);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 700);
  }

  async function connectTwitch() {
    setConnectNote(null);
    try {
      const res = await fetch("/api/twitch/oauth/start");
      const body = (await res.json()) as { url?: string; message?: string };
      if (!res.ok || !body.url) {
        setConnectNote(body.message || "Twitch credentials are not on this server. The sandbox stays on.");
        return;
      }
      window.location.assign(body.url);
    } catch {
      setConnectNote("The Twitch route is not running. Use npm run dev, or stay on the sandbox.");
    }
  }

  function onSession(value: string) {
    setSessionId(value);
    if (value.trim()) localStorage.setItem(SESSION_KEY, value);
    else localStorage.removeItem(SESSION_KEY);
  }

  const banner = twitch?.note ?? "Checking whether a Twitch token is on this server.";

  return (
    <>
      <a className="skip" href="#desk">
        Skip to the desk
      </a>
      <header className="top">
        <a className="brand" href="#desk">
          StreamOps Pair
        </a>
        <nav>
          <a href="#desk">Desk</a>
          <a href="#window">Window</a>
          <a href="#codex">Codex</a>
          <a href="#questions">Questions</a>
        </nav>
        <div className="top-actions">
          <span
            className={twitch?.mode === "connected" ? "mode-chip mode-live" : "mode-chip"}
            data-testid="mode-chip"
            title={banner}
          >
            {twitch?.mode === "connected" ? `Twitch · ${twitch.login}` : "Sandbox · harborline"}
          </span>
          <button type="button" className="btn btn-quiet" onClick={connectTwitch}>
            {twitch?.mode === "connected" ? `Token for ${twitch.login}` : "Connect Twitch"}
          </button>
          <button
            type="button"
            className={dirty ? "btn btn-primary is-dirty" : "btn btn-primary"}
            data-testid="recompute"
            onClick={() => recompute(settings)}
          >
            {dirty ? "Recompute cues · pending" : "Recompute cues"}
          </button>
        </div>
      </header>

      <main>
        <section className="intro" id="desk">
          <div className="intro-copy">
            <p className="eyebrow" data-reveal="">Live ops desk · human confirm</p>
            <h1 data-reveal="" data-d="1">Clear the cue.</h1>
            <p className="lede" data-reveal="" data-d="2">
              The pair reads this chat window and writes the mod note, the highlight, and the scene change. You confirm
              before any of it fires.
            </p>
            <p className="banner" data-testid="banner" role="status">
              {banner}
            </p>
            {connectNote ? <p className="banner">{connectNote}</p> : null}
            {dirty ? <p className="dirty is-pulse" role="status">Settings differ from the last pass. Press Recompute cues to rewrite the desk.</p> : null}
          </div>
          <SettingsBar settings={settings} dirty={dirty} onChange={setSettings} onTutorial={recompute} />
          <div className="desk">
            <Wire evidence={evidence} />
            <Cues
              passN={passN}
              line={result.line}
              active={active}
              below={result.below}
              heldBack={result.heldBack}
              log={log}
              prior={prior}
              confirmRequired={committed.confirmRequired}
              dropped={dropped}
              added={added}
              dismissedCount={dismissed.length}
              apiUp={apiUp}
              flash={flash}
              onFocus={setFocusId}
              onConfirm={(proposal) => {
                const at = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                setLog((items) => [
                  ...items.filter((item) => item.id !== proposal.id),
                  { id: proposal.id, title: proposal.title, draft: proposal.draft, gate: proposal.gate, at },
                ]);
              }}
              onDismiss={(id) => setDismissed((ids) => (ids.includes(id) ? ids : [...ids, id]))}
              onSave={(id, edit) => setEdits((current) => ({ ...current, [id]: edit }))}
              onRestoreDismissed={() => setDismissed([])}
              onReturn={(id) => setLog((items) => items.filter((item) => item.id !== id))}
            />
          </div>
        </section>
        <Story />
        <CueGuide />
        <CodexPanel sessionId={sessionId} onSession={onSession} />
        <Questions />
        <Band />
        <Close />
      </main>
    </>
  );
}
