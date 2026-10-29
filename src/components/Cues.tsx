import { useState } from "react";
import { OBS_SCENES } from "../data/window";
import { clockFrom, kindLabel } from "../format";
import type { ClearedCue, CueEdit, Proposal } from "../types";

interface CuesProps {
  passN: number;
  line: number;
  active: Proposal[];
  below: Proposal[];
  heldBack: Proposal[];
  log: ClearedCue[];
  prior: Proposal[] | null;
  confirmRequired: boolean;
  dropped: Proposal[];
  added: Proposal[];
  dismissedCount: number;
  apiUp: boolean;
  onConfirm: (proposal: Proposal) => void;
  onDismiss: (id: string) => void;
  onSave: (id: string, edit: CueEdit) => void;
  onRestoreDismissed: () => void;
  onReturn: (id: string) => void;
  onFocus: (id: string) => void;
}

export function Cues(props: CuesProps) {
  const armed = props.active.filter((cue) => cue.gate === "armed").length;
  const held = props.active.length - armed;
  const lines = receiptLines(props, armed, held);

  return (
    <div className="cues" data-ui>
      <div className="receipt" aria-live="polite" data-testid="receipt">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      {props.active.length === 0 ? (
        <p className="empty" data-testid="cue-list">
          {props.heldBack.length
            ? "No action type is on, so the desk is empty. Turn one on and recompute."
            : "Nothing cleared the line. Lower sensitivity or turn an action type back on, then recompute."}
        </p>
      ) : (
        <ol className="slip-list" data-testid="cue-list">
          {props.active.map((cue) => (
            <Slip
              key={`${cue.id}-${props.passN}`}
              cue={cue}
              fresh={props.added.some((item) => item.id === cue.id)}
              onConfirm={props.onConfirm}
              onDismiss={props.onDismiss}
              onSave={props.onSave}
              onFocus={props.onFocus}
            />
          ))}
        </ol>
      )}

      <section className="under">
        <h3>Under the line</h3>
        {props.below.length === 0 ? (
          <p>Nothing that is turned on sits under {props.line}.</p>
        ) : (
          <ul>
            {props.below.map((cue) => (
              <li key={cue.id}>
                <span>{cue.score}</span>
                {cue.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="log">
        <h3>Cleared on this desk</h3>
        {props.log.length === 0 ? (
          <p>Nothing cleared yet. A cue stays a draft until you confirm it.</p>
        ) : (
          <ul>
            {props.log.map((item) => (
              <li key={`${item.id}-${item.at}`}>
                <p>
                  {item.at}. {item.gate === "armed" ? "Released" : "Confirmed"} “{item.title}”. Logged here only. No
                  Helix request was sent.
                </p>
                <button type="button" className="btn btn-quiet" onClick={() => props.onReturn(item.id)}>
                  Bring back
                </button>
              </li>
            ))}
          </ul>
        )}
        {props.dismissedCount > 0 ? (
          <button type="button" className="btn btn-quiet" onClick={props.onRestoreDismissed}>
            Restore {props.dismissedCount} dismissed
          </button>
        ) : null}
      </section>
    </div>
  );
}

function receiptLines(props: CuesProps, armed: number, held: number): string[] {
  const where = props.apiUp
    ? "This pass ran in the page. POST /api/proposals on the dev server uses the same function."
    : "This pass ran in the page. The dev API is not running in this preview.";
  const gate = props.confirmRequired
    ? "Confirm is required. Every cue on the desk is held."
    : `Confirm is open. ${armed} armed at 72 or above. ${held} still held.`;
  const head = props.prior
    ? `Pass ${props.passN}. Line ${props.line}. ${props.active.length} on the desk.`
    : `First pass. Line ${props.line}. ${props.active.length} on the desk.`;
  const lines = [head, gate];
  if (props.prior) {
    const dropped = props.dropped.length ? `${props.dropped.length} dropped` : "Nothing dropped";
    const added = props.added.length ? `${props.added.length} new` : "Nothing new";
    lines.push(`${dropped}. ${added}. Names that fell under the line are listed below the slips.`);
  }
  if (props.heldBack.length) {
    const bits = (["mod", "highlight", "scene"] as const)
      .filter((kind) => props.heldBack.some((cue) => cue.kind === kind))
      .map((kind) => {
        const names = props.heldBack.filter((cue) => cue.kind === kind).map((cue) => cue.title);
        return `${kindLabel(kind)} off, so ${names.join(", ")} stayed back`;
      });
    lines.push(`${bits.join(". ")}.`);
  }
  lines.push(where);
  return lines;
}

function Slip({
  cue,
  fresh,
  onConfirm,
  onDismiss,
  onSave,
  onFocus,
}: {
  cue: Proposal;
  fresh: boolean;
  onConfirm: (proposal: Proposal) => void;
  onDismiss: (id: string) => void;
  onSave: (id: string, edit: CueEdit) => void;
  onFocus: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(cue.title);
  const [draft, setDraft] = useState(cue.draft);
  const [modAction, setModAction] = useState(cue.mod?.action ?? "timeout");
  const [modSeconds, setModSeconds] = useState(cue.mod?.seconds || 600);
  const [highlightLabel, setHighlightLabel] = useState(cue.highlight?.label ?? "");
  const [highlightClock, setHighlightClock] = useState(cue.highlight ? clockFrom(cue.highlight.tSec) : "");
  const [sceneTarget, setSceneTarget] = useState(cue.scene?.target ?? "Gameplay");

  function save() {
    onSave(cue.id, {
      title,
      draft,
      modAction,
      modSeconds,
      highlightLabel,
      highlightClock,
      sceneTarget,
    });
    setEditing(false);
  }

  return (
    <li
      className={fresh ? "slip is-new" : "slip"}
      onMouseEnter={() => onFocus(cue.id)}
      onFocus={() => onFocus(cue.id)}
    >
      <div className="slip-top">
        <p className="score">{cue.score}</p>
        <div>
          <h3>{cue.title}</h3>
          <p className={cue.gate === "armed" ? "stamp stamp-armed" : "stamp"}>
            {cue.gate === "armed" ? "Armed" : "Held"}
          </p>
        </div>
      </div>
      <p>{cue.reason}</p>
      {editing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          {cue.mod ? (
            <div className="edit-row">
              <label>
                Action
                <select
                  value={modAction}
                  onChange={(event) => {
                    const next = event.target.value as "timeout" | "delete" | "warn";
                    setModAction(next);
                    const verb = next === "timeout" ? "Timeout" : next === "delete" ? "Delete the message from" : "Warn";
                    setTitle(`${verb} ${cue.mod?.user ?? ""}`.trim());
                  }}
                >
                  <option value="timeout">Timeout</option>
                  <option value="delete">Delete message</option>
                  <option value="warn">Warn</option>
                </select>
              </label>
              {modAction === "timeout" ? (
                <label>
                  Seconds
                  <input
                    type="number"
                    min={1}
                    max={1209600}
                    value={modSeconds}
                    onChange={(event) => setModSeconds(Number(event.target.value))}
                  />
                </label>
              ) : null}
            </div>
          ) : null}
          {cue.highlight ? (
            <div className="edit-row">
              <label>
                Label
                <input value={highlightLabel} onChange={(event) => setHighlightLabel(event.target.value)} />
              </label>
              <label>
                Clock
                <input value={highlightClock} onChange={(event) => setHighlightClock(event.target.value)} />
              </label>
            </div>
          ) : null}
          {cue.scene ? (
            <label>
              Mock OBS scene
              <select value={sceneTarget} onChange={(event) => setSceneTarget(event.target.value)}>
                {OBS_SCENES.map((scene) => (
                  <option key={scene} value={scene}>
                    {scene}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            Draft
            <textarea rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <div className="actions">
            <button type="submit" className="btn btn-ink">
              Save edit
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="draft-label">Draft</p>
          <p>{cue.draft}</p>
          <div className="actions">
            <button type="button" className="btn btn-ink" onClick={() => onConfirm(cue)}>
              {cue.gate === "armed" ? "Release" : "Confirm"}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => onDismiss(cue.id)}>
              Dismiss
            </button>
          </div>
        </>
      )}
    </li>
  );
}
