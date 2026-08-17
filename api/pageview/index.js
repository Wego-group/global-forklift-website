const MAX_BODY_BYTES = 4096;

async function parseBody(request) {
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return null;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return JSON.parse(raw);
  return Object.fromEntries(new URLSearchParams(raw).entries());
}

export async function POST(request) {
  const payload = await parseBody(request);
  if (!payload || typeof payload !== "object") {
    return new Response(null, { status: 400 });
  }

  return new Response(null, { status: 204 });
}
