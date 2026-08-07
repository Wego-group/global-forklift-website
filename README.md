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
10. 新闻运营流程使用 `news-queue/`。每个待发布新闻一个文件夹，文件夹名就是发布日期，格式必须为 `YYYY-MM-DD`。
11. 每个新闻文件夹必须包含 `article.md`，封面图可放在同目录并写成 `cover: ./cover.jpg`。
12. 所有新闻统一在北京时间 `22:00` 发布，`publishedAt` 和 `updatedAt` 由脚本自动生成，不需要人工填写。
13. `news-queue/` 中的每篇 `article.md` 必须完整填写 8 种语言字段，不能用英文直接重复覆盖其他语言；`seoTitle`、`seoDescription`、`excerpt`、`body` 都要随语言本地化。
14. 所有新闻正文固定采用 5 段结构：`产品/买家定位`、`实际应用场景`、`关键配置项`、`询价前确认项`、`出口/交付与售后要点`。不能只写 1 到 2 段简介。
15. 新闻内容必须按 Google 搜索的“以用户为先”逻辑撰写：标题聚焦一个明确产品/场景关键词，首段直接回答买家问题，正文写真实应用、配置、采购确认和交付信息，避免关键词堆砌。
16. 电脑关机也能按时发布：GitHub Actions 从每天北京时间 `22:17` 开始自动执行 `npm run publish:queued-news`，并在后续设置多个云端补偿时段；成功后自动提交并推送到 `main`。
17. 业务侧电脑只负责把 `news-queue/日期文件夹` 和素材推到 GitHub，不再承担到点发布动作。
18. 入队前必须运行 `npm run validate:queued-news`。系统会强制检查 8 语种完整性、5 段正文、正文信息量、段落重复、跨文章模板重复、SEO 标题与描述长度、永久链接、关联产品分类和封面尺寸。
19. 发布时封面会自动转为 WebP，限制在 1920x1440 内并控制文件体积；新闻结构化数据会自动加入绝对图片地址、语言、日期、规范页面和 WEGO 发布机构 Logo。
20. 新闻详情页会按文章主题自动补充本地化技术选型清单，覆盖载荷中心、通道尺寸、班次与充电、地面与轮胎、排放、属具、日检和出口准备等采购维度。

## 低成本部署建议

- Netlify：最省事，表单函数可直接用。
- Cloudflare Pages：适合静态站，询盘接口可改成 Workers。
- GitHub Pages：免费静态站，但询盘接口需要外部服务。

## Google 推广注意

不要在占位内容状态下开放索引。先补齐真实型号、参数、图片、证书、FAQ、交付条款、隐私政策，再开启 `PUBLIC_ALLOW_INDEXING=true`。

## 新闻自动发布

```bash
npm run validate:queued-news
npm run publish:queued-news
```

规则：

- 扫描 `news-queue/` 下所有新闻包
- 文件夹名必须是发布日期，格式为 `YYYY-MM-DD`
- 所有新闻固定在北京时间 `22:00` 发布
- GitHub Actions 从每天北京时间 `22:17` 开始执行发布脚本，并设置多个后续补偿触发，因此单次云端 Runner 故障不会直接造成漏发
- 成功后写入 `src/content/news/`，同时把新闻包移动到 `news-published/`
- 校验失败则移动到 `news-failed/`
- 文章在入队前就应完成 SEO 打磨和多语言本地化，而不是发布后再补
- 云端工作流先执行强制 SEO 校验，全部通过后才允许发布
- 上传的 JPG、PNG 或 WebP 封面都会在发布时统一生成轻量 WebP，不把原始大图直接放到线上页面

给另一台发布电脑上的 Codex 的固定指令，已经写在 [news-queue/README.md](/Users/mike_cheng/Desktop/global-forklift-website/news-queue/README.md)。
