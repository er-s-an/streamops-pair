import { SANDBOX_WINDOW, WINDOW_END } from "./data/window";
import { clockFrom } from "./format";

interface CodexProps {
  sessionId: string;
  onSession: (value: string) => void;
}

export function Story() {
  return (
    <section className="story" id="window">
      <div>
        <h2 data-reveal="">One recorded window</h2>
        <p data-reveal="" data-d="1">
          Live ops used to be one person at a console, with paper in reach. The cue stayed on the desk until they
          touched it. StreamOps Pair keeps that pause.
        </p>
        <p data-reveal="" data-d="2">
          The desk above holds one stretch from harborline, a fictional channel. It runs through Just Chatting, a promo
          link posted four times, a line that says kys, a 500-bit cheer, a long paste, a switch to VALORANT, a raid
          from northwall, five gift subs, a brb, a sub-goal mention, a short hostile pile, and a clutch chorus.
        </p>
        <p data-reveal="" data-d="3">
          {SANDBOX_WINDOW.messages.length} chat lines and {SANDBOX_WINDOW.events.length} mock EventSub events,{" "}
          {clockFrom(0)} to {clockFrom(WINDOW_END)}. Move sensitivity, the action types, or the confirm gate, then
          press Recompute cues. The pass reads this same window again.
        </p>
      </div>
      <figure data-reveal="photo" data-d="1">
        <img
          src="/media/master-room-1961.jpg"
          width={1600}
          height={1200}
          alt="A 1961 broadcast master-control room: one operator beside a console covered with monitors, knobs, and loose papers."
        />
        <figcaption>
          A master control room in 1961. The papers stay put until someone acts. Not our studio.{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Master_room_1961.jpg">
            “Master room 1961” by Project Kei, CC BY-SA 4.0, via Wikimedia Commons
          </a>
          . The file is unchanged. The page only darkens it in CSS.
        </figcaption>
      </figure>
    </section>
  );
}

export function CueGuide() {
  return (
    <section className="guide" id="cues">
      <h2 data-reveal="">Three cues, one gate</h2>
      <div>
        <article data-reveal="" data-d="1">
          <h3>Mod draft</h3>
          <p>
            A timeout, a delete, or a warn note, written out with the quote that triggered it. Confirm is the only
            step that would call Helix to remove a message or time a chatter out. This demo never makes that call. It
            logs the decision on the desk.
          </p>
        </article>
        <article data-reveal="" data-d="2">
          <h3>Highlight marker</h3>
          <p>
            A clock time and a short label, the kind of marker a live channel can drop on a broadcast. The sandbox has
            no live stream, so the marker stays on the slip. A single “CLIP THAT” with nothing around it does not
            score. A chorus does.
          </p>
        </article>
        <article data-reveal="" data-d="3">
          <h3>Scene cue</h3>
          <p>
            A target from a mock OBS list: Gameplay when the category changes, Raid thanks when a raid lands, BRB when
            the broadcaster says so. Confirm records the cue. obs-websocket is not connected, and the scene does not
            change.
          </p>
        </article>
      </div>
    </section>
  );
}

export function CodexPanel({ sessionId, onSession }: CodexProps) {
  return (
    <section className="codex" id="codex">
      <div>
        <h2 data-reveal="">Built with Codex</h2>
        <p data-reveal="" data-d="1">
          OpenAI Codex is the coding agent for this project: the scoring pass, the sandbox window, the confirm gate,
          and the Twitch OAuth path. The contest asks for the Session ID from that work.
        </p>
        <p data-reveal="" data-d="2">In Codex, run /status and copy the Session ID. Leave the field empty if you do not have it yet.</p>
      </div>
      <form data-ui data-reveal="" data-d="1" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="session-id">Codex Session ID</label>
        <input
          id="session-id"
          data-testid="session-id"
          value={sessionId}
          autoComplete="off"
          spellCheck={false}
          placeholder="Paste the id from /status"
          onChange={(event) => onSession(event.target.value)}
        />
        <p>
          {sessionId.trim()
            ? "Saved in this browser only, so you can paste it into Devpost later. It is not sent anywhere."
            : "Empty on purpose. This page will not invent a Session ID."}
        </p>
      </form>
    </section>
  );
}

const QUESTIONS: { q: string; a: string }[] = [
  {
    q: "Does confirm time anyone out?",
    a: "No. Confirm and Release write a line in the cleared log on this page. The demo does not call Helix to delete a message, time someone out, post a warning, or drop a stream marker.",
  },
  {
    q: "Why is this not my channel?",
    a: "The feed is a fixed sandbox window for the fictional channel harborline. Without a user token there is nothing honest to show from Twitch, and recompute needs a stable window. The EventSub rows in that file are mocks.",
  },
  {
    q: "What does the line actually do?",
    a: "Every signal has a score. Low keeps 76 and above, medium keeps 54 and above, high keeps 38 and above. Recompute runs the same messages and events through that line. Cues under it leave the desk. Turning an action type off withholds cues that already cleared the line.",
  },
  {
    q: "Where do I get a Session ID?",
    a: "In Codex, run /status and copy the Session ID. Paste it into the field on this page. The field starts empty. A value you save stays in this browser only.",
  },
  {
    q: "Will a scene cue touch OBS?",
    a: "No. The list is a mock program: Starting soon, Just Chatting, Gameplay, Raid thanks, BRB, Sub goal, Ending. Confirm records the cue. obs-websocket is not connected.",
  },
  {
    q: "What did Codex write?",
    a: "The scoring pass, the sandbox window, the confirm gate, the desk, and the Twitch OAuth path on the dev server. The Session ID from that work is what the submission asks for, and it is not filled in here.",
  },
];

export function Questions() {
  return (
    <section className="faq" id="questions">
      <h2 data-reveal="">Before a live channel</h2>
      <div>
        {QUESTIONS.map((item) => (
          <details key={item.q} name="pair-faq" data-reveal="" data-d="1">
            <summary>
              {item.q}
              <span className="plus" aria-hidden="true">
                <i />
                <i />
              </span>
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Band() {
  return (
    <figure className="band">
      <img
        src="/media/city-tv-control-room-doors-open-toronto.jpg"
        width={1920}
        height={1280}
        alt="The Citytv control room in Toronto in 2012: a wall of monitors above a row of desks where operators sit."
        loading="lazy"
      />
      <figcaption>
        Citytv control room, Toronto, 2012. A wall of monitors and people at the desk. Not a StreamOps Pair customer.{" "}
        <a href="https://commons.wikimedia.org/wiki/File:City_tv_control_room_Doors_Open_Toronto_2012_(1).jpg">
          “City tv control room Doors Open Toronto 2012 (1)” by Nayu Kim, CC BY 2.0, via Wikimedia Commons
        </a>
        . The file is unchanged.
      </figcaption>
    </figure>
  );
}

export function Close() {
  return (
    <footer className="closer">
      <h2 data-reveal="">
        StreamOps
        <br />
        Pair
      </h2>
      <p data-reveal="" data-d="1">A pair for live ops. The human clears the cue.</p>
      <p className="credits">
        Photographs: “Master room 1961” by Project Kei, CC BY-SA 4.0, via Wikimedia Commons. “City tv control room
        Doors Open Toronto 2012 (1)” by Nayu Kim from Toronto, Canada, CC BY 2.0, via Wikimedia Commons. Neither room
        is ours.
      </p>
    </footer>
  );
}
