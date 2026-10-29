import { randomBytes } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { SANDBOX_WINDOW } from "../data/window";
import { parseSettings, runPass } from "../engine/propose";
import type { TwitchStatus } from "../types";

interface Session {
  token: string;
  login: string;
  userId: string;
}

const sessions = new Map<string, Session>();
const states = new Map<string, number>();

const SCOPES = [
  "user:read:chat",
  "user:write:chat",
  "moderator:manage:chat_messages",
  "moderator:manage:banned_users",
  "channel:manage:broadcast",
].join(" ");

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function cookies(req: IncomingMessage): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (req.headers.cookie || "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (!key) continue;
    out[key] = decodeURIComponent(rest.join("="));
  }
  return out;
}

function redirectUri(req: IncomingMessage, env: Record<string, string>): string {
  if (env.TWITCH_REDIRECT_URI) return env.TWITCH_REDIRECT_URI;
  const host = req.headers.host || "127.0.0.1:5173";
  const proto = (req.headers["x-forwarded-proto"] as string) || "http";
  return `${proto}://${host}/oauth/callback`;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > 20_000) throw new Error("body_too_large");
    chunks.push(buf);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw) as unknown;
}

function currentSession(req: IncomingMessage): Session | null {
  const sid = cookies(req).pair_sid;
  if (!sid) return null;
  return sessions.get(sid) ?? null;
}

function statusFor(env: Record<string, string>, session: Session | null): TwitchStatus {
  const clientIdSet = Boolean(env.TWITCH_CLIENT_ID);
  const secretSet = Boolean(env.TWITCH_CLIENT_SECRET);
  if (session) {
    return {
      mode: "connected",
      clientIdSet,
      secretSet,
      login: session.login,
      userId: session.userId,
      eventsub: "not-subscribed",
      note: `A Twitch user token for ${session.login} is stored in this dev server's memory. EventSub is not subscribed, so the feed is still the sandbox window. Nothing here is a live viewer count.`,
    };
  }
  if (clientIdSet && secretSet) {
    return {
      mode: "credentials",
      clientIdSet,
      secretSet,
      login: null,
      userId: null,
      eventsub: "not-subscribed",
      note: "Twitch app credentials are on the server, and there is still no user token. The feed remains the sandbox window. Viewer counts are left out on purpose.",
    };
  }
  return {
    mode: "sandbox",
    clientIdSet,
    secretSet,
    login: null,
    userId: null,
    eventsub: "not-subscribed",
    note: "No Twitch token is loaded. This feed is a recorded window from the fictional channel harborline, not a live room. Viewer counts are left out on purpose.",
  };
}

export function eventSubPlan(userId: string) {
  return {
    subscribed: false,
    websocket: "wss://eventsub.wss.twitch.tv/ws",
    note: "These are the Helix subscription bodies for a later socket. This demo does not open wss://eventsub.wss.twitch.tv/ws and does not POST them.",
    subscriptions: [
      "channel.chat.message",
      "channel.cheer",
      "channel.raid",
      "channel.subscribe",
      "channel.update",
      "stream.online",
    ].map((type) => ({
      type,
      version: type === "channel.update" ? "2" : "1",
      condition:
        type === "channel.raid"
          ? { to_broadcaster_user_id: userId }
          : type === "channel.chat.message"
            ? { broadcaster_user_id: userId, user_id: userId }
            : { broadcaster_user_id: userId },
      transport: { method: "websocket", session_id: "<welcome session_id>" },
    })),
  };
}

export function streamopsApi(env: Record<string, string>): Plugin {
  return {
    name: "streamops-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await route(req, res, env);
          if (!handled) next();
        } catch {
          if (!res.headersSent) send(res, 500, { error: "server_error" });
        }
      });
    },
  };
}

async function route(req: IncomingMessage, res: ServerResponse, env: Record<string, string>): Promise<boolean> {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const path = url.pathname;

  if (path === "/api/health" && req.method === "GET") {
    send(res, 200, { ok: true, product: "streamops-pair", feed: "sandbox" });
    return true;
  }

  if (path === "/api/twitch/status" && req.method === "GET") {
    send(res, 200, statusFor(env, currentSession(req)));
    return true;
  }

  if (path === "/api/twitch/oauth/start" && req.method === "GET") {
    const clientId = env.TWITCH_CLIENT_ID;
    const secret = env.TWITCH_CLIENT_SECRET;
    if (!clientId || !secret) {
      send(res, 400, {
        error: "missing_credentials",
        message: "This server has no TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET. The sandbox stays on. The README lists the OAuth and EventSub steps.",
      });
      return true;
    }
    const state = randomBytes(16).toString("hex");
    states.set(state, Date.now());
    res.setHeader("Set-Cookie", `pair_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
    const authorize = new URL("https://id.twitch.tv/oauth2/authorize");
    authorize.searchParams.set("client_id", clientId);
    authorize.searchParams.set("redirect_uri", redirectUri(req, env));
    authorize.searchParams.set("response_type", "code");
    authorize.searchParams.set("scope", SCOPES);
    authorize.searchParams.set("state", state);
    send(res, 200, { url: authorize.toString() });
    return true;
  }

  if (path === "/oauth/callback" && req.method === "GET") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const expected = cookies(req).pair_state;
    const fresh = state && expected && state === expected && states.has(state);
    if (!fresh || !code || !env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) {
      res.statusCode = 302;
      res.setHeader("Location", "/?twitch=error");
      res.end();
      return true;
    }
    states.delete(state);
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.TWITCH_CLIENT_ID,
        client_secret: env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri(req, env),
      }),
    });
    if (!tokenRes.ok) {
      res.statusCode = 302;
      res.setHeader("Location", "/?twitch=error");
      res.end();
      return true;
    }
    const tokenBody = (await tokenRes.json()) as { access_token?: string };
    if (!tokenBody.access_token) {
      res.statusCode = 302;
      res.setHeader("Location", "/?twitch=error");
      res.end();
      return true;
    }
    const userRes = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-Id": env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${tokenBody.access_token}`,
      },
    });
    if (!userRes.ok) {
      res.statusCode = 302;
      res.setHeader("Location", "/?twitch=error");
      res.end();
      return true;
    }
    const userBody = (await userRes.json()) as { data?: { id: string; login: string }[] };
    const user = userBody.data?.[0];
    if (!user) {
      res.statusCode = 302;
      res.setHeader("Location", "/?twitch=error");
      res.end();
      return true;
    }
    const sid = randomBytes(16).toString("hex");
    sessions.set(sid, { token: tokenBody.access_token, login: user.login, userId: user.id });
    res.statusCode = 302;
    res.setHeader("Set-Cookie", [
      `pair_sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      "pair_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    ]);
    res.setHeader("Location", "/?twitch=connected");
    res.end();
    return true;
  }

  if (path === "/api/twitch/eventsub-plan" && req.method === "GET") {
    const session = currentSession(req);
    if (!session) {
      send(res, 401, {
        error: "no_user_token",
        message: "Connect Twitch first. The plan is not subscribed either way.",
      });
      return true;
    }
    send(res, 200, eventSubPlan(session.userId));
    return true;
  }

  if (path === "/api/proposals" && req.method === "POST") {
    const body = await readJson(req);
    const settings = parseSettings(body);
    if (!settings) {
      send(res, 400, {
        error: "bad_settings",
        message: "Send sensitivity, confirmRequired, and enabled.mod, enabled.highlight, enabled.scene.",
      });
      return true;
    }
    const pass = runPass(SANDBOX_WINDOW, settings);
    send(res, 200, { source: "dev-server", channel: SANDBOX_WINDOW.channel, ...pass });
    return true;
  }

  return false;
}
