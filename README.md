# Global Forklift Website

第一版叉车全球销售网站框架，已预留多语言、SEO、产品数据、询盘接口、商品 feed 和免费部署路径。

## 已完成

- 8 种语言路由：`en`、`es`、`fr`、`ja`、`de`、`pt`、`ko`、`ar`
- 阿拉伯语 RTL 文本支持，整体页面布局保持统一
- 首页、产品列表、产品详情、行业页、资源页、服务页、关于页、联系页
- SEO 组件：title、description、canonical、hreflang、Open Graph、Twitter Card
- 结构化数据：Organization、WebSite、Product、BreadcrumbList、FAQPage
- sitemap、robots、manifest
- 询盘表单和 Netlify Function：`/.netlify/functions/lead`
- 商品 feed：`/feeds/products.json`、`/feeds/google-merchant.csv`
- 接口说明：`/api/status.json`、`/api/lead.schema.json`
- 默认 `noindex` 保护，避免空内容被 Google 提前收录
- 本地新闻队列：业务员把材料放进 `news-queue/`，由 Codex 按设定时间发布到网站

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 上线前必须修改

1. 复制 `.env.example` 为 `.env`。
2. 把 `PUBLIC_SITE_URL` 改成正式域名。
3. 填写真实产品内容：`src/data/products.ts`。
4. 填写行业和资源内容：`src/data/content.ts`。
5. 替换公司信息：`src/data/site.ts`。
6. 如果要用 Google Merchant Center，先在 feed 中补真实价格、库存、图片和运费政策。
7. 由 Boss 在 WxPusher 获取个人 SPT，并仅在 Netlify 环境变量中设置 `WXPUSHER_SPT`。网站会把实时询盘和北京时间每天 09:10 的前一日 PV/UV 汇总推送到该 SPT 对应的账号。
8. `LEAD_WEBHOOK_URL` 仅作为未配置 WxPusher 时的旧接口兼容项。配置 `WXPUSHER_SPT` 后，询盘只走 Boss 的 WxPusher，不再调用旧 webhook。
9. 内容真实完整后，把 `PUBLIC_ALLOW_INDEXING=true`，再提交 Google Search Console。
10. 新闻运营流程使用 `news-queue/`。每个待发布新闻一个文件夹，必须包含 `article.md`，封面图可放在同目录并写成 `cover: ./cover.jpg`。
11. 需要批量排期时，让 Codex 为多个新闻文件夹写入 `publishedAt`，然后由定时任务执行 `npm run publish:queued-news`。

## 低成本部署建议

- Netlify：最省事，表单函数可直接用。
- Cloudflare Pages：适合静态站，询盘接口可改成 Workers。
- GitHub Pages：免费静态站，但询盘接口需要外部服务。

## Google 推广注意

不要在占位内容状态下开放索引。先补齐真实型号、参数、图片、证书、FAQ、交付条款、隐私政策，再开启 `PUBLIC_ALLOW_INDEXING=true`。

## 新闻自动发布

```bash
npm run publish:queued-news
```

规则：

- 扫描 `news-queue/` 下所有新闻包
- `publishedAt` 早于当前时间才会发布
- 成功后写入 `src/content/news/`，同时把新闻包移动到 `news-published/`
- 校验失败则移动到 `news-failed/`
