import assert from "node:assert/strict";
import test from "node:test";
import { aggregateTraffic, buildDailyReport } from "../../netlify/functions/daily-traffic-report.mjs";

test("aggregates page views, visitors, pages, countries, and languages", () => {
  const report = aggregateTraffic([
    { visitor_id: "a", path: "/en/", country: "Ghana", language: "en" },
    { visitor_id: "a", path: "/en/products/", country: "Ghana", language: "en" },
    { visitor_id: "b", path: "/en/", country: "Chile", language: "en" }
  ]);

  assert.equal(report.pageViews, 3);
  assert.equal(report.visitors, 2);
  assert.deepEqual(report.topPages[0], ["/en/", 2]);
  assert.deepEqual(report.topCountries[0], ["Ghana", 2]);
  assert.deepEqual(report.topLanguages[0], ["en", 3]);
});

test("renders escaped labels in the daily report", () => {
  const html = buildDailyReport("2026-07-26", {
    pageViews: 1,
    visitors: 1,
    topPages: [["/<script>", 1]],
    topCountries: [["Ghana", 1]],
    topLanguages: [["en", 1]]
  });

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
