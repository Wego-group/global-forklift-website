import { escapeHtml, sendWxPusher } from "../../netlify/lib/wxpusher.mjs";
import { clearTraffic, previousChinaDate, readTraffic, trafficStoreConfigured } from "../_lib/traffic.js";

function topEntries(values, limit = 5) {
  const counts = new Map();
  for (const value of values) {
    const label = value || "Unknown";
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
}

function aggregateTraffic(events) {
  return {
    pageViews: events.length,
    visitors: new Set(events.map((event) => event.visitor_id).filter(Boolean)).size,
    topPages: topEntries(events.map((event) => event.path)),
    topCountries: topEntries(events.map((event) => event.country)),
    topLanguages: topEntries(events.map((event) => event.language))
  };
}

function rows(items) {
  if (!items.length) return "<p>暂无数据</p>";
  return `<ol>${items.map(([label, count]) => `<li>${escapeHtml(label)}：<strong>${count}</strong></li>`).join("")}</ol>`;
}

function buildReport(date, report) {
  return [
    `<h2>WEGO 网站日报｜${escapeHtml(date)}</h2>`,
    `<p><strong>页面浏览量（PV）：</strong>${report.pageViews}</p>`,
    `<p><strong>独立访客（UV）：</strong>${report.visitors}</p>`,
    "<hr>",
    "<h3>访问最多的页面</h3>", rows(report.topPages),
    "<h3>访客国家/地区</h3>", rows(report.topCountries),
    "<h3>页面语言</h3>", rows(report.topLanguages),
    "<p style=\"color:#66736d\">数据按中国标准时间统计；已排除后台页面。</p>"
  ].join("");
}

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!trafficStoreConfigured()) return new Response("Traffic store is not configured", { status: 503 });
  const date = previousChinaDate();
  const events = await readTraffic(date);
  const report = aggregateTraffic(events);
  const delivery = await sendWxPusher({
    summary: `WEGO 网站日报｜${date}｜PV ${report.pageViews}｜UV ${report.visitors}`,
    content: buildReport(date, report),
    url: process.env.PUBLIC_SITE_URL || "https://wegoforklift.com"
  });
  if (!delivery) return new Response("WXPUSHER_SPT is not configured", { status: 503 });
  await clearTraffic(date);
  return Response.json({ ok: true, date, ...report });
}
