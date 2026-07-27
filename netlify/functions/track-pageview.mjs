import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";

const MAX_BODY_BYTES = 4_096;

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

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  if (!sameOrigin(request)) {
    return new Response(null, { status: 403 });
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
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
    country: clean(context?.geo?.country?.name || context?.geo?.country?.code || "Unknown", 100),
    recorded_at: new Date().toISOString()
  };

  const key = `${chinaDate()}/${Date.now()}-${randomUUID()}`;
  const store = getStore({ name: "traffic-events", consistency: "strong" });
  await store.setJSON(key, event);

  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
};
