Place each scheduled news package in its own folder under `news-queue/`.

Required structure:

```text
news-queue/
  2026-08-08/
    article.md
    cover.jpg
```

Rules:

1. `article.md` must use the same frontmatter schema as files in `src/content/news/`.
2. If the cover image lives inside the package folder, set `cover: ./cover.jpg`.
3. The folder name is the publish date and must be exactly `YYYY-MM-DD`.
4. All queued news uses the same fixed publish time: Beijing time `22:00:00+08:00`.
5. `article.md` no longer needs `publishedAt` or `updatedAt`. The publisher writes both automatically from the folder date.
6. The auto publisher ignores future packages, publishes due packages, moves success cases to `news-published/`, and moves invalid packages to `news-failed/`.
7. The real page URL comes from `permalink`, not from the folder name.
8. Every package must be written as people-first SEO content: one clear product/search topic, a practical lead paragraph, real application details, and no keyword stuffing.
9. All eight languages in `title`, `excerpt`, `seoTitle`, `seoDescription`, and `body` must be genuinely localized. Do not copy the English text into the other language fields.

Recommended workflow for the news operator:

1. Create a new folder under `news-queue/` using the publish date as the folder name, for example `2026-08-08`.
2. Put the text materials and images into that folder.
3. Ask Codex to turn the materials into a valid `article.md` using the local template and to localize all eight language fields.
4. Leave the folder in place. The publisher will release it automatically at `22:00` Beijing time on that date.

Message to send to the Codex on the publishing computer:

```text
Project path: /Users/mike_cheng/Desktop/global-forklift-website

Rule:
1. News source only comes from news-queue/.
2. Each subfolder name is the publish date in YYYY-MM-DD format.
3. All news must use the same fixed publish time: 22:00:00+08:00.
4. Do not ask me for GitHub steps. You should process the package, publish it, commit it, and push it yourself.
5. article.md must follow news-queue/_template/article.md.
6. publishedAt and updatedAt are generated automatically from the folder name. Do not require me to write them manually.
7. Every news package must be polished for Google-friendly, people-first SEO before publishing.
8. Every language field must be localized. Do not repeat the English copy in the non-English fields.

When I give you a folder in news-queue/, you must:
1. Read the text and images in that folder.
2. Create or update article.md in that folder.
3. Run npm run publish:queued-news.
4. If content is due, confirm it moved into src/content/news/ and public/images/news/.
5. Commit and push to main.
```
