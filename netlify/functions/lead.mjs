import { randomUUID } from "node:crypto";
import { escapeHtml, sendWxPusher } from "../lib/wxpusher.mjs";

const REQUEST_TIMEOUT_MS = 8_000;

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept"
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(body)
  };
}

async function parseBody(event) {
  const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
  const raw = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : event.body || "";

  if (contentType.includes("application/json")) {
    return JSON.parse(raw || "{}");
  }

  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\0/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function cleanLead(payload) {
  return {
    name: cleanText(payload.name, 120),
    company: cleanText(payload.company, 160),
    email: cleanText(payload.email, 254),
    phone: cleanText(payload.phone, 80),
    country: cleanText(payload.country, 120),
    product: cleanText(payload.product, 160),
    quantity: cleanText(payload.quantity, 40),
    message: cleanText(payload.message, 4_000),
    language: cleanText(payload.language, 10),
    source_path: cleanText(payload.source_path, 500),
    inquiry_type: cleanText(payload.inquiry_type || "general", 80),
    preferred_contact: cleanText(payload.preferred_contact, 80),
    submitted_at: new Date().toISOString()
  };
}

function createInquiryId() {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(new Date())
    .replaceAll("-", "");
  return `WG-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function sourceUrl(path) {
  if (!path || !path.startsWith("/")) return path;
  try {
    return new URL(path, process.env.PUBLIC_SITE_URL || "https://wegoforklift.com").toString();
  } catch {
    return path;
  }
}

function buildWxPusherContent(inquiryId, lead) {
  const submittedAt = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: false
  }).format(new Date(lead.submitted_at));

  const fields = [
    ["询盘编号", inquiryId],
    ["产品", lead.product || "未指定"],
    ["数量", lead.quantity || "未填写"],
    ["客户", lead.name],
    ["公司", lead.company || "未填写"],
    ["国家/地区", lead.country || "未填写"],
    ["电话/WhatsApp", lead.phone || "未填写"],
    ["邮箱", lead.email || "未填写"],
    ["首选联系方式", lead.preferred_contact || "未填写"],
    ["询盘类型", lead.inquiry_type],
    ["页面语言", lead.language || "未填写"],
    ["来源页面", sourceUrl(lead.source_path) || "未记录"],
    ["提交时间", `${submittedAt}（中国时间）`]
  ];

  const details = fields
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}：</strong>${escapeHtml(value)}</p>`)
    .join("");

  return `<h2>WEGO 新询盘</h2>${details}<hr><p><strong>客户留言：</strong></p><p>${escapeHtml(lead.message).replaceAll("\n", "<br>")}</p>`;
}

async function sendInquiryNotification(inquiryId, lead) {
  return sendWxPusher({
    summary: `WEGO 新询盘｜${lead.product || lead.inquiry_type || "网站询盘"}`,
    content: buildWxPusherContent(inquiryId, lead),
    url: sourceUrl(lead.source_path) || process.env.PUBLIC_SITE_URL || "https://wegoforklift.com"
  });
}

async function sendWebhook(inquiryId, lead) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!webhookUrl) return null;

  const webhookResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "wego-forklift-lead-endpoint"
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      type: "forklift_lead",
      inquiry_id: inquiryId,
      lead
    })
  });

  if (!webhookResponse.ok) {
    throw new Error(`Lead webhook failed: ${webhookResponse.status}`);
  }

  return { provider: "webhook" };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return response(204, {});
  }

  if (event.httpMethod !== "POST") {
    return response(405, { ok: false, error: "Method not allowed" });
  }

  try {
    const payload = await parseBody(event);

    if (payload.company_website) {
      return response(200, { ok: true, spam: true });
    }

    const lead = cleanLead(payload);
    if (!lead.name || !lead.message || (!lead.email && !lead.phone)) {
      return response(422, {
        ok: false,
        error: "name, message, and either email or phone are required"
      });
    }

    const inquiryId = createInquiryId();
    const wxPusherConfigured = Boolean(process.env.WXPUSHER_SPT?.trim());
    const webhookConfigured = Boolean(process.env.LEAD_WEBHOOK_URL?.trim());
    const deliver = wxPusherConfigured ? sendInquiryNotification : webhookConfigured ? sendWebhook : null;

    if (deliver) {
      try {
        const delivery = await deliver(inquiryId, lead);
        if (!delivery) throw new Error("Lead delivery is not configured");

        return response(200, {
          ok: true,
          mode: delivery.provider,
          inquiry_id: inquiryId
        });
      } catch (error) {
        console.error("Lead delivery failed", {
          inquiryId,
          provider: wxPusherConfigured ? "wxpusher" : "webhook",
          error: error instanceof Error ? error.message : "Lead delivery failed"
        });
        return response(502, { ok: false, error: "Lead delivery failed", inquiry_id: inquiryId });
      }
    }

    return response(200, {
      ok: true,
      mode: "dry-run",
      message: "Set WXPUSHER_SPT or LEAD_WEBHOOK_URL to route submissions.",
      inquiry_id: inquiryId
    });
  } catch (error) {
    return response(400, {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid request"
    });
  }
}
