const WXPUSHER_ENDPOINT = "https://wxpusher.zjiecode.com/api/send/message/simple-push";
const REQUEST_TIMEOUT_MS = 8_000;

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendWxPusher({ summary, content, url }) {
  const spt = process.env.WXPUSHER_SPT?.trim();
  if (!spt) return null;

  const pushResponse = await fetch(WXPUSHER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "wego-forklift-notification"
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      content,
      summary: String(summary || "WEGO 网站通知").slice(0, 100),
      contentType: 2,
      spt,
      ...(url ? { url } : {})
    })
  });

  const result = await pushResponse.json().catch(() => null);
  if (!pushResponse.ok || result?.code !== 1000 || result?.success !== true) {
    throw new Error(`WxPusher rejected the message: ${result?.msg || pushResponse.status}`);
  }

  return { provider: "wxpusher" };
}
