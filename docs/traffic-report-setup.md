# Vercel Daily Traffic Report

The production site is served by Vercel, so the daily report uses the Vercel
API routes rather than the Netlify Scheduled Function.

In the Vercel project, connect a Redis/KV store and add these environment
variables for Production:

- `WXPUSHER_SPT`: the boss's WxPusher SPT.
- `KV_REST_API_URL`: the Redis/KV REST URL.
- `KV_REST_API_TOKEN`: the Redis/KV REST token.
- `PUBLIC_SITE_URL`: `https://wegoforklift.com`.
- `CRON_SECRET`: a long random value that protects the report endpoint.

The browser sends one lightweight page-view event to `/api/pageview`. The
server records the path, visitor id, language, referrer, and Vercel country
code in a date-keyed Redis list. The Vercel Cron entry in `vercel.json` calls
`/api/daily-traffic-report` every day at `01:10 UTC`, which is 09:10 Beijing
time. It sends a WxPusher HTML message containing PV, UV, top pages,
countries/regions, and languages, then deletes only the successfully reported
day's records.

The Netlify equivalents remain in `netlify/functions/` for compatibility if
the deployment is moved back to Netlify. Do not commit any SPT, Redis token,
or cron secret.
