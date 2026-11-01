import { useEffect, useMemo, useRef } from "react";
import { SANDBOX_WINDOW, WINDOW_END } from "../data/window";
import { clockFrom, roleLabel } from "../format";
import type { ChatLine, WireEvent } from "../types";

interface WireProps {
  evidence: string[];
}

type Row =
  | { key: string; t: number; kind: "chat"; line: ChatLine }
  | { key: string; t: number; kind: "event"; event: WireEvent };

export function Wire({ evidence }: WireProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const evidenceKey = evidence.join("|");
  const rows = useMemo<Row[]>(() => {
    const chat = SANDBOX_WINDOW.messages.map((line) => ({
      key: line.id,
      t: line.tSec,
      kind: "chat" as const,
      line,
    }));
    const events = SANDBOX_WINDOW.events.map((event) => ({
      key: event.id,
      t: event.tSec,
      kind: "event" as const,
      event,
    }));
    return [...chat, ...events].sort((a, b) => a.t - b.t);
  }, []);

  useEffect(() => {
    const root = scroller.current;
    const first = evidence[0];
    if (!root || !first) return;
    const el = document.getElementById(`wire-${first}`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.offsetTop - 12;
    root.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }, [evidenceKey, evidence]);

  return (
    <div className="wire" data-ui ref={scroller}>
      <div className="wire-head">
        <div className="wire-title">
          <h2>{SANDBOX_WINDOW.channel}</h2>
          <span className="wire-pill">Recorded window</span>
        </div>
        <p>
          {SANDBOX_WINDOW.title}. {SANDBOX_WINDOW.messages.length} chat lines and {SANDBOX_WINDOW.events.length} mock
          EventSub events, {clockFrom(0)} to {clockFrom(WINDOW_END)}.
        </p>
      </div>
      <ol className="wire-list">
        {rows.map((row) =>
          row.kind === "event" ? (
            <li key={row.key} id={`wire-${row.key}`} className={evidence.includes(row.key) ? "event-row is-evidence" : "event-row"}>
              <time dateTime={clockFrom(row.t)}>{clockFrom(row.t)}</time>
              <p>
                <span className="event-tag">EventSub</span>
                <span>{row.event.summary}</span>
              </p>
            </li>
          ) : (
            <li
              key={row.key}
              id={`wire-${row.key}`}
              className={
                row.line.role === "broadcaster"
                  ? evidence.includes(row.key)
                    ? "msg msg-broad is-evidence"
                    : "msg msg-broad"
                  : evidence.includes(row.key)
                    ? "msg is-evidence"
                    : "msg"
              }
            >
              <time dateTime={clockFrom(row.t)}>{clockFrom(row.t)}</time>
              <p>
                <strong>
                  {row.line.user}
                  {roleLabel(row.line.role) ? `, ${roleLabel(row.line.role)}` : ""}
                </strong>
                <span>{row.line.text}</span>
              </p>
            </li>
          ),
        )}
      </ol>
    </div>
  );
}
