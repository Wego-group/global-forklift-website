import { getStore } from "@netlify/blobs";
import { escapeHtml, sendWxPusher } from "./_shared/wxpusher.mjs";

function chinaDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function previousChinaDate(now = new Date()) {
  return chinaDate(new Date(now.getTime() - 24 * 60 * 60 * 1_000));
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
    "<p style=\"color:#66736d\">数据按中国标准时间统计；已排除后台页面。</p>"
  ].join("");
}

async function loadEvents(date) {
  const store = getStore("traffic-events");
  const { blobs } = await store.list({ prefix: `${date}/` });
  const events = [];

  for (let index = 0; index < blobs.length; index += 50) {
    const batch = blobs.slice(index, index + 50);
    const values = await Promise.all(batch.map((blob) => store.get(blob.key, { type: "json" })));
    events.push(...values.filter(Boolean));
  }

  return { store, blobs, events };
}

async function deleteReportedEvents(store, blobs) {
  for (let index = 0; index < blobs.length; index += 50) {
    const batch = blobs.slice(index, index + 50);
    await Promise.all(batch.map((blob) => store.delete(blob.key)));
  }
}

export default async () => {
  const date = previousChinaDate();
  const { store, blobs, events } = await loadEvents(date);
  const report = aggregateTraffic(events);

  const delivery = await sendWxPusher({
    summary: `WEGO 网站日报｜${date}｜PV ${report.pageViews}｜UV ${report.visitors}`,
    content: buildDailyReport(date, report),
    url: process.env.PUBLIC_SITE_URL || "https://wegoforklift.com"
  });

  if (!delivery) {
    throw new Error("WXPUSHER_SPT is not configured");
  }

  await deleteReportedEvents(store, blobs);
};

export const config = {
  schedule: "10 1 * * *"
};
