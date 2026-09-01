const MAX_BODY_BYTES = 4096;
const RETENTION_SECONDS = 172800;

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redis(command) {
  const config = redisConfig();
  if (!config) return null;

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  if (!response.ok) throw new Error(`Traffic store rejected request: ${response.status}`);
  const result = await response.json();
  return result.result;
}

export function trafficStoreConfigured() {
  return Boolean(redisConfig());
}

export function chinaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function previousChinaDate(now = new Date()) {
  return chinaDate(new Date(now.getTime() - 24 * 60 * 60 * 1_000));
}

export function clean(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

export async function recordTraffic(date, event) {
  const key = `wego:traffic:${date}`;
  await redis(["LPUSH", key, JSON.stringify(event)]);
  await redis(["EXPIRE", key, RETENTION_SECONDS]);
}

export async function readTraffic(date) {
  const key = `wego:traffic:${date}`;
  const values = await redis(["LRANGE", key, "0", "-1"]);
  return (values || []).map((value) => JSON.parse(value)).filter(Boolean);
}

export async function clearTraffic(date) {
  await redis(["DEL", `wego:traffic:${date}`]);
}

export function parsePageviewBody(request) {
  return request.text().then((raw) => {
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return null;
    try {
      return JSON.parse(raw || "{}");
    } catch {
      return null;
    }
  });
}
