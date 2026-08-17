import { kv } from "@vercel/kv";
import { escapeHtml, sendWxPusher } from "../../netlify/lib/wxpusher.mjs";

function chinaDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function previousChinaDate(now = new Date()) {
  return chinaDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
}

function topEntries(values, limit = 5) {
  const counts = new Map();
  for (const value of values) {
    const label = value || "Unknown";
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

export function aggregateTraffic(events) {
  return {
    pageViews: events.length,
    visitors: new Set(events.map((event) => event.visitor_id).filter(Boolean)).size,
    topPages: topEntries(events.map((event) => event.path)),
    topCountries: topEntries(events.map((event) => event.country)),
    topLanguages: topEntries(events.map((event) => event.language || "Unknown"))
  };
}

function renderRows(rows) {
  if (!rows.length) return "<p>暂无数据</p>";
  return `<ol>${rows
    .map(([label, count]) => `<li>${escapeHtml(label)}：<strong>${count}</strong></li>`)
    .join("")}</ol>`;
}

export function buildDailyReport(date, report) {
  return [
    `<h2>WEGO 网站日报｜${escapeHtml(date)}</h2>`,
    `<p><strong>页面浏览量（PV）：</strong>${report.pageViews}</p>`,
    `<p><strong>独立访客（UV）：</strong>${report.visitors}</p>`,
    "<hr>",
    "<h3>访问最多的页面</h3>",
    renderRows(report.topPages),
    "<h3>访客国家/地区</h3>",
    renderRows(report.topCountries),
    "<h3>页面语言</h3>",
    renderRows(report.topLanguages),
    '<p style="color:#66736d">数据按中国标准时间统计；已排除后台页面。</p>'
  ].join("");
}

async function loadEvents(date) {
  const pattern = `traffic:${date}:*`;
  const keys = await kv.keys(pattern);
  if (!keys.length) return { keys, events: [] };

  const pipe = kv.pipeline();
  for (const key of keys) {
    pipe.get(key);
  }
  const values = await pipe.exec();
  const events = values
    .filter(Boolean)
    .map((v) => JSON.parse(v));

  return { keys, events };
}

async function deleteReportedEvents(keys) {
  if (!keys.length) return;
  const pipe = kv.pipeline();
  for (const key of keys) {
    pipe.del(key);
  }
  await pipe.exec();
}

export async function GET() {
  try {
    const date = previousChinaDate();
    const { keys, events } = await loadEvents(date);
    const report = aggregateTraffic(events);

    const delivery = await sendWxPusher({
      summary: `WEGO 网站日报｜${date}｜PV ${report.pageViews}｜UV ${report.visitors}`,
      content: buildDailyReport(date, report),
      url: process.env.PUBLIC_SITE_URL || "https://wegoforklift.com"
    });

    if (!delivery) {
      throw new Error("WXPUSHER_SPT is not configured");
    }

    await deleteReportedEvents(keys);

    return new Response(JSON.stringify({ ok: true, date, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
