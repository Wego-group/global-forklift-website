Place each scheduled news package in its own folder under `news-queue/`.

Required structure:

```text
news-queue/
  2026-08-08-diesel-shipment/
    article.md
    cover.jpg
```

Rules:

1. `article.md` must use the same frontmatter schema as files in `src/content/news/`.
2. If the cover image lives inside the package folder, set `cover: ./cover.jpg`.
3. `publishedAt` controls when the package goes live. Keep it in Beijing time with an offset, for example `2026-08-08T10:00:00+08:00`.
4. The auto publisher ignores future packages, publishes due packages, moves success cases to `news-published/`, and moves invalid packages to `news-failed/`.
5. The folder name is only for queue management. The real page URL comes from `permalink`.

Recommended workflow for the news operator:

1. Put raw materials in a new folder under `news-queue/`.
2. Ask Codex to turn the materials into a valid `article.md` and confirm the publish time.
3. Leave the folder in place. The scheduled publisher will process it automatically.
