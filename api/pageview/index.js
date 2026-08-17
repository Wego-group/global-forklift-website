import { kv } from "@vercel/kv";

const MAX_BODY_BYTES = 4096;

function chinaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function clean(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

async function parseBody(request) {
  const contentType = request.headers.get("content-type") || "";
  const raw = await request.text();

  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(raw);
  }

  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
}

export async function POST(request) {
  if (!sameOrigin(request)) {
    return new Response(null, { status: 403 });
  }

  const payload = await parseBody(request);
  if (!payload) {
    return new Response(null, { status: 413 });
  }

  if (!payload || typeof payload !== "object") {
    return new Response(null, { status: 400 });
  }

  const path = clean(payload.path, 500);
  const visitorId = clean(payload.visitor_id, 80);
  if (!path.startsWith("/") || path.startsWith("/admin/") || !visitorId) {
    return new Response(null, { status: 204 });
  }

  const referrer = clean(payload.referrer, 200);
  const event = {
    path,
    visitor_id: visitorId,
    language: clean(payload.language, 12),
    referrer,
    country: "Unknown",
    recorded_at: new Date().toISOString()
  };

  const key = `traffic:${chinaDate()}:${Date.now()}-${crypto.randomUUID()}`;
  await kv.set(key, JSON.stringify(event));

  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
